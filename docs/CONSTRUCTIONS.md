# Construction views: mathematical definitions and reproducibility

**Scope:** Interactive companion to the proposed (unsubmitted) SIAM News feature.  
**Inputs:** the water pumps and cholera death marks are digitized historical map records; the alpha Pg/smiley presets and beta relay sensor points are synthetic, each in the normalized unit square.  
**Primary data source:** the pinned [ProximityGraphs Python package](https://github.com/ProximityGraphs/ProximityGraphs), installed from the SHA in \`requirements.txt\`.  
**Edited-data source:** an explicitly separate, testable in-browser JavaScript implementation.

## Navigation and controls

The page is now divided into anchored sections: **Home → Voronoi/Delaunay → Alpha-Hull/Alpha-Shape → β-Skeleton → Compare → About**. Existing article deep links \`/#water\`, \`/#habitat\`, \`/#sensors\` remain stable. Internal navigation stays in the same tab; external resources open in new tabs with \`noopener noreferrer\`.

Each main figure has **Move**, **Add**, **Delete**, and **Reset points** modes; the sensor plot additionally supports **Inspect pair** (click two different sites). Mouse, touch, and keyboard input are supported. The editor limits water and sensor point sets to 80 sites and alpha wordmark/smiley sets to 1100 sites, normalized coordinates in \`[0,1]^2\`, and a minimum site separation of 0.008 to avoid coincident-point degeneracy.

Each main figure includes **Final**, **Construction**, and **Both** display presets and can export the *currently displayed state* as SVG or PNG. Exporting a browser-edited scene does **not** turn that scene into an authoritative Python-library calculation.

## 1. Voronoi / Delaunay

For a finite site set \(P=\{p_1,\ldots,p_n\}\subset\mathbb R^2\), the Euclidean nearest-site cell is

\[
V_i=\bigcap_{j\ne i}\{x:2(q-p_i)\cdot x\leq \|q\|^2-\|p_i\|^2\},\qquad q=p_j.
\]

The **Historical cholera death marks** layer shows 578 fixed observations behind 13 editable historical pump sites. The **Selected pump name** layer labels the chosen pump (initially Broad Street). Both CSV sources and the aspect-preserving normalization are documented in [data/historical](../data/historical/README.md). Editing pump positions produces a hypothetical scenario while the historical death marks stay fixed. The Voronoi diagram is not an analysis Snow computed. The **Selected-site bisectors** layer draws lines bounding the relevant half-planes (clipped to the unit square). The **Delaunay triangles** layer displays a triangulation; the **Triangle circumcircle** layer shows one triangle's circumcircle and its center. Use **Next triangle** to cycle through triangles incident to the selected station. A Delaunay triangle's open circumdisk contains no other site in generic position.

The Python \`pg.Voronoi\` constructor provides **site adjacency**. Actual cell polygons are computed independently using Sutherland–Hodgman convex polygon clipping. The Python \`pg.DelaunayG\` provides Delaunay graph edges. Exported simplices with circumradii are derived from SciPy's Delaunay triangulation for the construction witness.

## 2. Alpha-shape versus circular alpha-hull

For the library's **negative-\(\alpha\)** convention, with radius \(R=1/|\alpha|\), retain planar Delaunay triangles \(\sigma\) satisfying

\[
R_{\mathrm{circum}}(\sigma)\leq R.
\]

The alpha-**shape** displayed here is the **straight-line boundary**: an edge of the retained triangles having incidence count exactly one. The related alpha-**hull** uses those same boundary edges as endpoints and replaces each with a circular arc of radius \(R\). They are **different geometric objects**. In the pinned library the alpha-hull stores straight analytic segments plus sampled arcs; source of the default shape boundary is the actual \`pg.Alpha_Shape\` object, while default arcs come from \`pg.Alpha_Hull\`.

Layers:

- **Alpha-shape**: straight, dashed blue boundary segments.
- **Alpha-hull**: curved ochre arcs; select one to inspect its supporting circle.
- **Delaunay triangulation**: circumradius test candidates.
- **Retained simplices**: shaded triangles whose circumradii meet the threshold.
- **Selected arc circle / All supporting circles / Circle centers**: geometric witnesses for the arc radius and orientation.

The all-circles display shows **one supporting circle per sampled arc**, not every theoretically possible circle through every point pair. These are *selected construction circles* for the hull; the count is therefore the number of hull arcs, not \(\binom{n}{2}\). The circles are clipped to the plotted domain to remain legible.

**Selectable point clouds and topological holes.** The default alpha scene is the traced serif **Pg**: 298 original contour sites and 82 original stroke sites, plus 220 synthetic deterministic ink-interior samples appended in experiment008. The original 380 reference coordinates remain unchanged. The current default contains **600 sites**; the 53-site original smiley remains selectable. Pg alpha magnitudes are `[10,14,18,22,26,28.57142857142857,32,38,44]`, each with a negative parameter and default radius `R=.035`; smiley magnitudes remain `[4,8,10,12]`. The slider range and selected value update on preset switching. At the reference alpha the intended structure is two glyph components and two real enclosed counters. Their first Betti number is computed for the retained complex using `b₁ = E − V − F + b₀`, where `V,E,F` are the numbers of used vertices, edges and triangular faces, and `b₀` counts connected components. This is topological hole counting, not pixel interpretation. Added sites remain at least 0.025 from the original contour points and 0.012 from all other sites, retaining the open lower-g slit. See `experiments/experiment008/README.md` for the full generator and tests.

**Limitations:** only the selected negative-alpha, planar branch is visualized, matching the library's documented \`Alpha_Shape\` and \`Alpha_Hull\` behavior; we do not claim an alpha-complex or persistent homology engine.

## 3. Lune-based β-skeleton

Given two different sites \(p,q\), \(d=\|p-q\|\), and \(\beta\geq1\), define

\[
r=\tfrac{\beta d}{2}, \quad c_1=\tfrac{\beta}{2}p+(1-\tfrac{\beta}{2})q,\quad
c_2=\tfrac{\beta}{2}q+(1-\tfrac{\beta}{2})p.
\]

The **open lune** is

\[
L_\beta(p,q)=B(c_1,r)\cap B(c_2,r).
\]

The pair is a graph edge if and only if **no third site is strictly inside both open disks**:

\[
(p,q)\in E \iff L_\beta(p,q)\cap(P\setminus\{p,q\})=\varnothing.
\]

The construction inspector explicitly distinguishes **ACCEPTED** and **REJECTED** pairs, reports the endpoint indices and disk radius, and identifies all blocking sites. Use **Show a rejected pair** for an automatically selected example, **Next candidate pair** to cycle through all unordered pairs, or **Inspect pair** mode to select arbitrary endpoints on the canvas. The chosen pair is always highlighted: a rejected candidate is drawn dashed red and **is not** claimed to be an existing graph edge. Its blockers receive red halos, while the two disk circumferences and overlap region can be toggled independently.

The optional **Rejected candidate pairs** layer shows faint rejected pair segments for up to 45 points; for larger sets the user can still inspect arbitrary pairs without rendering thousands of crossing segments. The actual Python default graph is \`pg.Beta_Skeleton(...,type_region="lune",closed=False)\`; browser edits use the same strict-inequality predicate but a separate implementation.

## 4. Same sites, different graphs — independent β and α sliders (experiment017)

The **Compare** section holds **one exact point set** in common between both panels, sourced either from the editable synthetic sensor network or a seeded binomial/Poisson realization. It supports Delaunay, Gabriel, RNG, β-skeleton, alpha-shape, and a **distinct curved alpha-hull** construction.

Each side has independent graph parameters. The slider appears **only** for a parameterized graph:

- **β-skeleton:** a β parameter in `[1,3]` with 0.1 steps (default β=1.5). Each pair is tested against the intersection of two open disks with radius `β||p−q||/2`; β=1 matches Gabriel and β=2 matches RNG for the adopted open-lune convention.
- **Alpha-shape:** a signed **negative α** parameter in `[−40,−1]` with 0.5 steps (default α=−4). The inverse radius `R=1/|α|` filters planar Delaunay triangles by circumradius. Its rendered boundary is **straight line segments**.
- **Alpha-hull:** the **same** negative-alpha Delaunay-simplex boundary edge endpoints but replaced by arcs of circles with radius `R=1/|α|` using the same `fallbackAlpha` circular-arc geometry as the main alpha laboratory. If the boundary forms a degenerate open chain, endpoints may be rendered as straight segments rather than invented arcs. This distinction is geometric, not a cosmetic color change.

The general alpha laboratory supports signed α across positive, zero and negative conventions; this comparison restricts to the **ordinary negative-alpha branch** deliberately so the two alpha constructions are directly comparable. An increase in |α| decreases R and can eliminate retained triangles/edges. This is expected, not a rendering failure.

**Parameter consistency:** The left and right β/α settings are independent. Switching graph families preserves each side's last β and α; swapping transfers the **graph and its settings** to the opposite panel; Reset returns to sensor points, Gabriel left / RNG right, β=1.5 and α=−4 for both hidden settings. Moving either slider **never regenerates the sites**. Adjusting n or λ, changing the point-set type, or pressing Generate new sample is the only stochastic resampling mechanism.

**Source provenance:** Unmodified sensor defaults with β=1.5/α=−4 use the reference edge lists from Python ProximityGraphs where available. A changed parameter or point set is recomputed in independently tested JavaScript using `compareGraphEdges(points,graph,beta,alpha)`. Curved hull arcs are sampled in the browser, not represented falsely as straight alpha-shape edges. Counts always refer to the **underlying boundary graph edges**, not the number of arc vertices.

For generic planar point sets:

\[
\mathrm{RNG}\subseteq\mathrm{GG}\subseteq\mathrm{Delaunay}.
\]

This inclusion is tested for the default configuration and does not imply practical route-optimality, physical link feasibility, or bounded dilation for all families.

## How to reproduce the figures and check the mathematics

From the repository root:

\`\`\`bash
python -m pip install -r requirements.txt
python scripts/export_scenes.py
python -m unittest discover -s tests -v
node --check site/editor.js
node --check site/geometry-details.js
node --check site/app.js
node tests/test_editor.js
python -m http.server 8000 --directory site
\`\`\`

Visit \`http://localhost:8000/\` to test the full interaction and save SVG/PNG exports. The page fetches \`site/data/scenes.json\` from the Python exporter; absence of that file activates a **clearly labeled independent JavaScript preview**.

Regression tests check:

1. Default Voronoi polygons and Delaunay adjacency.
2. Default alpha-shape edges **against the library's \`Alpha_Shape\`**, alpha-hull segments and circular radii, plus the retained triangle radius test.
3. Each individual candidate's accepted/blocked status against \`pg.Beta_Skeleton\` across five β values.
4. Comparison graphs against the pinned Python constructors; inclusion of RNG in Gabriel in Delaunay.
5. Section IDs, source loading order, editor controls, and secure external-link attributes.

**Data and publication caution:** the pump and death coordinates are historical digitizations, not a modern GIS survey. Changed pumps, the smiley, and sensor outposts are illustrative synthetic scenarios; no operational or medical inference is claimed. Construction widgets demonstrate geometry, not validated services or physical connectivity. This website accompanies an unsubmitted SIAM News proposal and is not affiliated with, approved by, or endorsed by SIAM.

## 6. Contour-first image sampling and the open g flourish
The current default supersedes the block experiment005 glyph. It is traced from the exact user-supplied 806×616 reference image. Four large image contours—P exterior/counter and g exterior/counter—are sampled at roughly 18px steps, with deterministic jitter. Randomized 30px-grid stroke-interior points provide a light stipple, while outer and inner contours receive darker, denser dots. **298 contour + 82 original interior = 380 reference sites**, plus 220 synthetic stroke-interior points in experiment008 (600 total), stored without needing a font file in `data/typography/pg_reference.u16.b64`. The independent browser mirror is `site/data/pg_reference_points.js`. The small lower-g white slit is open to the page exterior in the image; removing six nearby sample points avoids an artificial third hole under the alpha filtration. At **R=.035, alpha≈−28.57142857142857**, the retained Delaunay complex has **b0=2, b1=2** and **four closed boundary cycles**, with the two internal loops located in the actual P and g counters. Other scales and edited clouds have no such guarantee. See `experiments/experiment006/README.md`.


## experiment010 — Signed alpha and stochastic configurations (current)

This section supersedes the older archived negative-alpha-only widget description above. The live habitat slider spans **−100 through +100**, including **α=0** and exact default `−28.57142857142857`. In the pinned library, negative α filters ordinary Delaunay triangles, positive α filters **furthest-site Delaunay triangles**, and zero uses a straight-edge convex hull. For α≠0 retain triangles of circumradius at most `R=1/|α|`. Sign also determines the supporting circle center: negative gives exterior arcs, positive gives interior arcs. This browser implementation is mathematically independent; the furthest-site candidate search enumerates hull-vertex triples with circumscribed circles enclosing all hull vertices. In cocircular or degenerate configurations it may differ from SciPy Qhull; precomputed library exports apply only to the original fixed negative-alpha settings.

For unit square `W=[0,1]^2`: `BPP(n)` places exactly `n` iid uniform sites; `HPPP(λ)` first draws `N~Poisson(λ)` and then `N` iid uniform sites. Thus Poisson intensity and realized count must be displayed separately. The implementation uses exponential waiting times `T=-log(U)` for an exact inversion of the Poisson counting-process law under ideal uniforms; its actual LCG is seeded and pseudorandom. No hard-core spacing or repulsion is applied, so both processes preserve their distributional definitions. Smiley's 53 fixed feature points plus random interior sites intentionally exclude the eyes and mouth and should not be called an unconditional PPP. See `experiments/experiment010/README.md`.
