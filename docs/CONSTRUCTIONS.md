# Construction views: mathematical definitions and reproducibility

**Scope:** Interactive companion to the proposed (unsubmitted) SIAM News feature.  
**Inputs:** the water pumps and cholera death marks are digitized historical map records; the alpha Pg/smiley presets and beta relay sensor points are synthetic, each in the normalized unit square.  
**Primary data source:** the pinned [ProximityGraphs Python package](https://github.com/ProximityGraphs/ProximityGraphs), installed from the SHA in \`requirements.txt\`.  
**Edited-data source:** an explicitly separate, testable in-browser JavaScript implementation.

## Navigation and controls

The page is now divided into anchored sections: **Home → Voronoi/Delaunay → Alpha-Hull/Alpha-Shape → β-Skeleton → Compare → About**. Existing article deep links \`/#water\`, \`/#habitat\`, \`/#sensors\` remain stable. Internal navigation stays in the same tab; external resources open in new tabs with \`noopener noreferrer\`.

Each main figure has **Move**, **Add**, **Delete**, and **Reset points** modes; the sensor plot additionally supports **Inspect pair** (click two different sites). Mouse, touch, and keyboard input are supported. The editor limits water and sensor point sets to 80 sites and alpha wordmark/smiley sets to 140 sites, normalized coordinates in \`[0,1]^2\`, and a minimum site separation of 0.008 to avoid coincident-point degeneracy.

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

**Selectable point clouds and topological holes.** The default alpha scene is **Pg** (380 image-traced sites), where the supplied serif P and flourished lowercase g each enclose one white counter. The point set is not a font bitmap. The original smiley (53 sites) remains available as an alternative. Their alpha parameters are deliberately different: Pg at \(\alpha\in\{-8,-11,-14,-18\}\), default \(-14\); smiley at \(\alpha\in\{-4,-8,-10,-12\}\), default \(-8\). At \(\alpha=-14\), the retained triangulation has **one connected component and two topological holes**, verified by

\[
b_1 = E - V - F + b_0 = 2,
\]

where \(V,E,F\) count vertices, edges, and retained triangles, and \(b_0\) counts connected components of the retained simplicial complex. These are actual 1-dimensional homology counts, not white regions inferred from a screenshot. At Pg alpha \(-8\) there are no holes; \(-11\) gives one; \(-18\) keeps both counters but separates the glyphs into two components. The default plot shades retained simplices so the letter counters are visually legible. Selecting a different preset resets the editable point baseline and alpha slider; source Python computations are preserved independently for both presets under \`scene.alpha.presets\`.

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

## 4. Same sites, different graphs

The **Compare** section uses exactly the *sensor section's current point coordinates* on both sides. It supports Delaunay, Gabriel (β=1 lune), relative neighborhood (β=2 lune), β=1.5 lune, and alpha-shape (α=−4). It displays edge counts, swaps panels and restores the default comparison. The unchanged default reference edges come directly from the Python library; edited sensors trigger local recalculation for both panels.

For generic planar point sets:

\[
\mathrm{RNG}\subseteq\mathrm{GG}\subseteq\mathrm{Delaunay}.
\]

This inclusion is tested for the default configuration. It is not a claim that every such graph is a physical network or a geometric spanner with bounded worst-case dilation.

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
The current default supersedes the block experiment005 glyph. It is traced from the exact user-supplied 806×616 reference image. Four large image contours—P exterior/counter and g exterior/counter—are sampled at roughly 18px steps, with deterministic jitter. Randomized 30px-grid stroke-interior points provide a light stipple, while outer and inner contours receive darker, denser dots. **298 contour + 82 interior = 380 sites**, stored without needing a font file in `data/typography/pg_reference.u16.b64`. The independent browser mirror is `site/data/pg_reference_points.js`. The small lower-g white slit is open to the page exterior in the image; removing six nearby sample points avoids an artificial third hole under the alpha filtration. At **R=.035, alpha≈−28.57142857142857**, the retained Delaunay complex has **b0=2, b1=2** and **four closed boundary cycles**, with the two internal loops located in the actual P and g counters. Other scales and edited clouds have no such guarantee. See `experiments/experiment006/README.md`.
