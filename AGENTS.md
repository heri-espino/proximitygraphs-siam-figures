# Agent instructions — ProximityGraphs SIAM News

This repository is the source of truth for every editorial and computational artifact. Read README.md, this file, AI_HANDOFF.md, docs/EDITORIAL.md, article/main.tex and the visualization source before editing. Preserve scripts, notes, data, images, and generated results.

## Editorial constraints
- Intended venue: SIAM News, **Software and Programming**. Status: unsubmitted draft, NOT a peer-reviewed journal article.
- Official style guide: https://www.siam.org/media/gfbjvzck/siam-news-info-and-style-guide.pdf
- Target ~800–1,400 words; 1–3 figures with captions and credit; <=10 APA-style references; author bios 1–2 sentences each.
- The linked example is https://www.siam.org/publications/siam-news/articles/the-dynamics-of-debt/ . Follow its accessible narrative and linked software, not its precise layout.
- Synthetic points must ALWAYS be labeled synthetic; do not imply that our demonstrations are empirical water, habitat, or telecommunications data.
- Snow's 1854 investigation is historical context; our synthetic water-station diagram is NOT his original map. The original analysis predates modern Voronoi constructions.
- This repo is an outreach companion, not a replacement for the distinct JOSS software manuscript.
- Confirm authorship, affiliations, accuracy, and editorial submission with human contributors before sending to SIAM.
- Keep references to historical material backed by verifiable sources; distinguish mathematical possibility from validated decision support.

## Computation
- Python generator in scripts/export_scenes.py is the authoritative mathematical pipeline. Construct graphs using the installed \`proximitygraphs\` library, NEVER by claiming browser approximations came from that package.
- Voronoi's \`pg.Voronoi\` returns adjacency between *sites*, not Voronoi cell polygons. Cells are computed separately by a Euclidean half-plane clipping algorithm.
- \`pg.Alpha_Hull\` outputs sampled \`arcs\` and analytic straight-edge \`segments\`; do not substitute \`Alpha_Shape\` and claim it is the circular-arc hull.
- \`pg.Beta_Skeleton\` uses beta>=1 with \`type_region="lune"\`; beta=1 corresponds to Gabriel and beta=2 to relative neighborhood graphs, subject to numerical boundary conventions.
- Use deterministic coordinates/seeds; report package version, commit reference, parameter settings and model limitations.
- Browser preview is a mathematically separate fallback when authoritative generated data do not exist. The site clearly identifies which source is loaded.
- Regenerate and commit all result JSON and figures. Never fabricate validation results or claim CI passed when it has not been run.

## Workflow
1. Work on existing branch unless instructed otherwise; preserve concurrent work.
2. Run \`python -m pip install -r requirements.txt\`, \`python scripts/export_scenes.py\`, \`python -m unittest discover -s tests -v\`, and \`python scripts/check_article.py\` before release.
3. Inspect the resulting three visualizations; use site export controls for article-ready snapshots.
4. Track numerical explorations as \`experiment001\`, \`experiment002\`, ... and store methods/results in \`experiments/\`.
5. Update AI_HANDOFF.md at each handoff; commit and push all substantive artifacts.
6. Never merge a PR without explicit authorization. Never send an editorial submission without explicit authorization.
