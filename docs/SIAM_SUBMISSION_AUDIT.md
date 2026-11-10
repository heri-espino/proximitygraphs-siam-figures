# ACTIVE AUDIT — experiment016, November 9, 2026

The currently editable SIAM News feature is `article/main.tex`, with **Heriberto Espino-Montelongo first** and **Héctor Maravillo second**, and **no third author**. The manuscript discusses **only geometric proximity graphs**, not the software's separate biological heuristics. It contains **four** numbered static figures with corresponding live interactive figures on the author's [online article](https://heri-espino.github.io/proximitygraphs-siam-figures/article.html), two numbered equations, ten alphabetized references and credited source data. `scripts/check_article.py` enforces this current state.

**Editorial approval is NOT automatic.** The [SIAM News style guide](https://www.siam.org/media/gfbjvzck/siam-news-info-and-style-guide.pdf) normally suggests one to three images; the [2026 VisualPDE online feature](https://www.siam.org/publications/siam-news/articles/visualpde-interactive-spatiotemporal-modeling-via-web-browsers-on-any-device/) illustrates four numbered interactive animations. We therefore **propose four author-hosted interactive figures** and will ask the editors whether they prefer four online embeds, four links, or a 1–3 image print selection. Our four iframes are not on SIAM's servers and are not yet an approved publication format.

**Evidence and preparation:** Canonical TeX is compiled by `.github/workflows/article-pdf.yml`. `scripts/export_scenes.py` creates four original Python-backed PNG/SVG scientific figures, including a controlled same-site Gabriel-versus-RNG comparison. `site/article.html` uses four *live* embedded original lab sections; `site/article.js` fits their height. See `site/EMBEDDING.md` and `experiments/experiment016/README.md`. No external editorial submission/email has been made. Complete Héctor's sign-off and source-artwork/historical-record rights review first.

---

*Earlier audits below are retained as a historical record and may describe superseded three-author, three-figure, Markdown-first or bio-inspired drafts.*

# CURRENT SUBMISSION STATUS — experiment015 (November 9, 2026)

The user superseded earlier Markdown-only authoring and three-author assumptions. **Current canonical article is [LaTeX](../article/main.tex), not article/feature.md.** Only **Heriberto Espino-Montelongo** (first) and **Héctor Maravillo** (second) are article authors. The current PDF is compiled directly from LaTeX as a *review proof*, not automatically sent. Previous audit results for the older 3-author PDF/Markdown are historical, **not the current submission packet**. The official SIAM News style guide permits submission as PDF/Word and welcomes LaTeX when mathematical notation is present. Re-run `scripts/check_article.py` and review the new PDF, proof figures and two biographies. Publication approval and source-image rights remain open.

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
## Verified build and proof — November 8, 2026

- [Successful SIAM News PDF workflow #42556998781](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42556998781): the new mechanical editorial-check step passed, and LaTeX compilation, image verification, artifact upload and repository commit all completed successfully.
- Its check_article.py log reports **1,250 words including captions**, **3/3 figures**, **10/10 bibliography entries**; it also passes first-author alphabetical sorting, figure credits/links and one-sentence bios.
- [Successful figure/mathematical workflow #42557091611](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42557091611) separately passed.
- Downloaded actual CI proof to a local runtime and verified **four US Letter pages**, **three embedded image objects** (one displayed per figure page), equations and symbols, credits in all three captions, and author biographies on page four.
- Extracted PDF URI targets include the three deep links (#water, #habitat, #sensors), #compare, ProximityGraphs source, PyPI and HistData. All four PDF pages were rendered and visually reviewed: no obvious clipping or an isolated author-bio page.
- **Outside CI:** this session's public web retrieval could not access the hosted GitHub Pages site directly, although its existing Pages build and visual QA have passed in earlier workflows. Before actual SIAM submission, manually open each hosted deep link to confirm availability.
- **Not yet cleared:** coauthor consent, third-party historical dataset reuse and supplied serif-image rights, editor-specific length/online placement policy. No external editorial email was sent.


## November 9, 2026 — Author order and Markdown-first release policy

The lead author clarified the first and second byline positions: **Heriberto Espino-Montelongo (first)**; **Héctor Maravillo (second)**. **Diego Villarreal de la Cerda** remains the third proposed contributor. All must confirm the final submitted list.

The official SIAM News style guide requests **PDF or Word**, and says LaTeX is helpful for equations; Markdown is an internal authoring format and is the canonical source `article/feature.md`. Our previous PDF/TeX files are **historical proofs with superseded author attribution**. After genuine coauthor approval, manually run `article-pdf.yml` with `approved_by_all_authors=true` to regenerate and archive approved LaTeX and PDF. No build on draft Markdown pushes. The older statement in this audit that the current stored PDF is 'ready' refers to its historical mechanics, **not** current author approval. Details in [MANUSCRIPT_WORKFLOW.md](MANUSCRIPT_WORKFLOW.md).
