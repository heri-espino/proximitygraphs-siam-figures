"""Reproducible ProximityGraphs-backed scene export and static editorial figures.

Run from repository root: python scripts/export_scenes.py
Historical John Snow pumps/deaths; deterministic Pg wordmark, smiley and sensor presets.
"""
from __future__ import annotations

import base64
import csv
import json
import math
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


# Historical pumps and three reproducible synthetic teaching point sets.
# Both alpha presets are exported using the *same pinned library*.
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
SMILEY_POINTS = np.vstack([FACE_OUTLINE, LEFT_EYE, RIGHT_EYE, MOUTH])


def inside_polygon(x, y, vertices):
    """Deterministic even-odd polygon test; no font or geometry dependency."""
    inside = False
    for k, (xa, ya) in enumerate(vertices):
        xb, yb = vertices[(k + 1) % len(vertices)]
        if (ya > y) != (yb > y) and x < (xb - xa) * (y - ya) / (yb - ya) + xa:
            inside = not inside
    return inside


def pg_wordmark_points():
    """A block P and single-storey g, with precisely one vacant counter each.

    A slightly irregular but deterministic lattice samples only the filled
    letter strokes. The enclosed P and g counters are not sampled. For
    alpha=-14, the retained Delaunay complex has one component and two holes
    (independently verified below by its Euler characteristic).
    """
    p_bowl = [(.13,.55),(.42,.55),(.49,.60),(.52,.67),
              (.52,.78),(.48,.85),(.13,.85)]
    g_tail = [(.655,.12),(.805,.12),(.895,.17),(.895,.255),
              (.819,.255),(.811,.204),(.655,.204)]

    def on_letter(x, y):
        stem = .10 <= x <= .22 and .17 <= y <= .85
        p_upper = inside_polygon(x, y, p_bowl)
        p_counter = ((x - .345) / .090)**2 + ((y - .705) / .082)**2 < 1
        capital_p = (stem or p_upper) and not p_counter

        g_outer = ((x - .725) / .160)**2 + ((y - .555) / .158)**2 < 1
        g_counter = ((x - .727) / .081)**2 + ((y - .560) / .077)**2 < 1
        descender = (.820 <= x <= .895 and .16 <= y <= .58
                     or inside_polygon(x, y, g_tail))
        lowercase_g = (g_outer and not g_counter) or descender
        return capital_p or lowercase_g

    step = .047
    points = []
    for j in range(17):
        y = .13 + j * step
        if y >= .90:
            break
        for i in range(19):
            x = .09 + i * step
            if x >= .94:
                break
            point = [x + step * .085 * math.sin(i * 1.18 + j * 2.13),
                     y + step * .080 * math.cos(i * 2.31 - j * .87)]
            if on_letter(*point):
                points.append(point)
    result = np.asarray(points, dtype=float)
    if len(result) != 111 or not np.all((result >= 0) & (result <= 1)):
        raise AssertionError("Pg point-set generator changed; inspect the geometry")
    return result


def pg_image_points():
    """Load 380 image-traced points, preserving the serifs and g swash.

    A user-supplied 806x616 screenshot was thresholded at luminance 200.
    All four sizeable contour loops (two exteriors and two counters) were
    sampled at approximately 18px intervals; randomized stroke-interior
    grid sites at 30px intervals preserve ink density. A six-point gap in
    the lower g flourish deliberately keeps its open white slit from
    becoming a third alpha hole. Two additional stem sites avoid a sparse
    corner. The final sites are stored as compact 16-bit normalized XY
    coordinates, not a text font or an image-only rendering.
    """
    raw=(ROOT/"data"/"typography"/"pg_reference.u16.b64").read_text(encoding="ascii")
    packed=base64.b64decode(raw.strip(),validate=True)
    points=np.frombuffer(packed,dtype="<u2").astype(np.float64).reshape(-1,2)/65535
    if points.shape != (380,2) or not np.isfinite(points).all():
        raise AssertionError("Image-derived Pg point cloud unexpectedly changed")
    if not np.all((points>=0)&(points<=1)):
        raise AssertionError("Image-derived Pg coordinates must stay normalized")
    return points


