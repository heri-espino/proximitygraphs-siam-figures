"""Reproducible ProximityGraphs-backed scene export and static editorial figures.

Run from repository root: python scripts/export_scenes.py
Historical John Snow coordinates; synthetic Pg wordmark, original smiley and relay sensor data.
"""
from __future__ import annotations

import csv
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
# Stable SVG element IDs and metadata across independent CI builds.
matplotlib.rcParams["svg.hashsalt"] = "proximitygraphs-siam-figures-2026"
import matplotlib.pyplot as plt
import numpy as np
import proximitygraphs as pg
from matplotlib.patches import Circle, Polygon
from scipy.spatial import Delaunay

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "site" / "data"
ASSETS = ROOT / "site" / "assets"
LIBRARY_COMMIT = "d1a216d7255cbebea68dcaad6a97382168a3ec55"

# HistData's 13 map-pump sites and 578 death marks use the same
# digitized historical map coordinate frame. Preserve its aspect ratio when
# fitting the unit square; do not describe it as a modern GIS projection.
HISTORICAL = ROOT / "data" / "historical"
SNOW_SOURCE = "https://vincentarelbundock.github.io/Rdatasets/doc/HistData/Snow.pumps.html"
SNOW_DEATHS_SOURCE = "https://vincentarelbundock.github.io/Rdatasets/doc/HistData/Snow.deaths.html"


def read_snow():
    with (HISTORICAL / "Snow.pumps.csv").open(encoding="utf-8", newline="") as fh:
        pumps = list(csv.DictReader(fh))
    with (HISTORICAL / "Snow.deaths.csv").open(encoding="utf-8", newline="") as fh:
        deaths = list(csv.DictReader(fh))
    if len(pumps) != 13 or len(deaths) != 578:
        raise ValueError("Historical Snow input changed: expected 13 pumps and 578 death marks")
    p = np.array([[float(row["x"]), float(row["y"])] for row in pumps])
    d = np.array([[float(row["x"]), float(row["y"])] for row in deaths])
    all_points = np.vstack([p, d])
    mins, maxs = all_points.min(axis=0), all_points.max(axis=0)
    scale = 0.84 / float((maxs - mins).max())
    offsets = (1 - (maxs - mins) * scale) / 2
    normalize = lambda raw: offsets + (raw - mins) * scale
    wp, dp = normalize(p), normalize(d)
    names = [row["label"] for row in pumps]
    broad_index = names.index("Broad St")
    assert all(0 <= coord <= 1 for pt in np.vstack([wp, dp]) for coord in pt)
    assert len(set(map(tuple, wp))) == len(wp)
    return wp, dp, names, broad_index, {
        "source": "HistData::Snow.pumps and HistData::Snow.deaths (Rdatasets mirror)",
        "pump_source_url": SNOW_SOURCE,
        "death_source_url": SNOW_DEATHS_SOURCE,
        "interpretation": (
            "Digitized coordinates from a historical map; 578 individual "
            "death-location marks, some intentionally stacked at shared addresses"
        ),
        "historical_context": "1854 London cholera outbreak; John Snow's 1855 map",
        "normalization": {
            "method": "uniform affine transform preserving source aspect ratio",
            "source_min": np.round(mins, 9).tolist(),
            "source_max": np.round(maxs, 9).tolist(),
            "scale": float(scale),
            "offset": np.round(offsets, 9).tolist(),
        },
        "broad_street_index": broad_index,
    }


# Original historical pumps and two reproducible synthetic teaching scenes.
# The alpha section supports the Pg wordmark (default) and original smiley;
# the sensors represent two outpost clusters joined by a relay corridor.
WATER, SNOW_DEATHS, PUMP_LABELS, BROAD_STREET, SNOW_PROVENANCE = read_snow()

