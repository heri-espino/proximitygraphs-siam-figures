# experiment001 — Verification of construction witnesses and interactive sections

**Date:** November 4, 2026  
**Status:** Completed implementation / visual and mathematical validation  
**Purpose:** Confirm that the interactive page's construction layers do not silently diverge from the Python ProximityGraphs library or misrepresent failed empty-region predicates.

## Motivation and hypotheses

1. For default points, the browser alpha-shape boundary agrees with \`pg.Alpha_Shape\`, while the sampled hull arcs agree with \`pg.Alpha_Hull\`.
2. Every candidate lune reported accepted/blocked in the browser agrees with the actual Python \`pg.Beta_Skeleton\` at β ∈ {1, 1.25, 1.5, 1.75, 2}.
3. Delaunay, Gabriel, RNG, β-skeleton and alpha-shape comparisons use exactly the same point set, and their default edge lists agree with Python constructors.
4. The browser can render all supporting circles, highlight a blocking point, move a point and update both comparison plots without JavaScript errors on desktop or mobile.

## Implementation

- \`scripts/export_scenes.py\`: exact reference geometry, pinned ProximityGraphs source commit \`d1a216d7255cbebea68dcaad6a97382168a3ec55\`.
- \`site/geometry-details.js\`: independent browser predicates and witnesses.
- \`site/editor.js\`, \`site/app.js\`, \`site/index.html\`: interaction and visualization.
- \`tests/test_geometry.py\`: Python reference invariants.
- \`tests/test_editor.js\`: exhaustive candidate-pair checks and geometry equivalence.
- \`tests/visual_smoke.py\`: reproducible Chromium screenshots and interactive smoke checks.

## Reproduction

\`\`\`bash
python -m pip install -r requirements.txt
python scripts/export_scenes.py
python -m unittest discover -s tests -v
node --check site/geometry-details.js
node --check site/app.js
node --check site/editor.js
node tests/test_editor.js
python -m pip install playwright==1.57.0
python -m playwright install chromium
python tests/visual_smoke.py --output docs/visual-qa
\`\`\`

## Evidence and results

- [Mathematical + Pages workflow](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/41915500770): **success**; pinned library reference JSON and PNG/SVG outputs committed.
- [Visual QA workflow](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/41916762306): **success**.
- [Visual summary](../../docs/visual-qa/visual-summary.json): all seven listed checks passed.
- [Desktop and mobile screenshots](../../docs/visual-qa/): seven original PNGs demonstrating the new sectioned layout, construction geometry, blocked β candidate, comparison and mobile layout.

## Interpretation, constraints and next steps

The inspected default point sets and selected graph parameters agree between the pinned Python constructors and the separately implemented JavaScript geometry. Visual inspection establishes that the browser widgets render and respond; it does **not** establish correctness for every degenerate point configuration, a high-dimensional implementation, performance or empirical application validity. The current browser cap is 80 points; the rejected-pair overview is intentionally disabled above 45 points, but individual pairs remain inspectable.

Future research should validate random and adversarial point sets, computational scaling, numerical degeneracies, and any proposed real-world inference before advertising a performance or scientific claim. Treat geometry tools as **demonstrations**, not a production decision engine.
