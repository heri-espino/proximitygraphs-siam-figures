# experiment021 — The ERG narrative and coupled LaTeX/interactive release

**Date:** 2026-11-14  
**Status:** Committed on PR #16 for review. Neither merged nor submitted.

## Research question

How can one explain the general mathematical mechanism that connects exclusion-region geometry to different graph structures, while delivering a consistent LaTeX magazine article and interactive browser figures?

## Why this experiment was necessary

Experiment020 corrected the John Snow history and reproduced the improved alpha default and 25-site Gabriel/RNG experiment. However, the canonical article did not explicitly cite the **empty-region graph** framework of Cardinal, Collette and Langerman (2009). An older editorial pitch still contained the superseded historical error, and the ZIP instructions mislabeled the third printed asset. Those were substantive accuracy and release risks.

## Methods and changes

1. Retain canonical `article/main.tex` as the only editable print manuscript, with two named authors, three figures and ten bibliography entries. Replace the less central formal Dyballa/Zucker reference with Cardinal, Collette and Langerman (2009), *Empty region graphs*, `doi:10.1016/j.comgeo.2008.09.003`.
2. Define the exclusion-region ordering: if `K1(p,q) ⊆ K2(p,q)` for all candidate site pairs, then `E(K2) ⊆ E(K1)`. This shows that larger forbidden regions cannot create links; it explains the Gabriel/RNG controlled comparison without implying real transport or wireless performance.
3. Mirror the same mechanism in `site/article.html`. Clarify that online Figure 3 is the sensor witness, and **print Figure 3 corresponds to online Figure 4** (controlled comparison).
4. Correct `article/pitch.md` and the unsent editorial cover letter to preserve John Snow's own 1855 road-distance equidistance boundary, distinct from the full Euclidean 13-pump overlay.
5. Add `article/INTERACTIVE_COMPANION.md` to the ZIP produced by `scripts/package_siam_source.py`, which maps every print figure to its web anchor and standalone embed. Show alternative editorial workflows if SIAM News cannot embed third-party iframes.
6. Extend `scripts/check_article.py` to require both an ERG reference and consistent online anchors; extend source-package CI to validate the new accompanying document.
7. Update README, agent instructions, handoff, and editorial audit; leave older experimental artifacts in place.

## Reproduce

```bash
python scripts/check_article.py
python scripts/package_siam_source.py
python -m unittest discover -s tests -v
node tests/test_editor.js
cd article
pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdflatex -interaction=nonstopmode -halt-on-error main.tex
```

For browser QA, run `python -m http.server 8000 --directory site` from the repository root and load `http://localhost:8000/article.html`, checking all four lazy-loaded iframe views and their individual `?embed=...` pages.

## Findings

- Local source-based preflight before commit counted approximately **1,227 words**, **10 references**, **3 static print figures** and **4 online iframes**.
- The mathematical and narrative changes do **not** alter scientific point coordinates, figure exports, or numerical calculations. The controlled results remain the experiment020 data: Gabriel 46 edges, length 7.873373853, stretch 1.100802912; RNG 31 edges, length 4.791049476, stretch 1.271160882.
- User-facing historical caveat remains: 1855 Snow road-distance boundary and modern Euclidean Voronoi polygons are related but distinct constructions.
- The public Pages URL targets deployed main-branch content. A PR preview is not proof that new website prose is publicly deployed.

## Validation and next steps

Inspect PR #16's **latest** PDF, source ZIP, numerical, and browser QA workflow runs after this update. No CI claims should be made until GitHub reports success for the new head. Before merging or emailing SIAM: obtain coauthor sign-off, confirm source imagery/data rights, and request editorial guidance on embedded interactivity versus external links. **Do not submit or merge without explicit authorization.**

## References used in this change

- Cardinal, J., Collette, S. & Langerman, S. (2009). *Empty region graphs*. Computational Geometry 42, 183–195. https://doi.org/10.1016/j.comgeo.2008.09.003
- SIAM News. [Submission guidelines](https://www.siam.org/publications/siam-news/about-siam-news/submission-guidelines/).
- Townsend, Krause & Walker. (2026). [VisualPDE: Interactive spatiotemporal modeling via web browsers on any device](https://www.siam.org/publications/siam-news/articles/visualpde-interactive-spatiotemporal-modeling-via-web-browsers-on-any-device/).