THETA = np.linspace(0, 2 * np.pi, 30, endpoint=False) + 0.011
FACE_RADIUS = .336 + .006 * np.cos(5 * THETA) + .003 * np.sin(7 * THETA)
FACE_OUTLINE = np.column_stack((
    .5 + FACE_RADIUS * np.cos(THETA),
    .52 + FACE_RADIUS * np.sin(THETA),
))
EYE_THETA = np.linspace(0, 2 * np.pi, 6, endpoint=False) + .19
LEFT_EYE = np.column_stack((.39 + .030 * np.cos(EYE_THETA),
                            .635 + .023 * np.sin(EYE_THETA)))
RIGHT_EYE = np.column_stack((.61 + .029 * np.cos(EYE_THETA + .13),
                             .635 + .024 * np.sin(EYE_THETA + .13)))
MOUTH_X = np.linspace(.327, .673, 11)
MOUTH = np.column_stack((
    MOUTH_X,
    .345 + .081 * ((MOUTH_X - .5) / .173) ** 2
    + .001 * np.sin(73 * MOUTH_X),
))
SMILEY = np.vstack([FACE_OUTLINE, LEFT_EYE, RIGHT_EYE, MOUTH])


def pg_wordmark():
    """Deterministic 78-point P/g, with two recoverable alpha-shape counters.

    A perturbed near-regular lattice samples two block-letter silhouettes.
    Carefully documented thinning avoids 13 redundant sites; at alpha=-11.8
    the Delaunay-alpha complex has exactly two bounded complementary holes,
    one around the upper counter in P and one in g.
    """
    removed = {3, 7, 9, 19, 20, 23, 25, 30, 36, 46, 64, 74, 88}
    selected = []
    k = 0
    for ix, x in enumerate(np.arange(.13, .92, .055)):
        for iy, y in enumerate(np.arange(.18, .88, .055)):
            p = ((.13 <= x <= .225 and .18 <= y <= .83)
                 or (.205 <= x <= .485 and .55 <= y <= .83
                     and not (.282 <= x <= .404 and .634 <= y <= .749)))
            g = ((.57 <= x <= .91 and .43 <= y <= .73
                  and not (.669 <= x <= .813 and .52 <= y <= .64))
                 or (.812 <= x <= .91 and .23 <= y <= .52)
                 or (.707 <= x <= .91 and .19 <= y <= .27))
            if p or g:
                if k not in removed:
                    selected.append([
                        x + .0022 * np.sin((ix + 1) * 18.7 + (iy + 1) * 4.3),
                        y + .0024 * np.cos((ix + 1) * 11.2 - (iy + 1) * 13.1),
                    ])
                k += 1
    if k != 91 or len(selected) != 78:
        raise ValueError(f"Pg geometric generator drifted: {k} lattice sites, {len(selected)} retained")
    # An extra deterministic, independent sub-grid perturbation separates
    # boundary branches so both counters have genuine degree-two cycles,
    # rather than pinched self-touching vertices.
    for i, point in enumerate(selected):
        t = i + 1
        xnoise = np.sin(t * 12.9898 + 49 * 78.233) * 43758.5453
        ynoise = np.sin(t * 31.4159 + 49 * 27.171) * 17723.723
        point[0] += .0025 * (2 * (xnoise - np.floor(xnoise)) - 1)
        point[1] += .0025 * (2 * (ynoise - np.floor(ynoise)) - 1)
    return np.asarray(selected, dtype=float)


PG = pg_wordmark()
HABITAT = PG  # Compatibility: default alpha points
SMILEY_ALPHAS = (4, 8, 10, 12)
ALPHAS = (8, 10, 11.8, 14)  # Pg default = 11.8; one counter in each letter
ALPHA_DEFAULT_INDEX = 2
ALPHA_PRESETS = {
    "pg": {"label": "Pg wordmark", "description": "synthetic Pg wordmark with two counters",
           "points": PG, "alpha_values": ALPHAS, "default_alpha_index": ALPHA_DEFAULT_INDEX},
    "smiley": {"label": "Smiling face", "description": "original synthetic smiley face",
               "points": SMILEY, "alpha_values": SMILEY_ALPHAS, "default_alpha_index": 1},
}


