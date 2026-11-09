# experiment006 — Image-traced serif Pg as a dotted alpha-shape

**Date:** 2026-11-08  
**Status:** Complete — PR #6 merged, pinned-library CI passed, Pages, PDF and browser QA deployed/archived.

## Objective

Replace experiment005's block-letter approximation with the user's supplied 806 × 616 PNG reference: a classical serif capital P, a flourished lowercase g, two enclosed counters, thick–thin stroke contrast and a long descending swash. The outer contours are the primary geometric constraint. Preserve the original smiley as a separate selectable preset.

## Deterministic method

The full derived point source is data/typography/pg_reference.u16.b64: **380 normalized 2D sites** encoded as little-endian unsigned 16-bit XY pairs, divided by 65535. It is versioned and sufficient to reproduce every default figure without the original image or proprietary font software.

The optional Python sampler scripts/sample_pg_reference.py recreates the source from the original user screenshot. Dependencies for that one-time operation: NumPy, Pillow and OpenCV. Image grayscale threshold is **200/255**, preserving the delicate upper g terminal and fine serif tips. Exactly four significant contours are traced: two outer glyph boundaries and two internal counter boundaries. Arc-length contour samples are spaced at approximately **18 source pixels**, with deterministic seed 32571 and small tangential jitter. A 30-pixel jittered lattice retains interior-ink sites with probability **0.88**. After clearing six points at the open lower-g slit and adding two P-stem stabilizers, the cloud has **298 boundary sites and 82 stroke-interior sites**.

Normalization preserves the reference's proportions: image x spans 20 to 692 pixels, mapped to [0.07,0.93] at scale 0.86/672; y is converted with the same scale and inverted to the mathematical Cartesian axis. The two internal counters are intentionally not filled. A six-site clearance prevents the lower *open* g flourish from erroneously forming a third topological hole at the chosen alpha radius. This is a documented sampling choice, not an edit to the user's source pixels.

The browser's self-contained data/pg_reference_points.js mirrors the exact packed coordinates. JavaScript renders dark small contour dots, a lighter and subtly varied interior stipple, and the real Delaunay/alpha-shape/alpha-hull construction.

## Mathematical verification

At the default alpha magnitude **28.57142857142857** (radius **0.035**), independent SciPy Delaunay validation found:
- **380** points;
- **2** connected components, corresponding to P and g;
- **2** bounded holes (one inside P, one inside the g bowl);
- **4** simple closed boundary loops (two outer contours and the two counters), with no pinched boundary vertices;
- **506** retained triangles in the independent prototype.

For a finite planar triangle complex, b1 = E − V − F + b0. Each exported default must satisfy b0=2, b1=2. The user can vary alpha via magnitudes [22,26,28.57142857142857,32] and examine the resulting topology. The **original 53-point smiley** retains its independent alpha scales [4,8,10,12].

## Reproduction

From a checkout with the original supplied screenshot:
- pip install pillow numpy opencv-python-headless
- python scripts/sample_pg_reference.py --input path/to/Pg-reference.png --output data/typography/pg_reference.u16.b64

Standard source/CI process, which does not require that image:
- python -m pip install -r requirements.txt
- python scripts/export_scenes.py
- python -m unittest discover -s tests -v
- node --check site/app.js
- node --check site/data/pg_reference_points.js
- node tests/test_editor.js

Browser QA:
- python -m pip install playwright==1.57.0
- python -m playwright install chromium
- python tests/visual_smoke.py --output docs/visual-qa

Preserve all generated scene JSON, Python PNG/SVG figures, manuscript PDF, screenshots, metadata and test findings in the repository.

## Limits and next action

This is a sampled raster letterform, not an editable vector font or a claim about typeface licensing. Outside a designated alpha value, counters may fill, fragment, or reconnect. Browser edits use independent JavaScript geometry rather than the pinned Python library.

## Verified release and quantitative findings

- [PR #6](https://github.com/heri-espino/proximitygraphs-siam-figures/pull/6) **merged** at commit `02e63e6e7e7e86cc00f95713e1d78cbc0d99ee2e`.
- [PR pinned-library geometry + Node run #42539022022](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42539022022): **success**, including two counters, distinct glyph components and four closed boundary cycles, plus original smiley parity.
- [PR desktop/mobile Playwright run #42539022006](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42539022006): **success**, including original smiley switching, pointer editing and image-derived default.
- [Production figure export and GitHub Pages #42539173588](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42539173588): **success**. Live alpha section: https://heri-espino.github.io/proximitygraphs-siam-figures/#habitat .
- [Postmerge browser QA #42539173559](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42539173559): **success**, **13 checks passed**, eight archived desktop/mobile PNG screenshots at `docs/visual-qa/`, including `03-alpha-construction.png`, `07-mobile-alpha.png` and `08-smiley-preset.png`. [Machine-readable QA summary](../../docs/visual-qa/visual-summary.json).
- [Editorial LaTeX/PDF proof run #42539173490](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42539173490): **success**; new figure and article proof are stored in `site/assets` and `article/output`.

Independent image-to-point sampling evaluation on the supplied 806×616 PNG (threshold 200): **100%** of 380 emitted points fall on dark thresholded source pixels; **95%** of original contour pixels are within **8.8 input-image pixels** of a sampled outline point (median **4.35 px**). The contour samples preserve the tiny g terminal, serif tips and g descender as genuine sites, not an overlaid raster logo.

This evaluation is for the user's specific source screenshot and sampling algorithm. The alpha topological result is for the designated scale only; it does not establish typeface equivalence, universal topology preservation or measured human preference.

Next sequential experiment: **experiment007**.
