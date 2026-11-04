"""Reproducible ProximityGraphs-backed scene export and static editorial figures.

Run from repository root: python scripts/export_scenes.py
Synthetic point sets only; no water, habitat, or radio field data.
"""
from __future__ import annotations

import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import proximitygraphs as pg
from matplotlib.patches import Circle, Polygon

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "site" / "data"
ASSETS = ROOT / "site" / "assets"
LIBRARY_COMMIT = "d1a216d7255cbebea68dcaad6a97382168a3ec55"

WATER = np.array([
    [.13,.22],[.31,.16],[.53,.22],[.80,.15],[.17,.48],[.42,.45],
    [.68,.43],[.87,.64],[.29,.78],[.59,.82],[.10,.82],[.76,.89]
], dtype=float)
BETA = np.array([
    [.09,.13],[.25,.12],[.39,.18],[.58,.12],[.80,.16],
    [.14,.33],[.32,.37],[.52,.35],[.76,.34],[.90,.42],
    [.08,.58],[.27,.59],[.47,.56],[.68,.60],[.86,.70],
    [.17,.81],[.38,.82],[.61,.85],[.80,.89]
], dtype=float)
THETA = np.linspace(0, 2*np.pi, 36, endpoint=False)
RADIUS = .285 + .07*np.cos(4*THETA) + .032*np.sin(3*THETA)
HABITAT = np.column_stack([
    .5 + 1.05*RADIUS*np.cos(THETA), .5 + 1.05*RADIUS*np.sin(THETA)
])
ALPHAS = (2,3,4,5)  # Negative actual alpha: -2, -3, -4, -5
BETAS = (1,1.25,1.5,1.75,2)


def arr(a):
    return np.round(np.asarray(a), 9).tolist()


def edges(g):
    return sorted(sorted(int(v) for v in e) for e in g.graph.get_edgelist())


def clip(poly, normal, rhs):
    """Sutherland-Hodgman: x dot normal <= rhs."""
    out = []
    for k, a in enumerate(poly):
        b = np.asarray(poly[(k+1)%len(poly)], dtype=float)
        a = np.asarray(a, dtype=float)
        da, db = float(a@normal-rhs), float(b@normal-rhs)
        if da <= 1e-12:
            out.append(a.tolist())
        if (da<0<db) or (db<0<da):
            out.append((a + da/(da-db)*(b-a)).tolist())
    return out


def cells(points):
    result=[]
    for i,p in enumerate(points):
        poly=[[0.,0.],[1.,0.],[1.,1.],[0.,1.]]
        for j,q in enumerate(points):
            if i != j and poly:
                poly=clip(poly, 2*(q-p), float(q@q-p@p))
        result.append(arr(poly))
    return result


def build():
    """Uses actual ProximityGraphs constructors, not browser approximations."""
    water=pg.SetPoints(WATER.copy())
    output={
        "format_version":1,
        "metadata":{
            "library":"proximitygraphs",
            "library_version":getattr(pg,"__version__","unknown"),
            "library_source_commit":LIBRARY_COMMIT,
            "data_type":"synthetic",
            "units":"normalized Euclidean coordinates",
            "voronoi_polygons":"Euclidean half-plane clipping; pg.Voronoi only stores site adjacency"
        },
        "voronoi":{
            "points":arr(WATER),"cells":cells(WATER),
            "adjacency":edges(pg.Voronoi(water)),
            "delaunay":edges(pg.DelaunayG(water))
        },
        "alpha":{"points":arr(HABITAT),"options":{}},
        "beta":{"points":arr(BETA),"options":{}}
    }
    hp=pg.SetPoints(HABITAT.copy())
    for a in ALPHAS:
        hull=pg.Alpha_Hull(hp, alpha=-float(a), n_points_per_arc=72)
        output["alpha"]["options"][str(a)]={
            "parameter_alpha":-a,"radius":1/a,
            "arcs":[arr(arc) for arc in hull.arcs],
            "segments":edges(hull)
        }
    bp=pg.SetPoints(BETA.copy())
    for b in BETAS:
        graph=pg.Beta_Skeleton(bp,beta=float(b),type_region="lune",closed=False)
        output["beta"]["options"][str(b)]=edges(graph)
    return output


def axis(title):
    fig,ax=plt.subplots(figsize=(7,6),constrained_layout=True)
    ax.set_facecolor("#f8fafb")
    for v in np.linspace(0,1,11):
        ax.axvline(v,c="#e6edf0",lw=.6,zorder=0)
        ax.axhline(v,c="#e6edf0",lw=.6,zorder=0)
    ax.set_xlim(0,1);ax.set_ylim(0,1);ax.set_aspect("equal")
    ax.set_xticks([]);ax.set_yticks([])
    ax.set_title(title,loc="left",fontsize=12,color="#243642",weight="bold",pad=12)
    for spine in ax.spines.values():spine.set_color("#cad9df")
    return fig,ax


