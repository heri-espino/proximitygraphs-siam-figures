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
- John Snow mapped cholera deaths around the Broad Street pump in Soho, London, 1854. Modern researchers have reconstructed nearest-pump service areas using *network* (walking-distance) Voronoi regions. The introductory interactive here instead uses **invented** water-service sites and **Euclidean** distance. Cite [Walford (2020)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7431402/) and [John Snow Society contextual material](https://johnsnowsociety.org/files/2023/07/Cholera-Epidemic-London-1854-JSS-Short-Version.pdf).
- An alpha-hull describes a spatial envelope of observed points, not a probability distribution or proven habitat boundary. Circular arcs shown come from \`pg.Alpha_Hull\`.
- A beta-skeleton graph gives **geometric candidate connections**, not validated radio links, costs, routing, or ecological corridors.
- Library's \`pg.Voronoi\` computes ridge-derived **site adjacency**. Polygonal regions are computed separately; \`pg.DelaunayG\` is its dual in generic configurations.
- Do not claim these scenarios are documented field applications of this library.

## Editorial release checklist
- [ ] Authors approve byline, affiliations, and biographies
- [ ] Mathematical methods and numerical plots checked against installed ProximityGraphs
- [ ] Every printed caption credits its creators and indicates synthetic data
- [ ] 800–1,400 words (editor dependent); bibliography <=10 and properly sorted
- [ ] Links and QR codes resolve to real deployed Pages URLs
- [ ] PNG/SVG visuals tested at publication resolution
- [ ] Editor has confirmed whether interactive assets can be linked/embedded
- [ ] Submission approved and sent by a human
