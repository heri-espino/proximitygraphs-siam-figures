# experiment002 — Historically meaningful and recognizable defaults

**Date:** 2026-11-05  
**Status:** Complete — merged PR #1, successful geometry CI, visual QA and GitHub Pages deployment.

## Purpose and design

Replace the three generic point sets with: historical John Snow pumps and death marks, a synthetic smiling face for alpha-shape/alpha-hull exploration, and synthetic sensor outposts connected by three relay sites for the β-skeleton.

Sources: the raw \`HistData::Snow.pumps\` and \`HistData::Snow.deaths\` CSVs, copied unchanged to \`data/historical/\`. They contain 13 historical pump sites and 578 death-location marks. Their common map-coordinate aspect ratio is preserved in a single affine normalization. Overlaying a modern Voronoi diagram does **not** reproduce John Snow's actual analytical method.

The smiley is constructed from 30 slightly irregular outline points, 12 eye-ring points and 11 curved mouth points. Its circumradius distribution was inspected before selecting alpha values \`-4,-8,-10,-12\`, so increasing alpha magnitude actually filters Delaunay triangles and changes topology. The beta example is a deterministic 25-node relay-corridor scenario, not real radio hardware or measurement data.

## Reproduction

\`\`\`bash
python -m pip install -r requirements.txt
python scripts/export_scenes.py
python -m unittest discover -s tests -v
node --check site/app.js
node --check site/editor.js
node --check site/geometry-details.js
node tests/test_editor.js
\`\`\`

Visual-QA browser checks are in \`tests/visual_smoke.py\`. The GitHub Actions figure workflow regenerates/commits the JSON and PNG/SVG figures after merging to main. The static SIAM article is generated from \`article/feature.md\` by \`scripts/render_article.py\`.

## Key invariants

- Historical coordinates: 13 pumps, 578 death marks, Broad St label, normalized points in \`[0,1]^2\`.
- Smiley: 53 distinct points, nonempty alpha-hull arcs, alpha-shape/hull boundary agreement with the Python library.
- Relay network: 25 nodes, accepted/rejected beta candidate status and nested graphs verified against Python.
- Editing historic pumps marks the new configuration hypothetical; historic death marks remain fixed.
- No deployment, PDF, or PR success should be claimed before the corresponding workflow succeeds.

## Validation results and reproducibility evidence

- [PR #1](https://github.com/heri-espino/proximitygraphs-siam-figures/pull/1) was merged to `main` at commit `60a0170992895e46d3ace97d15439aa3943b9021`, following explicit authorization.
- [PR mathematical regression workflow](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42113515738): **success**, including geometry generated from the pinned Python package and comprehensive JavaScript checks.
- [PR browser visual QA](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42113515794): **success**; historical marks, all geometry views, editing and mobile layout.
- [Postmerge production geometry and Pages workflow](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42114104361): **success**; data and regenerated figures committed and Pages deployed.
- [Postmerge browser visual QA](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42114104386): **success**, with seven desktop/mobile screenshots and eight programmatic checks saved in `docs/visual-qa/`.
- [Regenerated scene JSON](../../site/data/scenes.json) checked on GitHub: 13 labelled historical pumps, 578 historical death records, 53 smiley sites, alpha options with 74/65/48/31 retained Delaunay triangles, and 25 beta sites. Defaults are derived from the documented historical source and deterministic generators.

The **first** postmerge QA run completed browser checks but failed at its screenshot commit because independent figure generation left a dirty Git worktree. The Visual QA workflow was corrected to restore only its temporary generated figure copies before rebasing; the subsequent workflow completed successfully and preserved screenshot artifacts. No mathematical tests were weakened.

## Next directions

Potential future experiment003: quantify end-to-end performance and test degenerate geometries and arbitrary edited point sets, rather than the selected default point clouds alone. Do not claim a modern epidemiological or communication-network model from this historical and synthetic demonstration.
