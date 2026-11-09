# experiment013 — Publication-ready editorial copy for the interactive website

**Date:** November 9, 2026  
**Purpose:** Replace development notes and internal implementation language in the public website with a coherent, accurate mathematical narrative. This experiment is **editorial only**: it does not change point coordinates, alpha/beta parameters, graph algorithms, scene JSON, or the article manuscript.

## Problem

The deployed site displayed working-note phrases that made sense during iterative software development but read awkwardly to readers: "serif image sampling", an alpha-section introduction advertising a numerical slider range and normalized domain instead of an idea, "matching the reference screenshot", "pinned Python export", "edited points recalculated independently in JavaScript", or "original points" as a prominent figure caption. The user requested a *finished published experience*, not a description of the preceding implementation stages.

## Editorial principles

1. **Lead with the mathematical question, not the interface.** Introduce proximity, region assignment, reconstructing boundaries, empty-region tests, and controlled graph comparisons before discussing sliders.
2. **Keep real distinctions accurate.** Snow's historical Soho pump and death-mark locations come from digitized records; the Voronoi/Delaunay drawing is a modern Euclidean illustration, not Snow's original method and not a causal argument. The Pg, face, sensor pattern, and binomial/Poisson configurations are illustrative.
3. **Keep important mathematical terms.** Preserve alpha-shape versus circular alpha-hull, circumradius cutoff, signed-alpha Delaunay convention, β-lune emptiness, and Poisson random count versus binomial exact count. Do not oversimplify by calling these empirically validated networks.
4. **Use readable controls.** "Pg letterform", "Point set", "Boundary scale", "Points inside the face", "Generate new sample", and "Same points. Different networks." replace engineering or placeholder language.
5. **Remove engineering and submission metadata from the reader's path.** Branches, Python pinning, screenshot origin, JavaScript fallback, editorial submission status, and workflow caveats belong in repository documentation rather than every plot. The About section retains a concise and honest source statement: reference examples use ProximityGraphs, interactive edits are recalculated in the browser.
6. **Preserve accessibility and function.** Keep HTML `id`, `value`, event targets, links, formulas, aria labels and the actual tool behavior unchanged. Source warnings remain accurate on data-loading failure.

## Selected before / after examples

| Earlier UI copy | Published copy |
| --- | --- |
| "Explore alpha-shapes and circular alpha-hulls from −100 to 100 on a common normalized square." | "How does a cloud of points become a recognizable shape? Compare the straight boundary of an alpha-shape with the circular arcs of an alpha-hull." |
| "Pg · serif image sampling" | "Pg letterform" |
| "Retained simplices · reveal holes" | "Triangles passing the radius test" |
| "The interactive Pg view starts with ... matching the reference screenshot; the preserved pinned Python export ..." | A short explanation of what the radius threshold does, how holes appear, and how Poisson differs from binomial sampling |
| "One point set. Two definitions." | "Same points. Different networks." |
| "Original sensor comparison edges come from the pinned Python ..." | "Both panels use the same locations, making the effect of each connection rule easy to compare." |
| "Edited points · recalculated locally in JavaScript (not a new ProximityGraphs export)." | "Points adjusted · the geometry responds to your changes." |

## Files

- `site/index.html`: all major sections, explanatory paragraphs, navigation, captions, controls, alt text, About section and footer.
- `site/app.js`: runtime chart subtitles, source/status messages, Voronoi/alpha/beta inspector explanations, Poisson/binomial count descriptions and controlled-comparison messages.
- `site/editor.js`: point-edit guidance and reader-facing state notices.
- `tests/test_editor.js`: static copy checks, including guardrails against development-era phrases in the published HTML.
- `tests/visual_smoke.py`: updates only the assertions that depend on revised visible text; geometry, interaction, and visual tests are preserved.
- `README.md`, `AGENTS.md`, `AI_HANDOFF.md`: preserve the full technical provenance and editorial rationale for future agents.

### Reproduce

```bash
python -m pip install -r requirements.txt
python scripts/export_scenes.py
python -m unittest discover -s tests -v
node --check site/app.js
node --check site/editor.js
node tests/test_editor.js
python -m pip install playwright==1.57.0
python -m playwright install chromium
python tests/visual_smoke.py --output docs/visual-qa
```

Inspect all desktop/mobile screenshots and ensure the actual mathematical controls and historical map datasets remain unchanged. Mathematical provenance is documented in `docs/CONSTRUCTIONS.md`, including the distinct pinned Python and browser-computed geometries.

## Evaluation and limits

This is an editorial quality intervention, not a new numerical experiment or a mathematical performance claim. Passing UI and browser tests demonstrates that the site's **observable interaction behavior** remains intact, not that every possible sentence is optimal. Retain precise mathematical terminology where needed; avoid adding alternative physical interpretations, empirical guarantees, or claims of SIAM publication. Future updates should keep manuscript drafting, screenshot history, CI and internal method caveats in the repository, not in public figure descriptions.

**Release status: merged and deployed.** [PR #10](https://github.com/heri-espino/proximitygraphs-siam-figures/pull/10) was merged at `0b3b2e92e08842e776ba5f6100de1b29b9400e1e` after all required checks passed.

### Validated release evidence — November 9, 2026

- [Feature-branch Python/Node mathematical and UI checks #42630218416](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42630218416): **success**.
- [Feature-branch desktop/mobile browser visual QA #42630218675](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42630218675): **success**.
- [Post-merge reproducible geometry + Pages deployment #42630569488](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42630569488): **success** for both figures and Pages jobs.
- [Post-merge browser visual QA #42630569207](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42630569207): **success**. Its workflow also committed the refreshed 12 desktop/mobile examples into `docs/visual-qa/` (subsequent commit on `main`).
- Live site: https://heri-espino.github.io/proximitygraphs-siam-figures/ ; the hosted deployment is confirmed by GitHub's deployment job, not an independent inspection of the external UI.
- The SIAM News article remains an unsubmitted manuscript; only the public interactive website copy was edited.
