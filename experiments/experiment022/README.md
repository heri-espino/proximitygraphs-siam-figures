# experiment022 — Narrative continuity and non-repetitive adjacency language

**Date:** 2026-11-14  
**Status:** Editorial-only revision on the existing PR #16 branch, unmerged and unsubmitted.

## Motivation

The lead author identified three editorial defects in the SIAM News feature: (1) the Gabriel/Sokal introduction repeated the same third-point idea several times; (2) sections were juxtaposed with little preparation for the next topic; and (3) the invitation to computational-topology researchers was rendered in bold.

## Edits and rationale

- Rewrote the opening of *Why Should an Empty Region Create an Edge?* to speak of an exclusion region containing **no other sampled points**. Gabriel's diameter disk and the RNG's larger lune now appear as two concrete choices of that region, without repeating a third-point rhetorical question.
- Inserted conceptual bridges at the ends of the preceding sections, following the article's actual logic: historical distance metric → edge selection → boundary reconstruction and persistent topology → route tradeoffs → random-point predictions → high-dimensional scientific data → reproducible software.
- Removed the `\\textbf{}` emphasis from the collaboration invitation in `article/main.tex` and the strong-label formatting from its online analogue in `site/article.html`.
- Updated the interactive article's heading `The Third Point Has a Veto` to `When Empty Space Determines an Edge`; kept all scientific examples and anchors unchanged.

## Unchanged scientific evidence

The manuscript continues to distinguish Snow's 1855 street-distance catchment from a present-day Euclidean Voronoi overlay, and it preserves the 645-point alpha-figure setting and the 25-site Gabriel/RNG comparison (46 vs 31 links; lengths 7.873373853 vs 4.791049476; pairwise mean stretch 1.100802912 vs 1.271160882). Poisson expectation assumptions and the ten references remain intact. Persistent homology is still explicitly **future development**, not an implemented library feature.

## Reproduction

From the repository root:

```bash
python scripts/check_article.py
python scripts/package_siam_source.py
python -m unittest discover -s tests -v
node tests/test_editor.js
cd article && pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdflatex -interaction=nonstopmode -halt-on-error main.tex
```

For visual validation, serve `site/` through an HTTP server and review `article.html` plus all four embedded figures at desktop/mobile viewport sizes.

## Findings and next steps

Before committing the edit, the LaTeX editorial preflight's approximate count was **1,304 words**, below the 1,400-word SIAM News target; the manuscript still had three printed figures and the website four interactive figures. Check the new GitHub CI runs before considering proof and source ZIP validated. No source geometry, figures, datasets, experiment020 metrics, or external submission was modified. Coauthor approval, permissions and the embedding policy remain unresolved.
