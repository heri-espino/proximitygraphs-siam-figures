# experiment011 — SIAM News submission compliance

**Date:** November 8, 2026  
**Status:** Completed mechanical edits; editorial submission remains unapproved and unsent.

## Objective

Audit the exact SIAM News Software and Programming instructions and adapt the existing author draft to satisfy mechanical requirements, without misrepresenting it as a SIAM research journal submission.

## Official material

- [SIAM News submission guidelines](https://www.siam.org/publications/siam-news/about-siam-news/submission-guidelines/)
- [Linked two-page SIAM News style guide](https://www.siam.org/media/gfbjvzck/siam-news-info-and-style-guide.pdf)
- [Reference Software and Programming article](https://www.siam.org/publications/siam-news/articles/the-dynamics-of-debt/)

## Changes and reasons

1. Shortened the three figure captions without removing historical-data attribution, distinctions between synthetic and historical data, explanation of mathematical witnesses, or individual interactive links. Their role is now caption-first rather than mini-tutorial.
2. Sorted the ten APA-like references by first-author surname. In particular, Maravillo precedes Maravillo Gómez as a compound surname.
3. Extended scripts/check_article.py to check alphabetical sorting, credited captions with interactive links, three one- or two-sentence author bios and the six standalone figure assets, in addition to existing length/count checks.
4. Wrote docs/SIAM_SUBMISSION_AUDIT.md with requirements and human blockers and article/submission-email.md as an **unsent** editorial cover note.
5. Preserved all prior experiment sources, historical coordinates, PNG/SVG figures, mathematical methods, website functions, and bibliographic references.

## Reproduction

Run from the repository root:

    python scripts/render_article.py
    python scripts/check_article.py
    cd article
    pdflatex -interaction=nonstopmode -halt-on-error main.tex
    pdflatex -interaction=nonstopmode -halt-on-error main.tex

Then use pdfinfo / pdfimages and inspect all rendered PDF pages. GitHub Actions article-pdf.yml compiles and archives the proof and its LaTeX; verify that the exact workflow run succeeded.

## Findings and uncertainty

The current manuscript has 3 figures and ten citations, supported by historical-data provenance and separate synthetic illustrations. It fits the approximate 800–1,400-word target with captions counted, subject to editor preference. Three proposed authors each have a one-sentence bio. The official guidelines accept PDF or Word and say LaTeX is helpful for equations; they do not require a peer-reviewed-journal template.

Human sign-off remains essential: author order and coauthor consent, historical data/typographic image redistribution rights, exact placement (print/online), and editor permission to include links to external interactive constructions. A successfully compiled PDF does not establish editorial acceptance or legal clearance.

## Next

Confirm actual CI result, review complete PDF visually, add exact run identifiers to this experiment record and handoff, then request author approval before any SIAM email.
## Verified build and proof — November 8, 2026

- [Successful SIAM News PDF workflow #42556998781](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42556998781): the new mechanical editorial-check step passed, and LaTeX compilation, image verification, artifact upload and repository commit all completed successfully.
- Its check_article.py log reports **1,250 words including captions**, **3/3 figures**, **10/10 bibliography entries**; it also passes first-author alphabetical sorting, figure credits/links and one-sentence bios.
- [Successful figure/mathematical workflow #42557091611](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42557091611) separately passed.
- Downloaded actual CI proof to a local runtime and verified **four US Letter pages**, **three embedded image objects** (one displayed per figure page), equations and symbols, credits in all three captions, and author biographies on page four.
- Extracted PDF URI targets include the three deep links (#water, #habitat, #sensors), #compare, ProximityGraphs source, PyPI and HistData. All four PDF pages were rendered and visually reviewed: no obvious clipping or an isolated author-bio page.
- **Outside CI:** this session's public web retrieval could not access the hosted GitHub Pages site directly, although its existing Pages build and visual QA have passed in earlier workflows. Before actual SIAM submission, manually open each hosted deep link to confirm availability.
- **Not yet cleared:** coauthor consent, third-party historical dataset reuse and supplied serif-image rights, editor-specific length/online placement policy. No external editorial email was sent.
