# SIAM News pitch — current author proposal (NOT SENT)

**Section:** Software and Programming  
**Title:** Who Counts as a Neighbor?  
**Subtitle:** From Empty Regions to AI, Topology, and Stochastic Geometry  
**Proposed authors, pending approval:** Héctor Maravillo (Universidad Autónoma Metropolitana, Mexico); Diego Villarreal de la Cerda (T-Systems); Heriberto Espino-Montelongo (Universidad de las Américas Puebla)

A cloud of points has no edges until we define a neighborhood. That choice affects service-area partitions, transport-network detours, manifold geometry, topological holes, and which observations can exchange information in machine learning. The open-source Python library **ProximityGraphs** makes these alternatives comparable on the same coordinates.

We propose a compact SIAM News **Software and Programming** article with **three reproducible, linked illustrations**, each teaching a different aspect of geometric computation. The first overlays modern Euclidean Voronoi cells and Delaunay adjacency on **13 digitized water-pump locations** from John Snow's 1854 Soho cholera map; **578 digitized death-location marks** remain a non-vertex contextual layer. The second reconstructs an image-traced **380-point serif “Pg”** using straight alpha-shape edges and circular alpha-hull arcs. At the selected radius, its two components retain two enclosed letter counters; a **53-point smiley** provides an alternative demonstration. The third builds an empty-lune β-skeleton on **25 synthetic sensor sites**, with two clusters and three relays, so readers can compare accepted edges with rejected pairs and inspect a blocking point inside both disks.

The hosted [interactive companion](https://heri-espino.github.io/proximitygraphs-siam-figures/) lets readers drag, insert, and remove sites, expose bisectors, empty circumcircles, retained Delaunay triangles, circular supports, and β-lune blockers, or compare multiple proximity graphs on unchanged points. The printed figures would be static, credited images with links to these interactive construction views. A modern Voronoi overlay is **not** a procedure performed by Snow, and the two other datasets are **synthetic illustrations**, not real sensor deployments or empirical habitats.

Beyond the figures, the article connects specific scholarly work on Gabriel graphs in manifold learning, β-skeleton street-network tilings, spatial-network route efficiency, topological reconstruction from random samples, and high-dimensional nearest-neighbor search. A concise Poisson empty-region calculation illustrates the probabilistic consequences of the region choice. The mathematics extends to \(\mathbb R^d\), while many implemented library constructors and the interactive demonstrations are planar; the package does not claim to implement persistent homology, a vector database, or operational wireless routing.

The manuscript follows the [SIAM News submission guidance](https://www.siam.org/publications/siam-news/about-siam-news/submission-guidelines/): an accessible account, **three credited figures**, and no more than ten scholarly references. Its publication format and embedding of interactive content require editorial confirmation.

**Review materials:** [Canonical article](feature.md) · [LaTeX proof](main.tex) · [Historical data provenance](../data/historical/README.md) · [Mathematical construction documentation](../docs/CONSTRUCTIONS.md) · [Library](https://github.com/ProximityGraphs/ProximityGraphs).

**Status:** Not submitted, accepted, peer-reviewed, or approved by SIAM. All three coauthors must approve the final manuscript, images, and affiliations before sending it to editors.
