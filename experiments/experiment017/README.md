# experiment017 — Independent β/α sliders in the controlled comparison

**Date:** November 10, 2026  
**Status:** Implementation complete; exact CI validation recorded below after passing.

## Objective

The existing Figure 4 (Controlled comparison) fixed β-skeleton to β=1.5 and alpha-shape to α=−4, although Figure 2 already allowed adjusting alpha and Figure 3 beta. The user explicitly requested **a contextual slider for either construction on both comparison panels**, and asked to merge the GitHub change. Two graphs must use **the same set of locations** regardless of their separate parameter settings.

## Design decisions and geometric definitions

- Each panel has an independent β value (default **1.5**) and independent signed α value (default **−4**). Changing graph families does not discard the unused setting.
- **β-skeleton slider:** 1≤β≤3 in increments of 0.1; all edges satisfy the same open two-disk lune emptiness predicate as the established sensor example. β=1 gives Gabriel and β=2 relative-neighborhood graphs in the adopted convention.
- **Alpha-shape/alpha-hull slider:** −40≤α≤−1 in increments of 0.5. For negative α, the radius is **R=1/|α|**. The straight boundary edge set follows retained Delaunay simplices. Alpha-hull is added as an explicit construction using **curved sampled circular arcs** from `fallbackAlpha`, with straight fallback for open/degenerate chains. The main standalone alpha laboratory's positive/zero α conventions remain unchanged.
- Hide both sliders when choosing a non-parameterized Delaunay, Gabriel, or RNG graph; display a correctly named live output when β/α applies.
- **Swap** transfers the chosen graph AND the full parameter settings to the opposite side; **Reset** restores the sensor sample, Gabriel/RNG choices, β=1.5/α=−4 defaults. Changing a parameter never changes the sample's seed, point count or coordinates.
- If a graph and parameter match the precomputed Python reference on the original unedited sensor set, use the **actual ProximityGraphs reference edges**. Non-default β/α, alpha-hull arcs, stochastic samples and edited sensors run independent JavaScript geometry, labeled as such.

## Implementation details

- `site/index.html` and `site/styles.css`: independent context-sensitive slider panels under left and right graph selectors; add alpha-hull to both lists, live accessible outputs and responsive layout.
- `site/geometry-details.js`: backward-compatible `compareGraphEdges(points,graph,beta=1.5,alpha=-4)`; alpha-hull returns its underlying boundary endpoint pairs.
- `site/app.js`: `compareSettings.left/right`, graph-parameter mode, synchronization, parameter-aware edge calculations and labels, real curved arcs for alpha-hull, swap/reset handling and accurate provenance notes.
- `tests/test_editor.js`: compare β across seven values, compare alpha-shape and alpha-hull endpoint sets across five values, assert actual curves, validate contextual controls.
- `tests/article_browser_smoke.py`: operate the actual embedded comparison iframe via Playwright; change β and α separately, verify visible curved polylines and constant coordinates, then swap/reset both graphs and parameters.
- `docs/CONSTRUCTIONS.md`, README, `site/article.html`, `AGENTS.md` and `AI_HANDOFF.md`: mathematical guidance, user-facing instructions, source distinction and reproducibility.

## Reproduce

From the repository root, with Python/Node and the pinned library installed:

```bash
python -m pip install -r requirements.txt
python scripts/export_scenes.py
node --check site/app.js
node --check site/geometry-details.js
node tests/test_editor.js
python -m unittest discover -s tests -v
python scripts/check_article.py
```

For real browser verification:

```bash
python -m pip install playwright==1.57.0
python -m playwright install chromium
python tests/visual_smoke.py --output docs/visual-qa
python tests/article_browser_smoke.py --output docs/visual-qa
```

These generate reproducible screenshots under `docs/visual-qa/`. The GitHub Actions Visual QA workflow archives and commits screenshots after a main-branch merge. The GitHub Pages job separately verifies deployment. The scientific source scenes, article LaTeX/PDF and original four Python-built figures are untouched.

## Expected checks and limitations

The graph *topology* can change while points stay fixed; a β change can remove or add candidate edges, whereas an alpha-shape/hull change can create or remove connected boundaries. The hull's drawn arcs differ from the alpha-shape's lines even when they share boundary endpoint pairs. Large |α| may leave no retained triangles, which is valid rather than an error. All computations are planar and illustrative; no physical radio-link feasibility or statistical confidence claim follows.

**This is a software UI/math experiment, not a SIAM submission or a modification to the article's author order.** User has explicitly authorized merging this PR after successful testing.

## Next

Confirm the specific PR CI statuses, fix any browser regression, merge PR #14, verify main-branch visual QA/screenshots and Pages deployment; record exact successful run URLs and commit SHAs here and in the agent handoff.


## Validation and merged release — November 10, 2026

- [PR #14](https://github.com/heri-espino/proximitygraphs-siam-figures/pull/14) was **squash-merged** into `main` at commit `cc94d454b603c07e1ceb30e53de22c57abc95ec8` following three green checks on the exact PR head `9f0f84983ab93af2a6ca886904bec5755d91fc06`.
- [Python source/Node geometry regression #42838003920](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42838003920): **success**, including all β/α parameter comparisons.
- [Actual Chromium browser visual QA #42838003820](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42838003820): **success**, including live embedded Figure 4 interactions, independent sliders, true hull polyline arcs, contextual hide/show, swap/reset, and unchanged left/right coordinates.
- [Unchanged LaTeX PDF-author-proof build #42838003747](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42838003747): **success** (this experiment changes no article mathematics or text beyond the online Figure 4 explanatory sentence).
- [Post-merge Chromium QA #42838664399](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42838664399): **success**, with the new evidence screenshot [19-article-comparison-parameters.png](../../docs/visual-qa/19-article-comparison-parameters.png) and passed [article-browser-summary.json](../../docs/visual-qa/article-browser-summary.json) **committed** on `main` at commit `cdfda044b926f1cb0d5ad74851641af007a3ceab`.
- [Post-merge figure/Pages run #42838664748](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42838664748): authoritative figure tests **succeeded**; the Pages deployment job was still in progress at the last observation when this note was written. **Do not claim public deployment success until the Pages job explicitly concludes successfully.** The public URL is https://heri-espino.github.io/proximitygraphs-siam-figures/#compare.
- The selected two graph families need not share a parameter. Only the point sites are shared; their distinct β/α values determine topology, and the circular alpha-hull is not the straight alpha-shape.