BETA = np.array([
    [.12,.18],[.22,.16],[.32,.23],[.14,.36],[.28,.35],[.39,.30],
    [.12,.55],[.25,.51],[.36,.60],[.18,.78],[.32,.79],
    [.44,.43],[.49,.49],[.55,.56],
    [.61,.18],[.75,.15],[.87,.22],[.614,.334],[.74,.35],[.86,.40],
    [.62,.54],[.76,.56],[.89,.65],[.64,.78],[.79,.81],
], dtype=float)

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


def triangulation_data(points):
    """Planar Delaunay triangles plus circumradii for construction overlays.

    The alpha-shape constructor uses this same Qhull Delaunay triangulation
    with negative alpha; these diagnostic simplices do not replace it.
    """
    if len(points) < 3:
        return []
    triangles = Delaunay(points).simplices
    out = []
    for simplex in triangles:
        i, j, k = [int(t) for t in simplex]
        p, q, r = points[[i, j, k]]
        a = float(np.linalg.norm(q - r))
        b = float(np.linalg.norm(p - r))
        c = float(np.linalg.norm(p - q))
        det = float(abs((q[0]-p[0])*(r[1]-p[1]) - (q[1]-p[1])*(r[0]-p[0])))
        radius = (a * b * c) / (2 * det) if det > 1e-12 else float("inf")
        out.append({"vertices": sorted([i, j, k]), "r": round(radius, 9)})
    return sorted(out, key=lambda t: tuple(t["vertices"]))


def alpha_topology(triangles, cutoff):
    """(components, bounded holes) of the retained planar triangle complex.

    For a nonempty 2-complex, Euler characteristic V - E + F equals
    components - holes. Counts refer to the union of retained triangles,
    not merely disconnected vertices in the input point cloud.
    """
    kept = [tri["vertices"] for tri in triangles if tri["r"] <= cutoff + 1e-12]
    vertices = {v for t in kept for v in t}
    if not vertices:
        return 0, 0
    edges = {tuple(sorted((u, v))) for t in kept
             for u, v in ((t[0], t[1]), (t[1], t[2]), (t[2], t[0]))}
    parent = {v: v for v in vertices}

    def root(v):
        while parent[v] != v:
            v = parent[v]
        return v

    for u, v in edges:
        parent[root(u)] = root(v)
    components = len({root(v) for v in vertices})
    return components, components - (len(vertices) - len(edges) + len(kept))


def build_alpha_preset(config):
    points = config["points"]
    triangles = triangulation_data(points)
    result = {
        "label": config["label"], "description": config["description"],
        "points": arr(points), "triangles": triangles,
        "alpha_values": list(config["alpha_values"]),
        "default_alpha_index": config["default_alpha_index"],
        "options": {},
    }
    hp = pg.SetPoints(points.copy())
    for a in config["alpha_values"]:
        radius = 1 / a
        hull = pg.Alpha_Hull(hp, alpha=-float(a), n_points_per_arc=72)
        shape = pg.Alpha_Shape(hp, alpha=-float(a))
        kept = [t["vertices"] for t in triangles if t["r"] <= radius + 1e-12]
        comps, holes = alpha_topology(triangles, radius)
        result["options"][str(a)] = {
            "parameter_alpha": -a, "radius": radius,
            "arcs": [arr(arc) for arc in hull.arcs],
            "segments": edges(hull),
            "shape_edges": edges(shape),
            "kept_triangles": kept,
            "topology": {"components": comps, "holes": holes},
        }
    return result