PG_POINTS = pg_image_points()
HABITAT = PG_POINTS  # Backwards-compatible default for figures and older tools.


BETA = np.array([
    [.12,.18],[.22,.16],[.32,.23],[.14,.36],[.28,.35],[.39,.30],
    [.12,.55],[.25,.51],[.36,.60],[.18,.78],[.32,.79],
    [.44,.43],[.49,.49],[.55,.56],
    [.61,.18],[.75,.15],[.87,.22],[.614,.334],[.74,.35],[.86,.40],
    [.62,.54],[.76,.56],[.89,.65],[.64,.78],[.79,.81],
], dtype=float)

ALPHAS = (22,26,28.57142857142857,32)  # Serif Pg: default R=0.035, two closed counters.
SMILEY_ALPHAS = (4,8,10,12)
ALPHA_PRESETS = {
    "pg": {"label": "Pg · image-traced serif and swash", "points": PG_POINTS,
           "point_roles": ["outline"]*298 + ["stroke"]*82,
           "alpha_values": ALPHAS, "default_alpha_index": 2,
           "description": "image-traced serif Pg wordmark with two enclosed counters"},
    "smiley": {"label": "Smiling face", "points": SMILEY_POINTS,
               "alpha_values": SMILEY_ALPHAS, "default_alpha_index": 1,
               "description": "synthetic smiling face"},
}
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



def alpha_topology(kept_triangles):
    """Betti numbers of the retained 2D simplicial complex, excluding
    isolated vertices: b1=E-V-F+b0, with b0 the connected component count.
    """
    edges_set = set()
    vertices = set()
    for i, j, k in kept_triangles:
        vertices.update((i, j, k))
        edges_set.update((tuple(sorted((i, j))),
                          tuple(sorted((i, k))),
                          tuple(sorted((j, k)))))
    if not vertices:
        return {"components": 0, "holes": 0}
    adjacency = {v: set() for v in vertices}
    for i, j in edges_set:
        adjacency[i].add(j)
        adjacency[j].add(i)
    remaining = set(vertices)
    components = 0
    while remaining:
        components += 1
        stack = [remaining.pop()]
        while stack:
            for neighbor in adjacency[stack.pop()] & remaining:
                remaining.remove(neighbor)
                stack.append(neighbor)
    return {
        "components": components,
        "holes": len(edges_set) - len(vertices) - len(kept_triangles) + components,
    }


def build_alpha_preset(spec):
    """All outputs are computed by pinned ProximityGraphs constructors."""
    points = spec["points"]
    sp = pg.SetPoints(points.copy())
    triangles = triangulation_data(points)
    options = {}
    for a in spec["alpha_values"]:
        hull = pg.Alpha_Hull(sp, alpha=-float(a), n_points_per_arc=72)
        shape = pg.Alpha_Shape(sp, alpha=-float(a))
        kept = [t["vertices"] for t in triangles
                if t["r"] <= 1 / a + 1e-12]
        options[str(a)] = {
            "parameter_alpha": -a, "radius": 1 / a,
            "arcs": [arr(arc) for arc in hull.arcs],
            "segments": edges(hull),
            "shape_edges": edges(shape),
            "kept_triangles": kept,
            "topology": alpha_topology(kept),
        }
    return {
        "label": spec["label"], "description": spec["description"],
        "points": arr(points), "alpha_values": list(spec["alpha_values"]),
        "default_alpha_index": spec["default_alpha_index"],
        "triangles": triangles, "options": options,
        "point_roles": spec.get("point_roles", []),
    }


