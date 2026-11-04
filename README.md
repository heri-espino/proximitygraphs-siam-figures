# Who Counts as a Neighbor? — ProximityGraphs for SIAM News

**Status:** working editorial draft, **not** submitted, accepted, peer reviewed, or endorsed by SIAM.

This project develops a proposed **SIAM News — Software and Programming** feature and its reproducible interactive companion. Its subject is the mathematical choice of "neighbor": Voronoi/Delaunay partitions, circular alpha-hull boundaries, and beta-skeleton links.

**[Explore the planned GitHub Pages site](https://heri-espino.github.io/proximitygraphs-siam-figures/)** (requires the repository owner to enable Pages; the link may not yet resolve).

**[Read the LaTeX article](article/main.tex)** · **[Review the editorial pitch](article/pitch.md)** · **[Inspect the ProximityGraphs library](https://github.com/ProximityGraphs/ProximityGraphs)**

## Three application-led demonstrations

| Figure | Mathematical objects | Illustrative context | Reader interaction |
| --- | --- | --- | --- |
| 1. Water service | Voronoi cells and Delaunay dual edges | Hypothetical drinking-water distribution stations | Drag/add/delete/reset sites, select station, toggle cells and dual |
| 2. Habitat footprint | Circular alpha-hull arcs, supporting circles | Hypothetical ecological observation locations | Drag/add/delete/reset observations, vary negative alpha, select arc, reveal circle |
| 3. Sensor candidates | Beta-skeleton, empty lune | Hypothetical wireless sensors | Drag/add/delete/reset sensors, vary beta, select link, inspect geometric region |

**All coordinates are synthetic.** The historical reference to John Snow's 1854 cholera investigation is context, not a reconstruction. Euclidean nearest-site diagrams differ from walking-distance Voronoi catchments. A geometric contour is not ecological inference, and a candidate graph edge is not a validated wireless link.

## Interactive point editing

On **each** visualization, choose **Move** (drag points with mouse or touch), **+ Add** (click an empty location inside the square), **− Delete** (click a point), or **Reset points** (restore the original data). Existing points can also be moved with the arrow keys after keyboard focus; Delete/Enter works in Delete mode.

- Live geometry updates automatically after a point changes.
- Editing is restricted to the normalized unit square, with an 80-point safety limit and a minimum distance between distinct sites to prevent duplicate-point degeneracies.
- Original examples continue using **actual ProximityGraphs-generated data** from the pinned library commit. **Edited point sets are recomputed in the browser using independent JavaScript geometry**, with explicit source labels. Do not describe edited plots as being recalculated by Python ProximityGraphs.
- Export SVG or PNG at any point to save the currently displayed graph, including custom point positions.
- Links to external websites open in a new tab. Internal figure navigation remains on the current page.
- All application scenarios remain **synthetic** and non-validated.

## Repository structure

| Path | Purpose |
| --- | --- |
| \`article/main.tex\` | Polished, non-journal LaTeX feature draft with three captions and bibliography |
| \`article/pitch.md\` | Editor-facing pitch, not sent |
| \`site/index.html\`, \`styles.css\`, \`app.js\`, \`editor.js\` | Interactive mobile-friendly website, editable points, and SVG/PNG exports |
| \`site/data/scenes.json\` | Committed deterministic ProximityGraphs geometry, exported by Python |
| \`site/assets/\` | Six committed static figures (three PNG and three SVG) |
| \`scripts/export_scenes.py\` | **Authoritative** ProximityGraphs-backed data and static-figure builder |
| \`scripts/check_article.py\` | Approximate word-count checker |
| \`tests/test_geometry.py\` and \`tests/test_editor.js\` | Python source geometry tests plus browser recomputation, controls, and external-link regressions |
| \`docs/EDITORIAL.md\` | SIAM News policy, image/link guidance and factual caveats |
| \`AGENTS.md\`, \`AI_HANDOFF.md\` | Agent-ready rules and continuing handoff |
| \`experiments/\` | Numbered future research/visual design experiments |
| \`.github/workflows/build.yml\` | Installs pinned library, regenerates/commits assets, checks math & JS |

## Reproduce

Use Python 3.10+ and a network-enabled environment:

\`\`\`bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python scripts/export_scenes.py
python -m unittest discover -s tests -v
python scripts/check_article.py
node --check site/app.js
node --check site/editor.js
node tests/test_editor.js
\`\`\`

On Windows, activate with \`.venv\\Scripts\\activate\`. The requirements pin the ProximityGraphs source to commit \`d1a216d7255cbebea68dcaad6a97382168a3ec55\`. The workflow also runs these checks on GitHub-hosted Ubuntu, commits authoritative regenerated files to \`main\`, and uploads a CI artifact.

Preview the website locally:

\`\`\`bash
python -m http.server 8000 --directory site
\`\`\`

Visit \`http://localhost:8000/\`. Do not open \`index.html\` directly as a \`file://\` URL because browser security restrictions can block JSON fetches.

The website automatically reads \`site/data/scenes.json\` generated by the Python library for the original point sets. If this file is missing, an independent JavaScript demonstration operates as a clearly labeled **browser preview**. The published version should use the committed authoritative Python data.

## Compile the manuscript

The supplied document is a polished **draft delivery format**, not an official SIAM journal template. SIAM News explicitly says submissions are not research journal papers. The draft has fallback figure placeholders until assets exist.

\`\`\`bash
cd article
pdflatex main.tex
pdflatex main.tex
\`\`\`

The generated \`main.pdf\` is a local build artifact (ignored in Git). Exported PNG/SVG scientific figures stay in the repository. For the final editorial version, use the live interface's PNG/SVG export to capture selected interactive states and explicitly label the synthetic point sets.

## Enable GitHub Pages

The owner must do these GitHub actions once:

1. Open **Settings → Pages** in this repository and select **Source: GitHub Actions**.
2. Open **Settings → Secrets and variables → Actions → Variables**, add \`DEPLOY_PAGES\` with value \`true\`.
3. Open **Actions → Build reproducible SIAM figures → Run workflow** on \`main\`. The conditional Pages job will deploy the site as a project page.
4. Confirm that \`https://heri-espino.github.io/proximitygraphs-siam-figures/\` actually works. The live URL is *not* verified until this step.
5. Confirm with SIAM News editors that the external interactive links (rather than embedded arbitrary HTML) are acceptable.

**No article has been sent.** Human contributors must approve byline, affiliations, biographies, and final figures first.

## Editorial constraints and sources

The [SIAM News Style Guide](https://www.siam.org/media/gfbjvzck/siam-news-info-and-style-guide.pdf) and [submission guidelines](https://www.siam.org/publications/siam-news/about-siam-news/submission-guidelines/) recommend approximately 800–1,400 words, one to three credited graphics, no more than ten references in APA style, and one- to two-sentence author biographies. Links are supported in web articles and videos may be submitted, but custom interactive embedding is **not** promised.

A useful structural comparator is [*The Dynamics of Debt*](https://www.siam.org/publications/siam-news/articles/the-dynamics-of-debt/), a SIAM News software feature with a mathematical narrative, figures, links, and references.

Consult \`AGENTS.md\`, \`docs/EDITORIAL.md\` and \`AI_HANDOFF.md\` before changing the project.
