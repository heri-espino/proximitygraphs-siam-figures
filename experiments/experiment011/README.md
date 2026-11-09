# experiment011 — Screenshot Pg defaults and shared stochastic graph comparisons

**Requested:** November 8, 2026. **Status:** Feature branch; CI/deployment must be verified separately.

## Problem
Match the uploaded Pg alpha-laboratory screenshot on every fresh load, without rewriting the original Python source geometry. Extend **04 / Controlled comparison** so both graph constructions can run on a single sampled binomial or Poisson point process.

## Exact Pg startup configuration
- Selected preset **Pg**, view **Both**; alpha **−48.65245**, implying radius `R = 1/|alpha| ≈ 0.02055` (display 0.021).
- **347** interior points plus the original **298** fixed outline sites: **645 total**.
- Enabled: **alpha-hull**, **alpha-shape**, **retained simplices**, **all supporting circles**.
- Disabled: **Delaunay triangulation**, **selected arc circle**, **circle centers**.
- `Reset points` and changing away from/back to Pg restore the screenshot's controls and density.
- Preserve the pinned Python scene's 600 points and 302 interior sites at alpha −28.57142857142857, the 380-site digitized source file, manuscript figure PNG, and historical Snow inputs. The 645-site browser figure is independent JS geometry, not a new pinned-library export.

## Mathematical point-process comparison

Domain `W=[0,1]^2` of area one. All generators reuse `site/point-processes.js`.

| Process | Parameter | Observed count | Locations |
| --- | --- | --- | --- |
| Original sensors | No parameter | Original 25, or sensor-editor modifications | Deterministic Python-exported synthetic sensors |
| Binomial point process | `n` | `N=n` exactly | `X_i iid Uniform(W)` |
| Homogeneous Poisson point process | intensity `lambda` | `N~Poisson(lambda)` | Conditionally `X_i iid Uniform(W)` |

The shared parameter slider ranges from **0 to 80** in steps of one (slower beta-empty-lune comparison is `O(N^3)` in the independent browser implementation). The stochastic sample is generated **once** per parameter change or seed increment, stored in `state.comparePoints`, and reused for both panels, irrespective of graph selection, swap or redraw. Sensor mode continues consuming the live `#sensors` editor data. Reset restores sensor mode, Gabriel on left and RNG on right. Each sample uses a dedicated seed **90311** (separate from the alpha laboratory) and the existing deterministic 32-bit generator; **Generate new shared realization** increments its seed.

No hard-core exclusion, spacing regularization or rejection-sampling is applied to PPP/BPP. The observed Poisson count is displayed next to (but is not necessarily equal to) its expected lambda. These are synthetic teaching configurations, not field observations. Neither process is recomputed using the Python ProximityGraphs library inside the browser; the exported pinned library data only apply to the unchanged default sensors.

## Files and algorithm
- `site/app.js`: Pg view constants and state, source selection, one cached stochastic point set, both graph panels, reshuffle and reset controls.
- `site/index.html`, `site/styles.css`: screenshot defaults and comparison generator selector/sliders/observed count.
- `tests/test_editor.js`: parameter/source invariants and comparison cache invariance.
- `tests/visual_smoke.py`: desktop/mobile interactive QA, equal source coordinates, count correctness, resampling and reset.
- `README.md`, `AGENTS.md`, `AI_HANDOFF.md`: implementation and independent-agent handoff.
- Unchanged: `site/data/scenes.json`, `scripts/export_scenes.py`, historical source CSVs, original image-derived Pg sample and prior experiments.

## Reproduction
```bash
python -m pip install -r requirements.txt
python scripts/export_scenes.py
python -m unittest discover -s tests -v
node --check site/app.js
node --check site/editor.js
node --check site/point-processes.js
node tests/test_editor.js
python -m pip install playwright==1.57.0
python -m playwright install chromium
python tests/visual_smoke.py --output docs/visual-qa
```

## Limits / next
Changing either graph does not change the underlying sample, but the independent JS graph constructors still have geometric/numerical limitations (especially with many sites). When the Poisson count is zero the panels should display no sites, not fabricate edges. A Poisson count cannot be forced equal to lambda without changing its distribution. The site should be released only after CI, relevant screenshots and the pull request are inspected. Preserve and document passing job links, and do not merge without authorization.
