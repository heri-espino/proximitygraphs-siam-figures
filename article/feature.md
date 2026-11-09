# Who Counts as a Neighbor?
*From empty regions to AI, topology, and stochastic geometry*

**SIAM News — Software and Programming | Revised author draft, not submitted**

**Héctor Maravillo** — Universidad Autónoma Metropolitana (UAM), Mexico; **Diego Villarreal de la Cerda** — T-Systems; **Heriberto Espino-Montelongo** — Universidad de las Américas Puebla (UDLAP). *Byline and affiliations remain subject to the coauthors’ approval.*

<!-- ARTICLE_BODY_START -->

A cloud of points has no edges until someone defines *neighbor*. That choice determines information flow, geometric structure, and even the output of graph-based learning. **[ProximityGraphs](https://github.com/ProximityGraphs/ProximityGraphs)** turns the choice into a reproducible experiment: build competing graph models on the same points and measure what changes.

## From locations to structure

Voronoi diagrams divide space by the nearest site; their Delaunay dual connects sites with adjacent cells. The same construction can organize emergency-response territories, facility allocation, spatial interpolation, and adaptive meshes for partial differential equations. John Snow's 1854 cholera investigation provides a historical setting: the [HistData digitization](https://rdrr.io/cran/HistData/man/Snow.html) supplies pump positions and individual death-location marks. We construct a **modern Euclidean overlay** on those coordinates, using pumps as sites and deaths only as contextual observations. Snow did not compute this diagram; straight-line proximity is not measured travel or evidence of causation.

**Figure 1.** *Historical locations, modern geometry.* Thirteen digitized Soho water pumps, including Broad Street, define Euclidean Voronoi cells and Delaunay edges; 578 cholera death marks provide historical context, not graph vertices. Snow did not use these constructions. Online, readers can inspect bisectors and circumcircles or hypothetically relocate a pump. Data: HistData digitization; illustration: the authors using ProximityGraphs. [Explore Figure 1](https://heri-espino.github.io/proximitygraphs-siam-figures/#water).

The same tension governs road networks. Aldous and Shun (2010) quantify the conflict between construction length and travel efficiency, while Maravillo Gómez and collaborators (2023) show how β-skeletons recover idealized cyclic street tilings and approximate real urban patterns. Sparse adjacency thus encodes more than appearance: it determines whether useful routes require costly detours.

In machine learning, images, gene-expression profiles, and embeddings become point clouds in feature space. Costa and Hero (2004) use geodesic minimum-spanning-tree lengths to estimate intrinsic dimension and entropy; Dyballa and Zucker (2023) initialize adaptive manifold neighborhoods with a **Gabriel graph** before sparsification. Neighbor selection is part of the learning model, not merely its visualization.

The general mathematical setting is **\(\mathbb R^d\), for any \(d\geq1\)**: points can be geographic coordinates, 3D positions, gene-expression measurements, or learned embeddings. The current **ProximityGraphs implementation concentrates on planar algorithms**; although its point-set container accommodates other coordinate dimensions, not every graph constructor is yet dimension-general.

## Shape, holes, and scale

A convex hull covers a point cloud but hides indentations. Alpha-shapes and circular-arc **alpha-hulls** recover scale-dependent envelopes: a radius threshold can expose bays, disconnected pieces, and holes. Here a Delaunay triangle survives when its circumradius is at most \(R=1/|\alpha|\). The resulting straight alpha-shape boundary contrasts with the circular arcs of the related alpha-hull. Such summaries inform shape reconstruction, microscopy, porous-material analysis, and spatial delineation—but are not automatically confidence regions or physical surfaces.

**Figure 2.** *Straight boundaries and circular arcs.* A synthetic 600-site serif **Pg** includes 298 contour sites and 302 interior sites. At \(\alpha\approx-28.57\), its alpha-shape has two components and two enclosed counters; the alpha-hull traces circular arcs. Online, readers can change the scale and point density, inspect supporting circles, or select a smiley instead. Point sampling and illustration: the authors using ProximityGraphs. [Explore Figure 2](https://heri-espino.github.io/proximitygraphs-siam-figures/#habitat).

**Alpha complexes**, related to but distinct from alpha-hulls, form filtrations for tracking components, loops, and voids by persistent homology. Niyogi, Smale, and Weinberger (2008) establish conditions for recovering manifold homology from random samples. From molecular cavities to learned representations, geometry and topology depend on sampling scale. Likewise, a misplaced graph edge can shortcut a manifold fold during nonlinear dimensionality reduction. ProximityGraphs supports investigating these construction choices; it does not implement persistent homology.

## Empty regions as computational decisions

In a **beta-skeleton**, two points are joined when a prescribed region between them contains no competing point. The empty lune for \(\beta=2\) yields the relative neighborhood graph; at \(\beta=1\), the Gabriel graph arises. For planar point sets in general position, a familiar hierarchy is
\[
\mathrm{MST}\subseteq\mathrm{RNG}\subseteq\mathrm{GG}\subseteq\mathrm{Delaunay}.
\]
The inclusions expose different degrees of geometric sparsity, which matters for sensor-network candidates, decentralized communication, geometric routing, spatial anomaly detection, image morphology, and the skeleton of an observed shape. They do **not** guarantee that a wireless edge is physically viable or that a graph is an optimal routing network.

**Figure 3.** *Why a candidate link survives.* Twenty-five synthetic sensor sites form two clusters connected by three relays. The online β-skeleton inspector shows the disks defining an empty lune, accepted connections, and rejected candidates with their blocking points. Moving or adding a site changes the result. Synthetic layout and illustration: the authors using ProximityGraphs. [Explore Figure 3](https://heri-espino.github.io/proximitygraphs-siam-figures/#sensors).

In graph neural networks, adjacency is an **inductive bias**: edges specify which observations exchange messages. For retrieval systems, Iff and collaborators (2026) benchmark filtered nearest-neighbor search on embeddings from over 2.7 million research papers. Both illustrate the importance of selecting informative neighbors, though ProximityGraphs is neither a graph-learning framework nor a vector-search index.

## One-line stochastic geometry

What happens when the sites themselves are random? Devroye (1988) studied empty-region graphs in \(\mathbb R^d\) and showed that remarkably simple asymptotic degree laws emerge across broad sampling densities. For a stationary Poisson process of intensity \(\rho\), suppose the exclusion region of a pair at separation \(r\) has volume \(a\,r^d\). Writing \(v_d\) for the unit-ball volume gives
\[
\Pr(\text{edge}\mid r)=e^{-\rho a r^d},
\qquad
\mathbb E[\deg]=\frac{v_d}{a}.
\]
Thus **shape enters through a unit-region volume, and the mean degree does not depend on point intensity** under this homogeneous model. In two dimensions, the Gabriel graph has mean degree **4**; the relative neighborhood graph has mean degree approximately **2.558**. Penrose and Yukich (2013) show that many local geometric statistics of random samples on a smooth manifold have limiting laws governed by Poisson processes on its intrinsic-dimensional tangent planes. This connects ambient coordinates, hidden dimension, and statistical uncertainty, although curvature corrections beyond the tangent limit remain a separate mathematical problem.

## A geometry laboratory—and a biological one

The package implements **[more than a dozen graph and diagram constructions](https://github.com/ProximityGraphs/ProximityGraphs/blob/main/src/proximitygraphs/__init__.py)**, not one universal definition of closeness. Voronoi and Delaunay organize space; minimum-spanning and nearest-neighbor graphs prioritize economical or local connections; Gabriel graphs, relative neighborhoods, and **β-skeletons** reject pairs whose exclusion regions are occupied. More flexible **γ-neighborhood**, **stepping-stone**, and **elliptic-Gabriel** models change the region or tolerance used to decide adjacency, while alpha boundaries recover shape. The same coordinates can therefore be examined as candidate transport links, spatial neighborhoods, or samples of an unknown geometric object.

Beyond geometric emptiness, the library's [bio-inspired module](https://github.com/ProximityGraphs/ProximityGraphs/tree/main/src/proximitygraphs/biological) implements **Physarum-inspired** flow reinforcement and **fungal-inspired** network growth. `pg.PhysarumGraph` adapts simulated edge conductivities; `pg.FungalGraph` grows and prunes connections from a Physarum-like backbone, trading short links against shortcuts and degree constraints. These are computational heuristics inspired by organisms, **not validated biological replicas or guarantees of optimal networks**.

With `pg.SetPoints` and `pg.Experiment`, researchers can generate Poisson or structured samples, switch constructors such as `pg.GG`, `pg.Gamma_Graph`, or `pg.Stepping_Stone`, and compare lengths, degrees, and connectivity over repeated runs. Visualization and optional GIS integration complete this MIT-licensed workflow.

The [interactive companion](https://heri-espino.github.io/proximitygraphs-siam-figures/) turns these illustrations into inspectable computations: move, add, or delete points; expose bisectors, circumcircles, retained simplices, and rejected edges; or [compare graph families](https://heri-espino.github.io/proximitygraphs-siam-figures/#compare) on identical sensor coordinates. Unedited geometry is exported from the Python library; edited configurations are recomputed independently in the browser. The point is not that one graph always wins, but that **neighbor definitions become assumptions we can see, modify, and test**.

**Try the library:** [Source and examples](https://github.com/ProximityGraphs/ProximityGraphs) · [PyPI](https://pypi.org/project/proximitygraphs/) · `pip install proximitygraphs`. The Python release is currently a pre-release; selected algorithms and models are planar.

## References

Aldous, D. J., & Shun, J. (2010). Connected spatial networks over random points and a route-length statistic. *Statistical Science, 25*(3), 275–288. https://doi.org/10.1214/10-STS335

Costa, J. A., & Hero, A. O. (2004). Geodesic entropic graphs for dimension and entropy estimation in manifold learning. *IEEE Transactions on Signal Processing, 52*(8), 2210–2221. https://doi.org/10.1109/TSP.2004.831130

Devroye, L. (1988). The expected size of some graphs in computational geometry. *Computers & Mathematics with Applications, 15*(1), 53–64.

Dyballa, L., & Zucker, S. W. (2023). IAN: Iterated adaptive neighborhoods for manifold learning and dimensionality estimation. *Neural Computation, 35*(3), 453–524. https://doi.org/10.1162/neco_a_01566

Edelsbrunner, H., Kirkpatrick, D. G., & Seidel, R. (1983). On the shape of a set of points in the plane. *IEEE Transactions on Information Theory, 29*(4), 551–559.

Iff, P., Brügger, P., Chrapek, M., Kochergin, D., Besta, M., & Hoefler, T. (2026). Benchmarking filtered approximate nearest neighbor search algorithms on transformer-based embedding vectors. *Proceedings of SIGIR 2026*, 610–622. https://doi.org/10.1145/3805712.3809731

Maravillo, H., Villarreal de la Cerda, D., & Espino-Montelongo, H. (2026). *ProximityGraphs* [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.21088183

Maravillo Gómez, H. S., Calvillo Vives, G., & Treviño Aguilar, E. (2023). Recovering cyclic tilings through β-skeletons. *Procedia Computer Science, 223*, 343–351. https://doi.org/10.1016/j.procs.2023.08.246

Niyogi, P., Smale, S., & Weinberger, S. (2008). Finding the homology of submanifolds with high confidence from random samples. *Discrete & Computational Geometry, 39*, 419–441. https://doi.org/10.1007/s00454-008-9053-2

Penrose, M. D., & Yukich, J. E. (2013). Limit theory for point processes in manifolds. *Annals of Applied Probability, 23*(6), 2161–2211. https://doi.org/10.1214/12-AAP897

## About the authors

Héctor Maravillo works on computational geometry and proximity graphs at Universidad Autónoma Metropolitana (UAM), Mexico.

Diego Villarreal de la Cerda works at T-Systems and contributes to the computational development of ProximityGraphs.

Heriberto Espino-Montelongo develops mathematical research in geometric probability, stochastic geometry, and spatial networks at Universidad de las Américas Puebla.

*Editorial note: Provisional byline subject to approval; the article has not been submitted to SIAM News. The Voronoi figure uses digitized historical map coordinates; the Pg/smiley and sensor figures are synthetic. The general mathematical applications described are not assertions of implemented, validated workflows in the package.*
