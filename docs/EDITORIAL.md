# SIAM News editorial checklist (November 2026)

## Verified primary sources
- [Style guide (2-page PDF)](https://www.siam.org/media/gfbjvzck/siam-news-info-and-style-guide.pdf)
- [Submission guidelines](https://www.siam.org/publications/siam-news/about-siam-news/submission-guidelines/)
- [Comparable Software and Programming article: The Dynamics of Debt (June 2026)](https://www.siam.org/publications/siam-news/articles/the-dynamics-of-debt/)

## Rules
SIAM News is the *newsjournal*, not a peer-reviewed SIAM research journal. Articles should be newsy and accessible, ~800–1,400 words; ideally 1–3 credited images; references alphabetized and APA-like, <=10; 1–2 sentence bios; up to 4–5 authors. Equations are welcome when useful. References and hyperlinks can be footnotes. PDF or Word draft accepted, with LaTeX file useful for equations. Editorially edited after submission. The guide says typical publication 1–2 months from initial submission but does **not** guarantee acceptance or timing.

## Interactive strategy
SIAM permits videos in online articles and links in the web version. The guides do **not** promise arbitrary interactive HTML embedding. Each submitted static figure should link to a hosted external GitHub Pages visualization. Ask the editors for permission before assuming they will embed a dynamic visualization.

## Historical and application guardrails
- John Snow mapped cholera deaths around Broad Street in 1854. The interactive now uses **13 historical pump locations** and **578 digitized death-location records** from the [HistData Snow dataset](https://rdrr.io/cran/HistData/man/Snow.html), normalized with a common scale. The cells and triangles are a **modern Euclidean Voronoi/Delaunay overlay**, not Snow's method. Death marks are not graph vertices; moving a pump produces a hypothetical scenario. See [raw data and processing](../data/historical/README.md).
- The alpha figure defaults to a **synthetic 380-point image-traced serif Pg**, with two letter components and two counters at alpha approximately -28.57; a 53-point smiley is selectable. Straight boundaries come from pg.Alpha_Shape and circular arcs from pg.Alpha_Hull. The circles and centers are construction witnesses, not a confidence boundary or documented habitat area.
- The **25-point synthetic relay-sensor example** has two clusters and three relay sites. A blocked candidate with a highlighted point in its lune is *not* a graph edge. Neither physical connectivity, routing, nor radio efficiency is validated.
- Library's \`pg.Voronoi\` computes ridge-derived **site adjacency**. Polygonal regions are computed separately; \`pg.DelaunayG\` is its dual in generic configurations.
- Do not claim these scenarios are documented field applications of this library.

## Editorial release checklist
- [ ] Authors approve byline, affiliations, and biographies
- [ ] Mathematical methods and numerical plots checked against installed ProximityGraphs
- [ ] Every printed caption credits the visualization; the historical layer credits HistData, and synthetic examples are labeled accurately
- [ ] 800–1,400 words (editor dependent); bibliography <=10 and properly sorted
- [ ] Links and QR codes resolve to real deployed Pages URLs
- [ ] PNG/SVG visuals tested at publication resolution
- [ ] Editor has confirmed whether interactive assets can be linked/embedded
- [ ] Submission approved and sent by a human


## Completed proof and outreach deliverables (2026-11-03)
- Proposed feature: [article/feature.md](../article/feature.md) (~1,010 words).
- Matching TeX proof: [article/main.tex](../article/main.tex); PDF: [article/output/proximitygraphs-siam-news-draft.pdf](../article/output/proximitygraphs-siam-news-draft.pdf).
- Verified successful [revised LaTeX and image-embedding workflow](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/41769671238): US Letter, 5 pages, 3 embedded raster figures. The initial proof had an orphan sixth page and was corrected after rendering. Do not call this a final SIAM layout.
- Separate [outreach kit](../article/marketing-kit.md) with optional marketing copy; no external posts or editorial emails have been sent.
- Prioritize truthful scientific communication over hard product advertising. The manuscript explains geometric choices, demonstrates synthetic use cases, and offers verified GitHub/PyPI calls to action.
- Pending: in-person visual proof, consent/affiliations, final caption permissions, SIAM editor pitch approval and confirmation of editorial policy on publicly accessible drafts.

## Current figure provenance (November 8, 2026)

The PDF renderer must use per-figure attribution from the Markdown captions. The historical John Snow pump/death marks are digitized evidence, so never append a universal claim that *all* sites are synthetic. The image-traced Pg/smiley and relay-sensor configurations are synthetic instructional data. Both the paper's three chapter links and the new graph-comparison link must resolve. Inspect the rebuilt PDF for credits, equations, legibility, and link behavior before submission.