def build():
    """Uses actual ProximityGraphs constructors, not browser approximations."""
    water=pg.SetPoints(WATER.copy())
    presets={name: build_alpha_preset(config) for name,config in ALPHA_PRESETS.items()}
    default=presets["pg"]
    if default["options"]["11.8"]["topology"] != {"components": 1, "holes": 2}:
        raise ValueError("Default Pg alpha shape must contain two enclosed counters")
    output={
        "format_version":1,
        "metadata":{
            "library":"proximitygraphs",
            "library_version":getattr(pg,"__version__","unknown"),
            "library_source_commit":LIBRARY_COMMIT,
            "data_type":"historical digitized locations for Voronoi; synthetic Pg / smiley and sensor sets",
            "units":"normalized Euclidean coordinates",
            "voronoi_polygons":"Euclidean half-plane clipping; pg.Voronoi only stores site adjacency"
        },
        "voronoi":{
            "points":arr(WATER),"cells":cells(WATER),
            "labels":PUMP_LABELS,
            "death_marks":arr(SNOW_DEATHS),
            "historical":SNOW_PROVENANCE,
            "adjacency":edges(pg.Voronoi(water)),
            "delaunay":edges(pg.DelaunayG(water)),
            "triangles":triangulation_data(WATER)
        },
        "alpha":{
            "default_preset":"pg",
            "presets":presets,
            # The legacy top-level fields mirror the default for consumers
            # that predate the two-preset interface.
            **{key:default[key] for key in
               ("points","description","triangles","options","alpha_values","default_alpha_index")},
        },
        "beta":{"points":arr(BETA),"description":"synthetic relay-corridor sensor network",
                "options":{}},
        "compare":{"points":arr(BETA),"options":{}}
    }
    bp=pg.SetPoints(BETA.copy())
    for b in BETAS:
        graph=pg.Beta_Skeleton(bp,beta=float(b),type_region="lune",closed=False)
        output["beta"]["options"][str(b)]=edges(graph)
    output["compare"]["options"]={
        "delaunay":edges(pg.DelaunayG(bp)),
        "gabriel":edges(pg.GG(bp)),
        "rng":edges(pg.RNG(bp)),
        "beta":output["beta"]["options"]["1.5"],
        "alpha-shape":edges(pg.Alpha_Shape(bp,alpha=-4.0))
    }
    return output


def axis(title):
    fig,ax=plt.subplots(figsize=(7,6),constrained_layout=True)
    ax.set_facecolor("#fdfcfa")
    fig.patch.set_facecolor("#faf9f7")
    for v in np.linspace(0,1,11):
        ax.axvline(v,c="#eeece8",lw=.6,zorder=0)
        ax.axhline(v,c="#eeece8",lw=.6,zorder=0)
    ax.set_xlim(0,1);ax.set_ylim(0,1);ax.set_aspect("equal")
    ax.set_xticks([]);ax.set_yticks([])
    ax.set_title(title,loc="left",fontsize=12,color="#30302e",weight="bold",pad=12)
    for spine in ax.spines.values():spine.set_color("#e4e2dc")
    return fig,ax


def sites(ax,points):
    ax.scatter(points[:,0],points[:,1],s=36,facecolor="#34383c",
               edgecolor="white",linewidth=1.3,zorder=6)


def save(fig,stem):
    ASSETS.mkdir(parents=True,exist_ok=True)
    for ext in ("png","svg"):
        kwargs = {"dpi": 240, "metadata": {"Software": "ProximityGraphs-SIAM"}} if ext == "png" else {"metadata": {"Date": None}}
        fig.savefig(ASSETS/(stem+"."+ext),bbox_inches="tight",
                    facecolor="white",**kwargs)
    plt.close(fig)


def render_water(s):
    fig,ax=axis("Figure 1 · John Snow's pumps: Voronoi and Delaunay")
    palette=["#f0eeeb","#eeeae7","#ecebe6","#ece9e4","#efeeec",
             "#f1eeeb","#ebe9e5","#ecebed","#f1e9e8","#edece9","#eeedef","#efebe6"]
    for i,p in enumerate(s["voronoi"]["cells"]):
        if len(p)>=3:
            ax.add_patch(Polygon(p,facecolor="#e5e3de" if i==0 else palette[i%len(palette)],
                                 edgecolor="white",lw=1.6,alpha=.9))
    ax.scatter(SNOW_DEATHS[:,0], SNOW_DEATHS[:,1], s=5.0,
               c="#967b79",alpha=.29,edgecolors="none",zorder=3)
    for i,j in s["voronoi"]["delaunay"]:
        a,b=WATER[i],WATER[j]
        ax.plot([a[0],b[0]],[a[1],b[1]],c="#6d6c75",lw=1.7,alpha=.67,zorder=4)
    sites(ax,WATER)
    ax.scatter([WATER[BROAD_STREET,0]],[WATER[BROAD_STREET,1]],s=116,
               c="#6d6c75",edgecolor="white",linewidth=1.4,zorder=8)
    ax.annotate("Broad Street", xy=WATER[BROAD_STREET],xytext=(11,13),
                textcoords="offset points",fontsize=9,fontweight="bold",
                color="#6a6871",zorder=9)
    save(fig,"figure01-water")


