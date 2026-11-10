# Embedding the four ProximityGraphs interactive figures

These are original browser-based graphics hosted by the authors. Each is a **live computational widget**, not a video, animation loop, or pre-rendered screenshot. The complete [SIAM-style online article preview](article.html) embeds all four.

## Live URLs

| Figure | Topic | Embedded view | Full laboratory |
| --- | --- | --- | --- |
| 1 | Historical Voronoi/Delaunay | https://heri-espino.github.io/proximitygraphs-siam-figures/?embed=water | https://heri-espino.github.io/proximitygraphs-siam-figures/#water |
| 2 | Alpha-shape and alpha-hull | https://heri-espino.github.io/proximitygraphs-siam-figures/?embed=habitat | https://heri-espino.github.io/proximitygraphs-siam-figures/#habitat |
| 3 | Beta-skeleton and blocking points | https://heri-espino.github.io/proximitygraphs-siam-figures/?embed=sensors | https://heri-espino.github.io/proximitygraphs-siam-figures/#sensors |
| 4 | Same sites, different graphs | https://heri-espino.github.io/proximitygraphs-siam-figures/?embed=compare | https://heri-espino.github.io/proximitygraphs-siam-figures/#compare |

The embedded view runs the **same application and original data files**, but hides the unrelated sections and navigation to fit an article frame. Point editors, parameter selectors, SVG/PNG export buttons, and graph witnesses still work. Four iframes on article.html are lazy-loaded. The selected view is controlled by an allow-listed query parameter; no user-generated HTML is injected.

## Example integration

Copy this HTML into a website where the editorial team **permits iframes**:

~~~html
<iframe
  src="https://heri-espino.github.io/proximitygraphs-siam-figures/?embed=compare"
  title="ProximityGraphs: compare two geometric graph rules on the same points"
  style="display:block;width:100%;height:740px;border:1px solid #ddd"
  loading="lazy">
</iframe>
~~~

If embedding is restricted by editorial policy, the figure caption can link to the full interactive page or an individual view instead. The [SIAM News style guide](https://www.siam.org/media/gfbjvzck/siam-news-info-and-style-guide.pdf) normally recommends one to three images, though the September 28, 2026 [VisualPDE online example](https://www.siam.org/publications/siam-news/articles/visualpde-interactive-spatiotemporal-modeling-via-web-browsers-on-any-device/) uses four numbered interactive animations. Four live figures are a **proposal requiring SIAM editorial permission**, not an approved publication configuration.

## Four static fallbacks

The pinned ProximityGraphs exporter creates four reproducible PNG/SVG source figure pairs under site/assets/:

- figure01-water: 13 digitized historic pumps and 578 contextual death marks (modern Euclidean geometry only)
- figure02-habitat: image-traced synthetic Pg alpha-shape/circular alpha-hull
- figure03-sensors: synthetic relay-sensor beta-skeleton, empty-lune witness
- figure04-compare: Gabriel versus RNG, **same 25 synthetic site positions and edges from Python library exports**

The fourth graph is a genuine two-panel *scientific figure*. The repository's prior visual-qa screenshot may temporarily seed the filename in the PR to let PDF checks run; the authoritative Python exporter overwrites it with a clean PNG and SVG before the final main-branch proof is archived. Never claim an edited JavaScript configuration is recomputed by Python.

## Reproduce

    python scripts/export_scenes.py
    python -m unittest discover -s tests -v
    python -m http.server 8000 --directory site

Open http://127.0.0.1:8000/article.html and inspect each frame. The browser requires HTTP to fetch site/data/scenes.json correctly. Ensure desktop and mobile sizes and check browser console exceptions. SIAM publication or re-hosting rights cannot be assumed.
