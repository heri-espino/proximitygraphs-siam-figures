# ProximityGraphs — editorial and outreach kit (draft)

**Goal:** invite mathematical and computational researchers to try, cite, and contribute to the open-source library. Do not position an editorial article as paid advertising. Do not claim SIAM endorsement, acceptance, novel algorithms without evidence, usage statistics, or production-grade network or ecological forecasting capabilities.

## One-sentence positioning

**ProximityGraphs is an open-source Python laboratory for comparing geometric neighborhood models and bio-inspired network heuristics on the same point set.**

## Alternative headlines

1. **Who Counts as a Neighbor?** — accessible editorial lead; recommended for SIAM News.
2. **One Point Cloud, Many Graphs** — strongest concise website/slide headline.
3. **When Geometry Decides Which Points Connect** — seminar or newsletter title.

## Product proof points (checked against the library)

- Published on PyPI as `proximitygraphs`; install with `pip install proximitygraphs`.
- MIT-licensed Python source with explicit citation metadata and public repository.
- Audited public API: 16 named geometric or proximity graph and diagram constructors, from Voronoi, Delaunay, Gabriel, RNG and alpha boundaries to gamma-neighborhood, beta-skeleton, stepping-stone and elliptic-Gabriel models. Full source-level inventory: [IMPLEMENTED_FAMILIES](../docs/IMPLEMENTED_FAMILIES.md).
- Two separate bio-inspired public constructors: PhysarumGraph uses simulated flow reinforcement; FungalGraph grows and prunes candidate connections using a constructive heuristic. Neither is a validated organism simulation or guaranteed optimal network.
- Point-set handling, seeded simulations, graph metrics, repeated experiments, visualization, and optional GIS integration.
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

A small geometric choice can produce a very different network. **ProximityGraphs**, an MIT-licensed Python package, brings multiple proximity constructions under one point-set workflow for teaching, comparison, and research experimentation. Our interactive companion combines John Snow's digitized historical pump/death map with a playful alpha-shape smiley and a synthetic relay-sensor graph to make the mathematics visible. Explore and modify the diagrams online, then use the package in Python: https://github.com/ProximityGraphs/ProximityGraphs .

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
The website now displays **digitized John Snow pump positions (13) and cholera death marks (578)** from HistData/Rdatasets as a historical contextual overlay. Its alpha default is a **synthetic smiley point cloud** and its beta default a **synthetic two-cluster relay sensor layout**. The Voronoi/Delaunay edges are modern computations on historical map coordinates, not a technique used by Snow. These data do not support modern GIS distance, medical-causality, or radio-network claims. See [historical provenance](../data/historical/README.md).

**Alpha figure update (November 2026):** The interactive companion now defaults to a “Pg” point-cloud wordmark with two genuine alpha-shape holes (one in P and one in g), while the original smiley is still selectable. The default and alternate presets are synthetic demonstrations, not empirical observations.


**Image-traced Pg update (November 8, 2026):** The current alpha default samples the genuine outer contours of a supplied serif P and ornamental g as **380 normalized points** (298 contour, 82 subtle randomized stroke points); the original 53-point smiley remains optional. At its default scale the true alpha-shape has two bounded counters, and the open g descender does not become a third hole. These are synthetic geometry illustrations, not validated design software or historical observations.


## experiment009 current positioning — November 8, 2026

The upstream package exports sixteen named geometric graph and diagram constructors and two bio-inspired algorithmic network builders, documented in [the pinned API audit](../docs/IMPLEMENTED_FAMILIES.md). For SIAM News, show **several modeling choices**, not an alphabetical API list: proximity and sparse adjacency, exclusion-region shapes, scale-dependent boundaries and adaptive transport heuristics. Readers can compare these models on one point set with the same Python experiment interface. Never claim all algorithms work in every dimension, biological fidelity, guaranteed shortest paths or operational deployment validation.

**Current visualization provenance:** the default Pg wordmark contains 600 sites (298 original contours, 302 interior including 220 seeded-random sites); the 53-point smiley is an alternate preset. The John Snow pump and cholera marks are digitized historical data; the sensor network is synthetic. Earlier notes above describe prior editorial stages; these counts supersede them.
