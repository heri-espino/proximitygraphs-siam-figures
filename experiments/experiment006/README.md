# experiment006 — Image-traced serif Pg as a dotted alpha-shape

**Date:** 2026-11-08  
**Status:** Implementation ready for CI; completion evidence pending.

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

Verify PR CI for both presets and the exact two-counter topology, merge on user authorization, confirm Pages, and record actual run IDs/merge SHA and screenshot evidence here. The next experiment must be experiment007.
