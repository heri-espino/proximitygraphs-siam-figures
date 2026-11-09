# experiment010 — Signed-alpha laboratory and spatial point-process presets

**Date:** 2026-11-08  
**Status:** Complete — PR #8 merged, pinned-library and JavaScript CI passed, Playwright desktop/mobile QA passed, and GitHub Pages deployed.

## Goal

Extend the existing `#habitat` figure without changing the authoritative image-traced Pg reference, the historical Snow diagram, the sensors, or the SIAM editorial source. The user requested (i) a signed alpha control over **−100 to +100**, (ii) random interior sites for the **Smiley**, and (iii) **Poisson** and **binomial** point processes as peers of Pg and Smiley in the same point-cloud selector.

## Definitions and mathematical design

Let `W=[0,1]²` with Lebesgue area `|W|=1`.

- **Binomial point process:** `N=n` is fixed. Draw `X_1,…,X_n iid Uniform(W)`. The slider controls exact `n` between 0 and 600; resampling changes locations but not the count.
- **Homogeneous Poisson point process:** `N ~ Poisson(λ|W|)=Poisson(λ)`. Conditional on `N`, locations are iid uniform over `W`. The slider controls intensity `λ∈{0,…,600}`; observed `N` is explicitly shown and generally differs from λ.
- **Exact Poisson sampler:** Let `U_k` be independent pseudo-uniform random values. The waiting times `T_k = -log(U_k)` are Exp(1) and `N = max{n:∑_{k=1}^n T_k ≤ λ}` has Poisson(λ) law when the pseudorandom sequence is idealized as iid uniform. Coordinates are drawn using subsequent pseudorandom values. This does **not** enforce minimum spacing, because repulsion would invalidate the binomial/Poisson model.
- **Seed and resampling:** Both processes use a 32-bit linear congruential generator `s_(k+1)=(1664525 s_k+1013904223) mod 2^32`, `U_k=s_k/2^32`, initial seed **85273**. Each resample increments the seed. The sample is reproducible for a fixed seed and parameter.
- **Smiley:** Preserve its **53** exact original outline/eyes/mouth sites. Append **0–600** interior points sampled reproducibly within the face outline, outside both eye polygons and clear of the mouth and all facial line segments. Baseline: **120** additional interior sites and seed **64017**. Minimum accepted-point spacing is `0.010`; it is an illustrative rejection-sampled interior, *not* a Poisson or binomial point process.
- **Pg:** Preserve the original **298 contour sites** and its previous 0–600 point-density control; default 302 ink-interior sites, with 82 original sites and 220 pseudorandom additions. Reference packing in `data/typography/pg_reference.u16.b64` remains unchanged.

## Signed alpha, actual pinned-library convention

Inspect `src/proximitygraphs/proximity/alpha.py` at pinned commit `d1a216d7255cbebea68dcaad6a97382168a3ec55`. It defines:

| Alpha parameter | Geometric construction |
| --- | --- |
| `−100 ≤ α < 0` | Ordinary nearest-site Delaunay triangulation; accept triangles with circumradius `r ≤ 1/|α|`; alpha-hull circular arcs use exterior circle centers |
| `α = 0` | Convex hull, drawn as straight segments (`R=∞`, no supporting finite circles) |
| `0 < α ≤ 100` | **Furthest-site** Delaunay triangulation; the same circumradius cutoff, but inward oriented alpha-hull arcs |

The browser computes signed alpha with its independent JavaScript geometry. Furthest-site triangles are found among convex-hull vertices: a triangle's circumcircle must **contain all convex-hull vertices** (opposite to the ordinary empty-circle predicate); enumeration costs `O(h^4)` for `h` hull vertices. Degenerate and cocircular configurations can require special tie-breaking; this is a teaching implementation and is **not** a claim of exact numerical equivalence with SciPy Qhull for arbitrary inputs. Only the original precomputed negative-alpha references remain authoritative Python results.

The slider uses `min=-100, max=100, step=any` to retain the **exact** default `α=-28.57142857142857`, `R=.035` and the previously verified Pg topology (two components, two genuine counters) without moving any source point. Other settings use independent browser computation with debounced redraw.

