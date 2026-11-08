# ProximityGraphs — editorial and outreach kit (draft)

**Goal:** invite mathematical and computational researchers to try, cite, and contribute to the open-source library. Do not position an editorial article as paid advertising. Do not claim SIAM endorsement, acceptance, novel algorithms without evidence, usage statistics, or production-grade network or ecological forecasting capabilities.

## One-sentence positioning

**ProximityGraphs is an open-source Python toolkit for constructing, comparing, and exploring how different geometric definitions of neighborhood change the structure of a network.**

## Alternative headlines

1. **Who Counts as a Neighbor?** — accessible editorial lead; recommended for SIAM News.
2. **One Point Cloud, Many Graphs** — strongest concise website/slide headline.
3. **When Geometry Decides Which Points Connect** — seminar or newsletter title.

## Product proof points (checked against the library)

- Published on PyPI as `proximitygraphs`; install with `pip install proximitygraphs`.
- MIT-licensed Python source with explicit citation metadata and public repository.
- Construct classical models including Delaunay, Gabriel, relative neighborhood, beta-skeleton, alpha-shape, circular alpha-hull, and other geometric graphs.
- Point-set handling, visualization, repeated experiment helpers, and optional GIS integration.
- Reproducible three-figure companion using library-exported default geometry; user-edited scenes use independent, clearly labeled browser recomputation.

**Important caveat:** PyPI currently labels the package as a pre-release. Do not describe it as fully production-hardened or claim verified speed advantages.

## Calls to action

- **Try it:** [PyPI package](https://pypi.org/project/proximitygraphs/) or `pip install proximitygraphs`
- **Explore the ideas first:** [interactive demonstration](https://heri-espino.github.io/proximitygraphs-siam-figures/)
- **Read, cite, or contribute:** [source repository](https://github.com/ProximityGraphs/ProximityGraphs); cite using its `CITATION.cff`.
- **Reproduce the illustrations:** [article and figures repository](https://github.com/heri-espino/proximitygraphs-siam-figures)

## Social / public-facing versions (NOT POSTED)

### LinkedIn — professional/scientific

**One point cloud. Several defensible ways to define a neighbor.**

Should two sites connect because their Voronoi regions meet, because their Gabriel disk is empty, or because a beta-dependent lens contains no other point?

We developed **ProximityGraphs**, an open-source Python library for constructing and comparing geometric graphs with a shared point-set workflow. A new interactive companion lets you move, add, or remove sites and see how Voronoi/Delaunay diagrams, circular alpha-hulls, and beta-skeletons respond.

Explore the figures: https://heri-espino.github.io/proximitygraphs-siam-figures/

Python source: https://github.com/ProximityGraphs/ProximityGraphs

`pip install proximitygraphs`

*The Voronoi example uses digitized historical map coordinates; the smiley and relay examples are synthetic. This is not modern field validation.*

### Short-form post

When does a pair of points deserve an edge? That depends on your definition of neighborhood. Try Voronoi/Delaunay, alpha-hulls, and beta-skeletons with editable points: https://heri-espino.github.io/proximitygraphs-siam-figures/ . Python: `pip install proximitygraphs`.

### Newsletter / department announcement

A small geometric choice can produce a very different network. **ProximityGraphs**, an MIT-licensed Python package, brings multiple proximity constructions under one point-set workflow for teaching, comparison, and research experimentation. Our interactive companion combines John Snow's digitized historical pump/death map with a two-counter Pg alpha-shape wordmark (with the original smiley as an alternative) and a synthetic relay-sensor graph to make the mathematics visible. Explore and modify the diagrams online, then use the package in Python: https://github.com/ProximityGraphs/ProximityGraphs .

## Press and editorial pitch (distinct from promotional posts)

Offer a scientific story, not a product announcement: one collection of points supports several legitimate notions of spatial adjacency; each notion changes the model and its conclusions. The three figures motivate and explain those differences. Introduce the library as the means for conducting reproducible comparisons, then close with a light "explore/install" invitation.

The intended SIAM News category is **Software and Programming**. SIAM explicitly requests accessible applied/computational mathematics and 1–3 credited figures rather than journal-style exposition. See [style guide](https://www.siam.org/media/gfbjvzck/siam-news-info-and-style-guide.pdf).

## SEO and link copy for the companion

- **Title:** Who Counts as a Neighbor? | ProximityGraphs Interactive Geometry
- **Description:** Explore and edit Voronoi diagrams, circular alpha-hulls, and beta-skeleton networks. Learn how geometric neighbor rules change graphs with the open-source Python library ProximityGraphs.
- **Open Graph description:** One set of points. Three geometric questions. Interactive mathematical figures built to explore the ProximityGraphs Python library.
- **Suggested share caption:** Move a point and watch its neighbors change.

## Editorial/release restrictions

- Never represent the SIAM News article as accepted, peer-reviewed, or published until independently confirmed.
- Obtain author approval for names, affiliations, captions, and marketing copy before public postings in their names.
- Retain the historical-data attribution on the Voronoi example and synthetic-data/model-limitations labels on the smiley and sensor examples.
- Do not post directly to organizational social accounts or contact SIAM editors without authorization.
- Avoid unsupported claims that any library constructor is the fastest or first of its kind.


## Dataset update — November 2026
The website now displays **digitized John Snow pump positions (13) and cholera death marks (578)** from HistData/Rdatasets as a historical contextual overlay. Its alpha default is a **synthetic two-counter Pg wordmark**, with the original smiley selectable and its beta default a **synthetic two-cluster relay sensor layout**. The Voronoi/Delaunay edges are modern computations on historical map coordinates, not a technique used by Snow. These data do not support modern GIS distance, medical-causality, or radio-network claims. See [historical provenance](../data/historical/README.md).