def render_habitat(s):
    fig, ax = axis("Figure 2 · Pg: two counters in an alpha shape")
    default = s["alpha"]["presets"]["pg"]
    layer = default["options"]["11.8"]
    points = np.asarray(default["points"])
    # Straight alpha-shape boundary makes both bounded negative spaces clear.
    for i, j in layer["shape_edges"]:
        p, q = points[i], points[j]
        ax.plot([p[0], q[0]], [p[1], q[1]], c="#777b86",
                lw=1.5, alpha=.62, zorder=3, linestyle="--")
    for i, arc in enumerate(layer["arcs"]):
        p = np.asarray(arc)
        ax.plot(p[:,0],p[:,1],c="#5d5c64" if i==0 else "#34383c",
                lw=3 if i==0 else 2.0,zorder=5,solid_capstyle="round")
    if layer["arcs"]:
        exemplar = np.asarray(layer["arcs"][0])
        p, q, r = exemplar[[0, len(exemplar)//2, -1]]
        matrix = 2*np.stack([q-p, r-p])
        rhs = np.array([q@q-p@p, r@r-p@p])
        if abs(np.linalg.det(matrix))>1e-12:
            center = np.linalg.solve(matrix, rhs)
            ax.add_patch(Circle(center, np.linalg.norm(p-center),
                        fill=False, edgecolor="#96939b", linestyle="--",
                        linewidth=1.1, alpha=.6, zorder=3))
    sites(ax, points)
    save(fig,"figure02-habitat")


def render_sensors(s):
    fig,ax=axis("Figure 3 · Relay corridor: beta-skeleton links")
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
                    colors=["#c5bec0"],alpha=.27,zorder=2)
        for center in [c1,c2]:
            ax.add_patch(Circle(center,h*np.linalg.norm(p-q),edgecolor="#96939b",
                                fill=False,linestyle="--",linewidth=1.1,zorder=3))
    for i,j in graph:
        p,q=BETA[i],BETA[j]
        selected_edge=[i,j]==selected
        ax.plot([p[0],q[0]],[p[1],q[1]],c="#6d6c75" if selected_edge else "#34383c",
                lw=3.5 if selected_edge else 1.7,alpha=1 if selected_edge else .65,zorder=4)
    sites(ax,BETA)
    save(fig,"figure03-sensors")


def main():
    scene=build()
    assert all(
        scene["alpha"]["options"][str(a)]["shape_edges"] ==
        scene["alpha"]["options"][str(a)]["segments"]
        for a in ALPHAS
    ), "Alpha_Shape and Alpha_Hull must have identical boundary segments"
    assert all(scene["alpha"]["options"][str(a)]["arcs"] for a in ALPHAS), (
        "A requested alpha value has no closed circular arcs; inspect the parameters."
    )
    assert scene["alpha"]["presets"]["pg"]["options"]["11.8"]["topology"]["holes"] == 2
    DATA.mkdir(parents=True,exist_ok=True)
    (DATA/"scenes.json").write_text(json.dumps(scene,indent=2)+"\n",encoding="utf-8")
    render_water(scene);render_habitat(scene);render_sensors(scene)
    print("Generated authoritative Snow, Pg and optional smiley geometry, with three PNG/SVG figure pairs.")


if __name__=="__main__":
    main()