## Source organization

- `site/point-processes.js`: independently testable seeded random streams, rejection sampling for smiling-face interiors, homogeneous PPP, binomial process.
- `site/geometry-details.js`: convex hull, furthest-site triangle construction and signed-alpha filtering.
- `site/app.js`: four preset selection, signed curvature slider, spatial realization controls, reset/reseed semantics, alpha-hull rendering.
- `site/editor.js`: per-preset Reset points while retaining the selected alpha.
- `site/index.html`, `site/styles.css`: accessible selector, per-preset range controls, mathematical definitions and realization count.
- `tests/test_editor.js`, `tests/visual_smoke.py`: deterministic, algebraic and browser-interaction regression checks.
- `scripts/export_scenes.py`, `site/data/pg_reference_points.js`, historical CSVs, old experiments and draft editorial PDF: unchanged.

## Reproduce

```bash
python -m pip install -r requirements.txt
python scripts/export_scenes.py
python -m unittest discover -s tests -v
node --check site/point-processes.js
node --check site/geometry-details.js
node --check site/app.js
node --check site/editor.js
node tests/test_editor.js
python -m pip install playwright==1.57.0
python -m playwright install chromium
python tests/visual_smoke.py --output docs/visual-qa
```

Compare at least `α=-100,0,+100` using Pg, test `λ=0` against a zero-count PPP, and verify binomial N is **exactly** its slider value. Visual QA captures the smiley and both point-process cases in addition to historical default scenes.

## Limitations, tests and next steps

The browser uses a seeded **pseudorandom** stream, not an unpredictable cryptographic source. The Poisson *probability law* is approximated by this pseudorandom stream; stochastic count and spatial independence are theoretical modeling properties, not empirical proof from one screenshot. A Poisson process may legitimately generate zero points or an arbitrary number near its mean. The expression `N~Poisson(λ)` is not an instruction to place exactly λ points; that behavior is reserved for the binomial process.

The 53 smiling-face feature sites are deliberately retained, so a *smiley plus randomized interior* is not itself an unconditional homogeneous PPP. The empty interior of eyes and a clearance around the mouth are aesthetic constraints. Positive-alpha rendering and arbitrary edits use independent JS and may differ from the pinned SciPy library in degenerate cases.

Next: review the deployed point-set choices on slower mobile devices and verify the figure caption before submitting the still-unsubmitted editorial article. The browser is a teaching renderer, not a claim of exact positive-alpha parity under degenerate Qhull inputs.


## Verified release and reproducibility evidence

- [PR #8](https://github.com/heri-espino/proximitygraphs-siam-figures/pull/8) **merged** into main at commit `7c5ab8c32e22be4dd626a65cabc97376947d5c51`; the project preserves the concurrent editorial experiment009 and every original historical, figure and reference artifact.
- [Final PR Python/pinned ProximityGraphs and Node checks #42554842142](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42554842142): **success**; includes two-hole Pg default, mathematical alpha controls, positive/negative/zero alpha tests, binomial exact N and Poisson point-count mean/variance diagnostics, deterministic seeds, and original Smiley feature-preservation tests.
- [Final PR desktop/mobile Playwright #42554842050](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42554842050): **success**.
- [Postmerge source geometry build and Pages deployment #42555064505](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42555064505): both **success**; deployed figure at https://heri-espino.github.io/proximitygraphs-siam-figures/#habitat .
- [Postmerge Playwright QA #42555064726](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42555064726): **success**. The committed `docs/visual-qa/visual-summary.json` records **14 passed checks** and **10 screenshots**, including `08-smiley-preset.png`, `09-poisson.png`, and `10-binomial.png`. Original historical points, figure captions and reduced-motion handling were also checked.
- The deployed `site/index.html` was inspected in the repository and contains the full `[-100,100]` slider range plus Poisson/Binomial dropdown options and Smiley interior controls. External independent fetch of the Pages URL was not available in the assistant environment, although the GitHub Pages deploy job completed successfully.
