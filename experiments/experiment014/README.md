# experiment014 — First-author correction and Markdown-first manuscript release

**Date:** November 9, 2026
**Status:** source and release-workflow changes complete; verify PR checks before merging.

## Objective

Correct the first/second author attribution and retain a reproducible Markdown-only drafting process until all coauthors approve a manuscript version. SIAM News accepts a PDF or Word draft, while LaTeX is optional mathematical source. The user explicitly prefers to write/review in Markdown before generating deliverables.

## Research and decisions

The official [SIAM News submission instructions](https://www.siam.org/publications/siam-news/about-siam-news/submission-guidelines/) and [SIAM News style guide](https://www.siam.org/media/gfbjvzck/siam-news-info-and-style-guide.pdf), page 2, specify PDF/Word drafts, with LaTeX helpful for equations/symbols. Markdown is not listed as an editorial attachment but is a suitable Git-tracked authoring format.

The lead author specified the proposed order: **Heriberto Espino-Montelongo (first)**, **Héctor Maravillo (second)**, Diego Villarreal de la Cerda (remaining third author, pending full coauthor sign-off).

## Changes

- Reordered canonical manuscript byline and biography blocks, pitch, editorial cover note, and the future TeX title/PDF metadata.
- Changed the article-PDF workflow from automatically running on Markdown pushes to a **manual dispatch** that requires the person triggering it to confirm collective author approval.
- Decoupled the ordinary editorial checker from stale LaTeX. The optional `--check-generated` mode validates the freshly produced LaTeX file in the later release stage.
- Preserved all previously generated PDF/TeX artifacts, scientific figures and numerical results; the older TeX/PDF has a **superseded author order** and must not be used for submission.
- Documented the process in [docs/MANUSCRIPT_WORKFLOW.md](../../docs/MANUSCRIPT_WORKFLOW.md).

## Reproduce

During drafting:

    python scripts/check_article.py

After genuine coauthor approval, manually dispatch the article PDF workflow on main with `approved_by_all_authors=true`, then verify:

    python scripts/render_article.py
    python scripts/check_article.py --check-generated
    cd article
    pdflatex -interaction=nonstopmode -halt-on-error main.tex

No final PDF or Word is generated during this source-only experiment. Markdown source is authoritative until an approved conversion.

## Limitations and next steps

The first and second positions were confirmed by the lead author; final approval of the third author and entire byline remains necessary. The previous proof is intentionally out of date. Confirm PR checks and merge, then continue Markdown review. Obtain all coauthors' consent and confirm figure/data rights before manual export or SIAM submission.
