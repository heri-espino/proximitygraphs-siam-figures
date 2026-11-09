# experiment008 — Randomized Pg interior-density slider and wider alpha filtration

**Date:** 2026-11-08
**Status:** Source and tests implemented on PR #7; current PR CI results pending after reconciliation with editorial experiment007.

## Objective

Increase the number of points **inside the existing serif Pg glyphs**, while preserving every source outline, the two genuine counters, and the open slit of the lowercase g. Extend the alpha slider sufficiently to demonstrate changes in the retained simplicial complex.

## Final method: user-adjustable pseudorandom interior sampling

- Original immutable 380-point user-image reference in `data/typography/pg_reference.u16.b64`: **298** ordered contour sites and **82** interior sites. The browser mirror in `site/data/pg_reference_points.js` remains byte-identical.
- Contour polygon ranges: g exterior `[0:147]`, g counter `[147:176]`, P exterior `[176:257]`, P counter `[257:298]`. The two real enclosed counters are exclusion regions, not filled areas.
- For each proposed sample use a 32-bit **linear congruential pseudorandom generator** (LCG), `s_(k+1) = (1664525 s_k + 1013904223) mod 2^32`; the uniform variate is `u_k = s_k / 2^32`. Each candidate is `(.07 + .86 u_(2k+1), .16 + .69 u_(2k+2))`. The default seed is **32571**. Both Python and browser JavaScript use identical 32-bit arithmetic; points appear random but a chosen seed reproduces them.
- Accept a candidate only if it lies **inside one glyph stroke** (inside an exterior, outside its corresponding counter), outside the lower-g slit exclusion disk (center `(.595,.27)`, radius `.047`), at least `.025` from all 298 traced contour sites, and at least `.008` from all remaining original/accepted sites. These safeguards preserve the outline and avoid near-duplicate points.
- The **Random interior points** slider chooses any integer **0–600**, with the 298 contour points always present. The first `min(n,82)` original interior sites are retained; above 82 the generator appends `n−82` new sites. Total `298+n` sites. Default `n=302` gives **600 total sites** (298 contour + 82 original interior + 220 seeded additions). Moving the slider reconstructs only browser geometry, labeled correctly as independent JavaScript, and debounces rapid drags. The **Reshuffle random points** button increments the seed and redraws all positive-count interior sites, including counts below 82; the default seed and density are restored by **Reset points**.
- The point-count controls are visible only for Pg. Switching to the original 53-point smiley disables this layout and restores its original four alpha magnitudes. Pg alpha magnitudes remain `[10,14,18,22,26,28.57142857142857,32,38,44]`, default index5 (`R=.035`). Smiley uses `[4,8,10,12]`, default index1.
- The habitat editor cap is **1100**, so every slider state (up to 898 generated sites) permits additional manual editing.

## Validation and numerical interpretation

The default authoritative scene and SVG/PNG exports are generated with the pinned Python package at `n=302`, seed32571. Nondefault slider/reshuffle states are recomputed independently in the browser; there is no false claim of Python re-execution inside the website. The reference default at alpha `−28.57142857142857` is required by tests to have two connected components and two topological holes. The actual number of smaller loops can change when the seed or count changes, which is the intended purpose of an interactive construction.

## Preliminary geometric results

An earlier Halton-based (now superseded) in-memory JavaScript incremental triangulation gave these exploratory values. The first Python CI mistakenly selected ALPHAS[2] = 18 instead of the new default ALPHAS[5] = 28.57142857142857; its 1-component/3-hole failure was a stale-test-index error, not a confirmed default-topology defect. Updated pinned-library results must be validated before interpreting these as current values:

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

For the initial prototype, no boundary vertex had degree other than two. Hole count follows the planar Euler characteristic `b1 = E - V - F + b0` for the retained triangle complex. These values document the initial sample and need not match the subsequently contour-cleared version. The initial PR CI runs 42547749087 and 42547749124 failed because a stale test selected index2, not the new default index5; fixed. Later Halton configuration successfully passed Python and Playwright at 42548352571 and 42548352577, but it has since been superseded by the adjustable pseudorandom design. Latest PR checks must be verified independently.

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

The added interior points are **seeded, pseudorandom synthetic polygon-interior samples** inferred from the existing source contour points, not independently digitized pixels. The source contours and reference file remain untouched. At extreme scales, smaller holes can appear or disappear deliberately. After editing points in the browser, independent JavaScript geometry replaces authoritative default library results and is labeled accordingly.

Next: verify the Python/Node/Playwright workflows, inspect new default and extreme-slider screenshots, record exact PR and deployment URLs, and merge only with explicit authorization.


This experiment was renumbered from a provisional `experiment007` because concurrent editorial work was independently committed to `main` under that identifier. The editorial experiment and its manuscript/PDF artifacts must be preserved; this experiment is independently reproducible as `experiment008`.
