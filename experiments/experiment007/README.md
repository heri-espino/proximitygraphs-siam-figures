# experiment007 — Denser Pg interiors and a wider alpha filtration

**Date:** 2026-11-08
**Status:** Implemented on a feature branch; verify pinned-library and Playwright CI.

## Objective

Increase the number of points **inside the existing serif Pg glyphs**, while preserving every source outline, the two genuine counters, and the open slit of the lowercase g. Extend the alpha slider sufficiently to demonstrate changes in the retained simplicial complex.

## Reproducible method

- The immutable source `data/typography/pg_reference.u16.b64` contains **380 normalized sites**: 298 ordered contour samples and 82 stroke samples. Browser file `site/data/pg_reference_points.js` mirrors these exact coordinates.
- Contour ranges: `[0:147]` g exterior, `[147:176]` g counter, `[176:257]` P exterior, `[257:298]` P counter. Sample indices are preserved without modification.
- Generate candidates from the Halton radical-inverse sequence: `x = .07 + .86 H_2(k)`, `y = .16 + .69 H_3(k)` for integers `k >= 1`, with `H_b` the base-b radical inverse.
- Accept candidates inside a glyph exterior and outside its counter, at least **0.012** from all other sites and outside the **0.047**-radius exclusion zone centered at `(.595,.27)` that preserves the open lower-g slit.
- Append the first **220** accepted points. Final point count: **600 = 298 contour + 302 interior**. The original 380 sites remain exactly equal to the reference, and the added points are deterministic. Python and browser both implement this procedure; no user raster is required during ordinary builds.
- Alpha magnitudes: `[10,14,18,22,26,28.57142857142857,32,38,44]`, where the corresponding parameter is negative, with default index **5**, `R = 1/|alpha| = .035`. The 53-point smiley keeps `[4,8,10,12]`. The slider maximum updates on preset selection. The habitat point-editor cap increases to **800**.

## Preliminary geometric results

An independent in-memory JavaScript incremental triangulation of the new point set reported:

| Magnitude | Retained triangles | Components | Holes |
| ---: | ---: | ---: | ---: |
| 10 | 1072 | 1 | 1 |
| 14 | 1044 | 1 | 1 |
| 18 | 987 | 1 | 3 |
| 22 | 972 | 1 | 3 |
| 26 | 952 | 1 | 2 |
| 28.57142857142857 | 945 | **2** | **2** |
| 32 | 943 | 2 | 2 |
| 38 | 928 | 2 | 3 |
| 44 | 914 | 2 | 3 |

At the default alpha, no boundary vertex has degree other than two. Hole count follows the planar Euler characteristic `b1 = E - V - F + b0` for the retained triangle complex. These are prototype diagnostics, **not** verification of the pinned Python library or browser deployment until CI completes.

## Reproduction

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

After a successful merge, the existing GitHub Actions workflows regenerate and commit authoritative scene JSON, static PNG/SVG figures, visual screenshots/summary and the draft article PDF. Preserve all earlier experiment results.

## Limitations and next steps

The added interior points are **synthetic polygon-interior samples** inferred from the existing source contour points, not independently digitized image pixels. The source contours and reference file remain untouched. At extreme scales, smaller holes can appear or disappear deliberately. After editing points in the browser, independent JavaScript geometry replaces authoritative default library results and is labeled accordingly.

Next: verify the Python/Node/Playwright workflows, inspect new default and extreme-slider screenshots, record exact PR and deployment URLs, and merge only with explicit authorization.