def sites(ax,points):
    ax.scatter(points[:,0],points[:,1],s=42,facecolor="#166b75",
               edgecolor="white",linewidth=1.3,zorder=6)


def save(fig,stem):
    ASSETS.mkdir(parents=True,exist_ok=True)
    for ext in ("png","svg"):
        fig.savefig(ASSETS/(stem+"."+ext),bbox_inches="tight",
                    facecolor="white",**({"dpi":240} if ext=="png" else {}))
    plt.close(fig)


def render_water(s):
    fig,ax=axis("Figure 1 · Water stations: Voronoi and Delaunay")
    palette=["#e0edf0","#e7e8de","#d8e7e0","#eae2d7","#deedf2",
             "#f2e9df","#e1e9d7","#e6e6ed","#f3e7e4","#deede8","#e7eaf1","#f3eadf"]
    for i,p in enumerate(s["voronoi"]["cells"]):
        if len(p)>=3:
            ax.add_patch(Polygon(p,facecolor="#b3dce0" if i==0 else palette[i%len(palette)],
                                 edgecolor="white",lw=1.6,alpha=.9))
    for i,j in s["voronoi"]["delaunay"]:
        a,b=WATER[i],WATER[j]
        ax.plot([a[0],b[0]],[a[1],b[1]],c="#be6c41",lw=1.7,alpha=.67,zorder=4)
    sites(ax,WATER)
    ax.scatter([WATER[0,0]],[WATER[0,1]],s=100,c="#be6c41",
               edgecolor="white",linewidth=1.4,zorder=8)
    save(fig,"figure01-water")


def render_habitat(s):
    fig,ax=axis("Figure 2 · Habitat observations: circular alpha-hull")
    for i,a in enumerate(s["alpha"]["options"]["4"]["arcs"]):
        p=np.asarray(a)
        ax.plot(p[:,0],p[:,1],c="#be6c41" if i==0 else "#166b75",
                lw=3 if i==0 else 2.2,zorder=5,solid_capstyle="round")
    # Draw the supporting circle of the highlighted library-generated arc.
    exemplar=np.asarray(s["alpha"]["options"]["4"]["arcs"][0])
    p,q,r=exemplar[[0,len(exemplar)//2,-1]]
    matrix=2*np.stack([q-p,r-p])
    rhs=np.array([q@q-p@p,r@r-p@p])
    if abs(np.linalg.det(matrix))>1e-12:
        center=np.linalg.solve(matrix,rhs)
        ax.add_patch(Circle(center,np.linalg.norm(p-center),
                            fill=False,edgecolor="#bd895f",linestyle="--",
                            linewidth=1.4,alpha=.78,zorder=3))
        ax.scatter([center[0]],[center[1]],s=24,color="#bd895f",zorder=4)
    sites(ax,HABITAT)
    save(fig,"figure02-habitat")


def render_sensors(s):
    fig,ax=axis("Figure 3 · Sensor candidate links: beta-skeleton")
    graph=s["beta"]["options"]["1.5"]
    selected=graph[len(graph)//2] if graph else None
    if selected:
        p,q=BETA[selected[0]],BETA[selected[1]]
        h=.75
        c1,c2=h*p+(1-h)*q,h*q+(1-h)*p
        xs=np.linspace(0,1,300)
        X,Y=np.meshgrid(xs,xs)
        within=((X-c1[0])**2+(Y-c1[1])**2<=(h*np.linalg.norm(p-q))**2) & (
            (X-c2[0])**2+(Y-c2[1])**2<=(h*np.linalg.norm(p-q))**2)
        ax.contourf(X,Y,within.astype(float),levels=[.5,1.5],
                    colors=["#dca781"],alpha=.27,zorder=2)
        for center in [c1,c2]:
            ax.add_patch(Circle(center,h*np.linalg.norm(p-q),edgecolor="#bd895f",
                                fill=False,linestyle="--",linewidth=1.1,zorder=3))
    for i,j in graph:
        p,q=BETA[i],BETA[j]
        selected_edge=[i,j]==selected
        ax.plot([p[0],q[0]],[p[1],q[1]],c="#be6c41" if selected_edge else "#166b75",
                lw=3.5 if selected_edge else 1.7,alpha=1 if selected_edge else .65,zorder=4)
    sites(ax,BETA)
    save(fig,"figure03-sensors")


def main():
    scene=build()
    assert all(scene["alpha"]["options"][str(a)]["arcs"] for a in ALPHAS), (
        "A requested alpha value has no closed circular arcs; inspect the parameters."
    )
    DATA.mkdir(parents=True,exist_ok=True)
    (DATA/"scenes.json").write_text(json.dumps(scene,indent=2)+"\n",encoding="utf-8")
    render_water(scene);render_habitat(scene);render_sensors(scene)
    print("Generated authoritative library geometry and 3 PNG + 3 SVG figures.")


if __name__=="__main__":
    main()
