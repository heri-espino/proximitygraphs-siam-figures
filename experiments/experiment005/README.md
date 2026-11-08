# experiment005 — Pg wordmark with two enclosed alpha counters

**Date:** 2026-11-08  
**Status:** Implementation complete on PR #5; integration and release validation pending.

## Objective

Default to a reproducible synthetic **Pg** point cloud (uppercase P, lowercase g) rather than the original smiley. At the chosen default alpha scale, the actual retained Delaunay-triangle complex must have two enclosed bounded regions—one inside P and one inside g. Preserve the full original 53-point smiley as an optional selectable preset.

## Construction and notation

The wordmark comprises **78 distinct sites** derived from a regular 2D lattice (spacing 0.055) restricted to two block-letter regions. Deterministic sinusoidal displacements break near cocircularities, and indices `{3,7,9,19,20,23,25,30,36,46,64,74,88}` are omitted from 91 candidate sites. The Python source of truth is `pg_wordmark()` in `scripts/export_scenes.py` and the browser has a matching local fallback.

Pg uses magnitudes `8, 10, 11.8, 14`, with default alpha `−11.8`; the smiley keeps `4, 8, 10, 12`, with default `−8`. With radius `R=1/|alpha|`, retain Delaunay triangles satisfying `r_circum ≤ R`. If `C` denotes connected components, `V` retained vertices, `E` retained edges and `F` retained triangles, the number of bounded holes is `H=C−(V−E+F)`.

The default **Pg** must have exactly `C=1`, `H=2`, and three closed boundary cycles (exterior, one counter in each glyph). Shape/hull equality and alpha-hull supporting circles are tested against the pinned ProximityGraphs constructors, not only the independent SciPy prototype. Both presets are exported into the scene JSON; legacy top-level fields mirror Pg. Switching presets resets only the alpha editor, leaving the Voronoi and beta-skeleton views unchanged. The alpha editor allows 120 sites, while other editors retain 80.

## Reproduce

```bash
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
```

## Results and limitations

Pending final PR CI and post-merge deployment evidence. The topology guarantee is **only for the default Pg parameter**, not the full slider range or arbitrarily edited coordinates; changes to alpha can fill holes or split features. The example is synthetic point-cloud typography, not font geometry or logo licensing. Numerical degeneracies remain possible under arbitrary user edits. Preserve the source geometry, retained triangles, exported figures, browser screenshots, test logs, and handoff notes in this repository.

## Next actions

Review all CI failures and visual snapshots; correct implementation/test discrepancies without weakening the two-hole check. Merge only with authorization (explicitly provided), then verify generated Figure02, GitHub Pages, and the article PDF. Record exact run/merge IDs here.
