# experiment016 — Interactive SIAM-style proximity graph article

**Date:** November 9, 2026. **Status:** implementation complete; CI and visual verification are recorded below when available.

## Problem and rationale

The user requested a stronger application-led ProximityGraphs software feature based structurally on the SIAM News VisualPDE article (September 28, 2026), with four embedded demonstrations, numbered captions/equations and no bio-inspired material. The current SIAM News article has exactly two authors: Heriberto Espino-Montelongo first, Héctor Maravillo second. The feature is a newsjournal author proof, not a submitted research article.

## Official editorial evidence

- [Actual VisualPDE SIAM News article](https://www.siam.org/publications/siam-news/articles/visualpde-interactive-spatiotemporal-modeling-via-web-browsers-on-any-device/) uses four numbered live animations, captions, headings, equations, source links and application-focused examples.
- [SIAM News style guide](https://www.siam.org/media/gfbjvzck/siam-news-info-and-style-guide.pdf), p. 2, recommends 1–3 images if possible, permits video for online publication, approx. 800–1400 words, up to ten APA references and completed drafts as PDF or Word, with TeX helpful for mathematics.
- The four animations constitute a useful precedent, but not prior permission for our four iframes. SIAM may prefer external links or fewer print graphics.

## Actual implementation

- Rewrote canonical article/main.tex to focus entirely on classical/parameterized proximity graphs and their applications. Removed Physarum, Fungal, and the Tero reference; added the Jaromczyk & Toussaint (1992) survey. Preserved two authors, ten references, historical context, shape geometry, empty-region networks and stochastic degree laws.
- Expanded the article to four numbered images and two numbered equations; each figure links to a real live panel on site/article.html.
- Added site/article.html + article.css, an original responsive editorial reading page with four lazy iframes; not copied from SIAM's HTML/CSS.
- Added allow-listed `?embed=water|habitat|sensors|compare` query to site/index.html, with CSS limiting an iframe to the matching section, preserving original controls. Site app skips unrelated expensive renders in embedded mode.
- Added Figure 4 Python exporter: a side-by-side Gabriel/RNG plot using exactly the SAME 25 sites from the pinned ProximityGraphs library. It writes source PNG/SVG like the original three figures.
- Updated scripts/check_article.py and added tests/test_article_preview.py for four figures/links, no bio-inspired claims and structural embed checks.
- Added site/EMBEDDING.md with the four hosted addresses, iframe snippet, and editorial reuse limitations. Original points, historical CSVs, source figures, previous experiments and manuscripts remain preserved.

## Reproduce

    python -m pip install -r requirements.txt
    python scripts/export_scenes.py
    python -m unittest discover -s tests -v
    node tests/test_editor.js
    python scripts/check_article.py
    python -m http.server 8000 --directory site

Visit http://localhost:8000/article.html to interact with the four embedded labs. For compiled proof:

    cd article
    pdflatex -interaction=nonstopmode -halt-on-error main.tex
    pdflatex -interaction=nonstopmode -halt-on-error main.tex

## Verification checklist

- [ ] PR tests pass on the original branch, including article PDF, Python geometry and browser QA.
- [ ] Download PR PDF and visually inspect every page and all four embedded scientific graphics.
- [ ] Inspect actual browser article at desktop and mobile sizes; confirm all four iframes load, draw the expected graphs, respond to controls and have no JS errors.
- [ ] Merge after successful checks, verify main figure/Pages/PDF workflows and archive their run IDs.
- [ ] Confirm fourth PNG/SVG in site/assets was regenerated from the pinned Python implementation and committed.

## Limits and next steps

The library remains primarily planar despite higher-dimensional mathematical formulations. Synthetic sensor and typographic samples are explanatory; the historical Voronoi overlay is not John Snow's original method or causal evidence. The authors' iframe pages may be embedded on third-party sites only with publisher permission. Before any SIAM submission: obtain Héctor's manuscript approval, verify third-party data/artwork reproduction rights, and ask the editors whether four online demonstrations are acceptable or a 1–3 figure print subset is preferred. No submission/email has been sent.


## Final validation and publication preview — November 9, 2026

- [PR #13](https://github.com/heri-espino/proximitygraphs-siam-figures/pull/13) was **merged** after successful Python geometry, PR LaTeX, and Playwright browser tests.
- Final [PDF workflow #42740465355](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42740465355): **success**. Downloaded the actual GitHub Actions proof, visually inspected its four US Letter pages, **four** embedded Python-backed figure images, **two** numbered equations, **ten** references and **two** authors, with no bio-inspired graph discussion.
- Actual PDF: `article/output/proximitygraphs-siam-news-draft.pdf` (also made available as a downloadable conversation artifact). Metadata: `Heriberto Espino-Montelongo; Hector Maravillo`; 19 PDF links including four live figure links and software citations. The final fourth graphic uses the pinned Python reference site coordinates for both Gabriel and RNG.
- Final [browser visual QA #42740553820](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42740553820): **success**. Real HTTP-hosted article.html renders four lazy-loaded iframes; one original geometry section per iframe; functional water-site editor and comparison selectors; mobile-width layout without horizontal overflow; all numbered captions and equations. Screenshots and `article-browser-summary.json` are **committed** to `docs/visual-qa/`. The initial main QA run failed only in screenshot archiving because the newly generated fourth SVG was untracked during rebase. Fixed `.github/workflows/visual-qa.yml` to clean exactly this generated SVG before rebase, then confirmed success.
- Final [reproducible figure/Pages workflow #42740553808](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42740553808): **both figure tests and GitHub Pages deployment succeeded**. Committed the authoritative `site/assets/figure04-compare.png` and `.svg` (not the provisional PR screenshot) and verified original diagram sources and all interactive math invariants.
- Published Pages entry point: https://heri-espino.github.io/proximitygraphs-siam-figures/article.html ; individual embeds use `/?embed=water|habitat|sensors|compare`. Browser tests used the exact same committed site over a local HTTP server. GitHub deployment reports the site URL; the web retrieval tool did not independently load the public site after deployment.
- The author preview follows the **structural editorial approach** of SIAM News's VisualPDE article (four numbered live animations/captions/equations/applications), but is original implementation, not SIAM's own HTML or an approved editorial embed.
- **Remaining external requirements**: Héctor's sign-off, rights to supplied serif source artwork and historic geodata, and SIAM editor approval of four online live demonstrations (style guide usually recommends 1–3 illustrations). This work is an author proof **not submitted or accepted** by SIAM.
