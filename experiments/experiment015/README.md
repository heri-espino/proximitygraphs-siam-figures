# experiment015 — Two-author, history-driven SIAM News LaTeX feature

**Date:** November 9, 2026  
**Status:** Revised and locally compiled; complete CI verification recorded at release.

## Motivation

The lead author corrected authorship: this SIAM News feature has **exactly two authors**, Heriberto Espino-Montelongo (first) and Héctor Maravillo (second). Diego Villarreal de la Cerda **is not a coauthor of this article**. The user also superseded the experiment014 Markdown-first plan and requested **editable LaTeX plus a compiled PDF**, with a stronger historical story and clear scientific software positioning.

## Historical evidence and editorial design

Read the original papers supplied in the project and the library's pinned public API, plus current publisher records for landmark papers:

- **1908/1934:** Voronoi partitions and Delaunay triangulations establish modern spatial structures. Historical context: John Snow mapped cholera deaths near water pumps in 1854 but did **not** compute a Voronoi diagram.
- **Gabriel and Sokal (1969):** geometric adjacency for geographic variation analysis, \`Systematic Zoology 18(3), 259–278\`.
- **Toussaint (1980):** RNG for structure/perception in finite planar sets, \`Pattern Recognition 12, 261–268\`.
- **Edelsbrunner, Kirkpatrick and Seidel (1983):** alpha-shapes capture concavities beyond a convex hull.
- **Kirkpatrick and Radke (1985):** computational morphology and parameterized beta-skeleton neighborhood relations.
- **Devroye (1988):** expected size of empty-region graphs, with sampling-density-independent asymptotic constants.
- **Veltkamp (1992):** two-parameter gamma-neighborhood graphs unify several classes.
- **Aldous and Shun (2010):** route-length versus network-length tension; **Tero et al. (2010)** biological transport adaptation.
- **Dyballa and Zucker (2023):** Gabriel neighborhoods as the starting point for adaptive manifold learning; **Maravillo Gómez et al. (2023)** cyclic tiling reconstruction via beta-skeletons.
- **Today:** [ProximityGraphs](https://github.com/ProximityGraphs/ProximityGraphs) exports classical, beta, gamma, stepping-stone, elliptic, alpha and bio-inspired Physarum/Fungal network algorithms; its implementation is primarily planar.

The article explains why the choice of an edge matters, includes the Poisson \`E[deg] = v_d/a_K\` identity under explicit assumptions, and uses the pre-existing John Snow, serif Pg, and relay-sensor graphics to anchor the narrative. It avoids claiming every application is validated or every constructor supports arbitrary dimension.

## Implementation

- \`article/main.tex\` is **canonical editable LaTeX** with a newsjournal-appropriate single-column author-proof format, two-author PDF metadata/byline, and two author biographies.
- The [compiled proof](../../article/output/proximitygraphs-siam-news-draft.pdf) is generated from LaTeX directly by \`.github/workflows/article-pdf.yml\` when canonical source changes on \`main\`. Compilation is automatic, submission is not.
- The older \`article/feature.md\` remains labeled historical/archived; \`scripts/render_article.py\` now writes **legacy-md-proof.tex** rather than overwriting canonical TeX.
- The new \`scripts/check_article.py\` validates LaTeX (two authors, 800–1400 approximate article/caption words, three figure deep links, three source figures, ten alphabetized references) without interpreting stale Markdown as current.
- \`article/pitch.md\`, \`article/submission-email.md\`, README, AGENTS, handoff and manuscript workflow documentation are updated to two authors and a historical focus.
- No original figure, numerical experiment, source data or external manuscript was deleted or changed.

## Reproduction

From the repository root:

\`\`\`bash
python scripts/check_article.py
cd article
pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdfinfo main.pdf
pdfimages -list main.pdf
\`\`\`

The author proof uses committed \`site/assets/figure01-water.png\`, \`figure02-habitat.png\` and \`figure03-sensors.png\`. PDF source hyperlinks point to the interactive site.

## Local validation

The independent Linux LaTeX build completed successfully with **4 US Letter pages** and **3 original source figures**. All pages were rendered and visually inspected; the first page has a readable two-author byline, one graphic appears on each of the first three pages, and references/two biographies share page 4. The local TeX preflight counted about **944 prose/caption words** by conservative source-token extraction, within SIAM News's approximate 800–1400 target. This is a news-style author proof, not an official SIAM galley.

## Caveats and next steps

The current software citation may legitimately credit developers different from the **two SIAM News authors**; software contribution and feature coauthorship are separate questions. The publication remains **unsubmitted**, and historical digitization/typographic image reproduction rights and Héctor's editorial approval remain open. Before submission, confirm the exact printed byline, final captions and interactive links. Inspect final GitHub Actions PDF, record workflow run IDs here and in AI_HANDOFF.md, and preserve the PDF in the repository. No editorial email is sent by CI.
