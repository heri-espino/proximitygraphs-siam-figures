# SIAM News submission audit — experiment011

**Date:** November 8, 2026. **Venue:** SIAM News, Software and Programming. **Status:** author draft, not submitted.

## Official sources

- [Current SIAM News submission guidelines](https://www.siam.org/publications/siam-news/about-siam-news/submission-guidelines/)
- [Two-page SIAM News style guide, linked from the guidelines](https://www.siam.org/media/gfbjvzck/siam-news-info-and-style-guide.pdf)
- [Published Software and Programming example: The Dynamics of Debt](https://www.siam.org/publications/siam-news/articles/the-dynamics-of-debt/)

## Compliance checklist

| SIAM News rule | Evidence | Status |
| --- | --- | --- |
| **Software and Programming**, accessible/newsy rather than a research journal | Article focuses on mathematics behind ProximityGraphs and practical comparisons | Ready; editorial judgment remains |
| Roughly 800–1,400 words, article-dependent | scripts/check_article.py counts narrative and all captions | Automated; editors may specify target |
| 1–3 credited illustrations | Exactly three numbered figures; separate original PNG and SVG files in site/assets | Ready; publication rights require confirmation |
| <=10 references; APA-style and alphabetized | Exactly 10 references, first-author surname order checked | Automated; bibliographic copyediting remains |
| At most 4–5 contributors | Three provisional authors | Numerical pass; coauthor permission pending |
| One- or two-sentence biographies | Three one-sentence bios | Automated |
| PDF or Word attachment; LaTeX helpful for mathematical content | Generated PDF plus TeX, source Markdown | Ready after CI proof verification |
| Equations and hyperlinks permitted | Geometric inclusion and Poisson degree, three figure links and software URL | Ready; editor to approve link/online policy |
| Headshots | Optional | Not required |
| Print vs online | SIAM offers print and online formats | Decision for editors |

**Important:** SIAM News is a newsjournal, not a peer-reviewed SIAM research journal. The official guide does **not** require a SIAM journal LaTeX template. Equations are welcome; links may appear as website hyperlinks. The guide describes articles typically publishing one to two months after initial submission, but that is not a guarantee or acceptance commitment.

## Recommended submission packet

1. **Primary attachment:** article/output/proximitygraphs-siam-news-draft.pdf — author proof, not a SIAM typeset galley.
2. **Separate image files:** site/assets/figure01-water.png, figure02-habitat.png, figure03-sensors.png. Matching SVGs are also committed.
3. **Optional mathematical source:** article/main.tex, generated from canonical article/feature.md.
4. **Figure origin:** data/historical/README.md for John Snow's historical digitization; docs/CONSTRUCTIONS.md for algorithms and generated example limitations.
5. **Interactive companion:** https://heri-espino.github.io/proximitygraphs-siam-figures/ with #water, #habitat, #sensors and #compare anchors.
6. **Proposed email to editors:** article/submission-email.md (draft only, never sent).

## Outstanding manual requirements

- [ ] All three coauthors approve text, author order, exact affiliations, bios and correspondence details.
- [ ] Verify HistData/Rdatasets digitization reproduction rights (public access alone does not establish unrestricted redistribution).
- [ ] Verify rights to the supplied typographic image from which the serif Pg geometry was traced; ensure derived graphics can be reproduced.
- [ ] Review all static images and PDF pages at intended display size, including equation symbols, footnotes/hyperlinks and captions.
- [ ] Confirm with the editor the target length for Software and Programming and suitability for print versus online.
- [ ] Ask whether linking to external interactive figures is appropriate; do **not** assume dynamic embedded widgets are supported.
- [ ] Obtain explicit authorization before sending an email or submitting in any author's name.

## Preflight

Run these commands from the repository root:

    python scripts/render_article.py
    python scripts/check_article.py
    cd article
    pdflatex -interaction=nonstopmode -halt-on-error main.tex
    pdflatex -interaction=nonstopmode -halt-on-error main.tex

The article GitHub Actions workflow regenerates the PDF and commits both manuscript source and author proof. Check the *actual latest run* before claiming publication readiness.

**Not verified or implied:** approval by SIAM, peer-review acceptance, print placement, full licensing clearance, or publication date.