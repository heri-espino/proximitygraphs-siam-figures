# experiment005 — A two-hole Pg point-cloud wordmark

**Started:** November 8, 2026  
**Status:** Complete — PR #4 merged; authoritative figures, site, editorial PDF and browser screenshots archived.

## Goal and constraints

Replace the 53-site smiling face as the **default** alpha-shape/alpha-hull point cloud with an unmistakable **Pg** (uppercase P, lowercase g). The two glyphs must have two *genuine topological holes*, one enclosed counter per glyph—not merely white circles painted over a solid triangulation. Preserve the original smiley unchanged and selectable. Maintain the minimalist editorial aesthetic, site links, interactive point editing, and Python-backed source provenance.

## Model and notation

For a fixed planar point set \(P\), choose \(\alpha<0\) and write \(R=1/|\alpha|\). The pinned library retains Delaunay triangles whose circumradius does not exceed \(R\); the **alpha-shape** is the straight-edge boundary of those triangles, while the **alpha-hull** uses curved arcs. For the retained finite simplicial complex \(K_R\), with \(b_0\) connected components, \(V\) vertices, \(E\) edges, and \(F\) triangular faces, the number of independent enclosed loops (first Betti number) satisfies

\[
b_1 = E - V - F + b_0.
\]

The equality is a combinatorial invariant. A visual gap without a closed cycle does not count as a hole.

## Point-cloud design

The **Pg** synthetic letterform uses a deterministic, slightly perturbed square lattice (step 0.047) sampled only within filled letter strokes. Capital P uses a polygonal bowl and vertical stem with a vacant elliptical counter; the single-storey g uses an oval bowl, a descending hooked tail, and a separate vacant elliptical counter. The point-set generator uses only elementary polygons, circles and sine/cosine perturbations and requires no font files, image extraction or geometry-library dependency.

- Pg: **111 points**, alpha magnitudes **8, 11, 14, 18**, default **14**.
- Original smiley: **53 points**, alpha magnitudes **4, 8, 10, 12**, default **8**.
- Browser point editors: 140-point cap for Pg/smiley, retaining 80 for pumps and sensors.
- The authoritative Python exporter stores both full independent results under \`alpha.presets.pg\` and \`alpha.presets.smiley\`. The former top-level \`alpha.points/options\` remain aliases of default Pg for existing consumers.

## Preliminary independent numerical experiment

Before changing repository code, I tested the deterministic Pg generator using SciPy's Delaunay triangulation on the local coordinate set, filtered triangles by circumradius and computed the independent Euler characteristic. Results:

| Magnitude \(|\alpha|\) | Retained triangles | \(b_0\) components | \(b_1\) holes |
| ---: | ---: | ---: | ---: |
| 8 | 166 | 1 | 0 |
| 11 | 157 | 1 | 1 |
| **14 (default)** | **134** | **1** | **2** |
| 18 | 127 | 2 | 2 |

These numbers are local mathematical prototype results, not claims of successful pinned-library CI; the latter must be verified separately. The scale transition deliberately changes the topology from filled to two counters, then separates the letters.

## Implementation and reproducibility

- \`scripts/export_scenes.py\`: deterministic Pg sample generator, original smiley preservation, two full source-pinned \`Alpha_Hull\`/\`Alpha_Shape\` exports, per-parameter topology, regenerated default Fig. 2.
- \`site/app.js\`: browser fallback Pg point generator, dynamic preset source and per-preset alpha values.
- \`site/editor.js\`: safe replacement of point-editor baseline, preserving Move/Add/Delete/Reset.
- \`site/geometry-details.js\`: Euler characteristic for modified browser scenes.
- \`site/index.html\`: point-set selector and two-hole default with filled simplices.
- \`tests/test_geometry.py\`, \`tests/test_editor.js\`, \`tests/visual_smoke.py\`: both presets' math, topology, switching, and browser figure rendering.
- Documentation and editorial caption updated; SIAM News remains **unsubmitted**.

Reproduce on a network-enabled checkout:

\`\`\`bash
python -m pip install -r requirements.txt
python scripts/export_scenes.py
python -m unittest discover -s tests -v
node --check site/app.js
node --check site/editor.js
node --check site/geometry-details.js
node tests/test_editor.js
python -m pip install playwright==1.57.0
python -m playwright install chromium
python tests/visual_smoke.py --output docs/visual-qa
\`\`\`

## Verified results and release

- [PR #4](https://github.com/heri-espino/proximitygraphs-siam-figures/pull/4): **merged** to `main` at commit `383c4e1cbbe00dc74408467f9c46aaeff3ef5444`.
- [PR pinned-library build and Python/Node tests](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42521712007): **success**; Python tests include exact `components=1, holes=2` at Pg α=−14, and browser geometry agrees with pinned Python for both presets.
- [PR Playwright visual QA](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42521711897): **success**.
- [Postmerge authoritative geometry, figure export and GitHub Pages deployment](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42521859885): **success**, with PNG/SVG/scene JSON committed. Live site: https://heri-espino.github.io/proximitygraphs-siam-figures/ .
- [Postmerge Playwright visual QA and archived screenshots](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42521859888): **success**, including Pg's two counters and Pg ↔ smiley switching; [visual-summary.json](../../docs/visual-qa/visual-summary.json) records 13 passed checks and eight PNG screenshots, including `03-alpha-construction.png` and `08-smiley-preset.png`.
- [Postmerge editorial LaTeX/PDF build](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42521859936): **success**; figures and PDF proof archived within the repository.

**Final pinned-library alpha topology:** the default `Pg` at `α=-14` has **111 sites, 134 retained triangles, one connected component, two enclosed holes**. The original smiley remains **53 sites**, with unchanged presets `[-4,-8,-10,-12]`. The four Pg alpha values produce holes `0,1,2,2` in that order; this is a specific construction, not a general theorem. Source records and screenshots are committed, and no scientific manuscript has been submitted.

### Limits

This demonstrates a planar alpha-shape topology for two selected synthetic point sets. It does not implement the full alpha complex/persistent homology pipeline or guarantee the topology on arbitrary edited points. The browser fallback is a separate numerical triangulator; only original presets carry authoritative pinned-ProximityGraphs outputs.
