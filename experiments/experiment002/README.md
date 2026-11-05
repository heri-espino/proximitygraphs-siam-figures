# experiment002 — Historically meaningful and recognizable defaults

**Date:** 2026-11-05  
**Status:** implementation; CI verification and PR merge pending.

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

## Next actions

Record actual PR workflow results, rerun if needed, merge after verified checks (owner authorization supplied), inspect regenerated static figures and updated Pages deployment, then update the handoff with actual run IDs and findings.
