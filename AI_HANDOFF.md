# AI handoff

## Objective
Produce a polished outreach article for SIAM News (Software and Programming), supported by three **interactive by default** diagrams that have reproducible scientific static exports. The target is applied math students and researchers unfamiliar with proximity graphs. Figures link from the manuscript to a GitHub Pages companion.

## Source material
- Library: https://github.com/ProximityGraphs/ProximityGraphs, inspected at commit d1a216d7255cbebea68dcaad6a97382168a3ec55.
- Methods: \`pg.Voronoi\`, \`pg.DelaunayG\`, \`pg.Alpha_Hull\`, \`pg.Beta_Skeleton\`.
- JOSS paper is a separate task. Do not turn this story into a software journal paper.
- Reference SIAM News story: https://www.siam.org/publications/siam-news/articles/the-dynamics-of-debt/

## Decisions
- Figure 1: hypothetical water distribution stations; Euclidean Voronoi service cells and dual adjacency. Mention John Snow's 1854 cholera mapping as history, but neither the data nor the model depicts his actual map.
- Figure 2: hypothetical habitat observation sites; \`Alpha_Hull\` varying negative alpha; show curved arcs and the defining circle. This is *not* a habitat suitability prediction.
- Figure 3: hypothetical wireless sensor positions; beta-skeleton edge candidates as beta changes; show empty lune for selected edge. This is *not* a radio-coverage model.
- Screenshot from each live SVG is the static publication figure, with caption including companion URL.
- LaTeX source is professional but deliberately **not** a journal article class; SIAM News specifically discourages journal-like writing.

## Repository map
- \`article/main.tex\`: editable article source; \`article/pitch.md\`: draft query for editors.
- \`site/\`: zero-framework, responsive interactive figures. Open via local static HTTP server.
- \`scripts/export_scenes.py\`: Python-authoritative graph exports, JSON and PNG.
- \`scripts/check_article.py\`: rough prose word-count/policy checker.
- \`tests/\`: geometry-export structural tests.
- \`docs/EDITORIAL.md\`: factual guardrails, links, acceptance checklist.
- \`.github/workflows/build.yml\`: CI; verify outputs, upload artifacts. It does not automatically submit or publish.

## Remaining steps
- Install dependencies in a network-enabled environment and run the generator; add the generated scene JSON and PNGs to version control.
- Review visual appearance and captions and verify the mathematical edge and arc outputs against the installed package.
- Confirm actual author bylines, bios, contact details, and permissions with all collaborators.
- Enable GitHub Pages from the \`main\` branch / \`site\` content via the documented deploy workflow; inspect the public address before claiming it is live.
- Ask editors whether interactive demos may be linked, embedded, or accompanied by video.
- No SIAM submission has been made.
