# Markdown-first manuscript workflow for SIAM News

**Canonical source:** [article/feature.md](../article/feature.md). The source of truth for wording, math, links, references, captions and short bios is **Markdown in GitHub**.

## Correct proposed author order (November 9, 2026)

1. **Heriberto Espino-Montelongo** — lead/first author, Universidad de las Américas Puebla.
2. **Héctor Maravillo** — second author, Universidad Autónoma Metropolitana (UAM), Mexico.
3. **Diego Villarreal de la Cerda** — third author, T-Systems.

The lead author explicitly confirmed first and second positions. The full author list, including the remaining contributor, needs collective approval before submission.

## What SIAM News accepts

The [official submission page](https://www.siam.org/publications/siam-news/about-siam-news/submission-guidelines/) and [two-page style guide](https://www.siam.org/media/gfbjvzck/siam-news-info-and-style-guide.pdf), page 2, say completed drafts should be emailed as **PDF or Word**. **LaTeX is helpful, but not required**, for articles with equations or mathematical symbols. The guide does not list Markdown as an email-delivery format, and no SIAM journal class is needed.

## Stages

**Drafting / review:** Edit only `article/feature.md`; run `python scripts/check_article.py` locally or through the normal GitHub check. This does **not** regenerate LaTeX or PDF.

**Author approval:** All three authors review the final Markdown text, exact byline/bios, image and data rights, math statements, and figure links. This approval must be genuine and recorded outside CI.

**Submission export:** After approval, manually run [the article-PDF workflow](../.github/workflows/article-pdf.yml) from Actions, on `main`, selecting `approved_by_all_authors=true`. It converts the approved Markdown to LaTeX, checks the generated source, compiles a PDF, and archives the generated files. It does **not** email or submit anything.

**Final delivery:** Send the PDF to SIAM News (or Word if editors request that alternative); provide LaTeX only if helpful or requested. Package the credited figure files separately and retain the accessible website links.

## Preservation and caveats

- The already committed `article/main.tex` and `article/output/proximitygraphs-siam-news-draft.pdf` were created **before** this author-order correction. They are preserved as prior *historical proofs*, not the current author-approved manuscript. In particular, their displayed byline is superseded by the canonical Markdown.
- Do not manually edit the generated TeX to revise prose; make changes in Markdown and regenerate only for an approved export.
- To validate after export, run `python scripts/check_article.py --check-generated` and examine the PDF pages, mathematical symbols, credits and links.
- A Word file can also be generated from the Markdown if needed, after approval and with a human review of equation formatting. It is not necessary to produce Word and PDF both.
- No coauthor agreement or SIAM editorial approval is implied by a successful code check.