def build():
    """Uses actual ProximityGraphs constructors, not browser approximations."""
    water=pg.SetPoints(WATER.copy())
    output={
        "format_version":1,
        "metadata":{
            "library":"proximitygraphs",
            "library_version":getattr(pg,"__version__","unknown"),
            "library_source_commit":LIBRARY_COMMIT,
            "data_type":"historical digitized locations for Voronoi; synthetic Pg/smiley and sensor sets",
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
        "alpha":{},

        "beta":{"points":arr(BETA),"description":"synthetic relay-corridor sensor network",
                "options":{}},
        "compare":{"points":arr(BETA),"options":{}}
    }
    alpha_presets = {name: build_alpha_preset(spec)
                     for name, spec in ALPHA_PRESETS.items()}
    output["alpha"] = {
        **alpha_presets["pg"],
        "default_preset": "pg",
        "presets": alpha_presets,
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
    fig,ax=axis("Figure 2 · Image-traced serif Pg · alpha-shape counters")
    # Keep the material visible: the two empty counters are actual holes
    # in the retained simplicial complex, not decorative white circles.
    from matplotlib.collections import PolyCollection
    selected=s["alpha"]["options"][str(ALPHAS[2])]
    kept = selected["kept_triangles"]
    ax.add_collection(PolyCollection(
        [HABITAT[t] for t in kept],
        facecolor="#c4c0ba", alpha=.33, edgecolor="none", zorder=1))
    for i,j in selected["shape_edges"]:
        p,q=HABITAT[[i,j]]
        ax.plot([p[0],q[0]],[p[1],q[1]],
                c="#73717c",lw=1.0,alpha=.7,linestyle="--",zorder=4)
    for i,a in enumerate(selected["arcs"]):
        p=np.asarray(a)
        ax.plot(p[:,0],p[:,1],c="#6d6c75" if i==0 else "#34383c",
                lw=3 if i==0 else 2.2,zorder=5,solid_capstyle="round")
    # Draw the supporting circle of the highlighted library-generated arc.
    exemplar=np.asarray(selected["arcs"][0])
    p,q,r=exemplar[[0,len(exemplar)//2,-1]]
    matrix=2*np.stack([q-p,r-p])
    rhs=np.array([q@q-p@p,r@r-p@p])
    if abs(np.linalg.det(matrix))>1e-12:
        center=np.linalg.solve(matrix,rhs)
        ax.add_patch(Circle(center,np.linalg.norm(p-center),
                            fill=False,edgecolor="#96939b",linestyle="--",
                            linewidth=1.4,alpha=.78,zorder=3))
        ax.scatter([center[0]],[center[1]],s=24,color="#96939b",zorder=4)
    # Boundary samples define the letters; more transparent interior
    # points communicate stroke weight without painting a literal font.
    ax.scatter(HABITAT[:298,0],HABITAT[:298,1],s=20,
               facecolor="#30302e",edgecolor="white",linewidth=.45,zorder=7)
    ax.scatter(HABITAT[298:,0],HABITAT[298:,1],s=13,
               facecolor="#66635f",alpha=.65,edgecolor="none",zorder=6)
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
    for name, preset in scene["alpha"]["presets"].items():
        assert all(preset["options"][str(a)]["shape_edges"] ==
                   preset["options"][str(a)]["segments"]
                   for a in preset["alpha_values"]), (
            f"{name}: alpha-shape and alpha-hull boundaries disagree"
        )
    assert scene["alpha"]["options"][str(ALPHAS[2])]["topology"] == {
        "components": 1, "holes": 2
    }, "Image-traced Pg must retain exactly two enclosed counters at the default alpha"
    assert all(scene["alpha"]["options"][str(a)]["arcs"] for a in ALPHAS), (
        "A requested alpha value has no closed circular arcs; inspect the parameters."
    )
    DATA.mkdir(parents=True,exist_ok=True)
    (DATA/"scenes.json").write_text(json.dumps(scene,indent=2)+"\n",encoding="utf-8")
    render_water(scene);render_habitat(scene);render_sensors(scene)
    print("Exported image-traced serif Pg, original smiley, historical Snow and sensor geometry.")


if __name__=="__main__":
    main()
