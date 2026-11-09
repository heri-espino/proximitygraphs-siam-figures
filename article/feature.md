# Who Counts as a Neighbor?
*From empty regions to AI, topology, and stochastic geometry*

**SIAM News — Software and Programming | Revised author draft, not submitted**

**Héctor Maravillo** — Universidad Autónoma Metropolitana (UAM), Mexico; **Diego Villarreal de la Cerda** — T-Systems; **Heriberto Espino-Montelongo** — Universidad de las Américas Puebla (UDLAP). *Byline and affiliations remain subject to the coauthors’ approval.*

<!-- ARTICLE_BODY_START -->

A cloud of points has no edges until someone defines what *neighbor* means. That definition determines which information can flow through a graph, which gaps count as meaningful, and which geometric structures survive noise. It may also determine the output of a graph neural network or the topology inferred from a dataset. **[ProximityGraphs](https://github.com/ProximityGraphs/ProximityGraphs)** is an open-source Python toolkit that turns this modeling decision into an experiment: construct multiple geometric graphs on the same point set, compare their structure, and examine what changes when the neighborhood rule changes.

## From locations to structure

Voronoi diagrams divide space by the nearest site; their Delaunay dual connects sites with adjacent cells. The same construction can organize emergency-water stations, emergency-response territories, facility allocation, spatial interpolation, and adaptive meshes for partial differential equations. John Snow's 1854 cholera investigation provides a historical case: our figure uses digitized pump and death locations from the [HistData Snow collection](https://vincentarelbundock.github.io/Rdatasets/doc/HistData/Snow.pumps.html). We construct a modern Euclidean diagram on those coordinates; Snow did not construct this Voronoi model, and straight-line distance is not street-network access.

**Figure 1.** *John Snow's pumps and a modern geometric overlay.* Thirteen digitized historical Soho pumps define Euclidean Voronoi cells and Delaunay edges; 578 historical death marks form a separate background layer. Dragging a pump creates a hypothetical alternative, not a change to the historical data. [Explore the interactive geometry](https://heri-espino.github.io/proximitygraphs-siam-figures/#water).

The same tension governs road networks. Aldous and Shun (2010) quantify the conflict between construction length and travel efficiency, while Maravillo Gómez and collaborators (2023) show how β-skeletons recover idealized cyclic street tilings and approximate real urban patterns. Sparse adjacency thus encodes more than appearance: it determines whether useful routes require costly detours.

Away from geography, images, gene-expression profiles, astronomical spectra, and learned embeddings are points in high-dimensional feature spaces. Costa and Hero (2004) estimate intrinsic dimension and entropy from geodesic minimum-spanning-tree lengths; more directly, Dyballa and Zucker (2023) initialize adaptive manifold neighborhoods with a **Gabriel graph**, then sparsify it to improve geodesic computation and dimension estimation. Choosing neighbors is already part of the learning algorithm, not merely a preliminary visualization.

The general mathematical setting is **\(\mathbb R^d\), for any \(d\geq1\)**: points can be geographic coordinates, 3D positions, gene-expression measurements, or learned embeddings. The current **ProximityGraphs implementation concentrates on planar algorithms**; although its point-set container accommodates other coordinate dimensions, not every graph constructor is yet dimension-general.

## Shape, holes, and scale

A convex hull covers a point cloud but hides indentations. Alpha-shapes and circular-arc **alpha-hulls** recover scale-dependent envelopes: tightening the underlying geometric radius can expose bays, separated clusters, and gaps. That scale choice matters when delineating observed habitats, outlining archaeological sites, reconstructing scanned objects, analyzing porous materials, or approximating regions in microscopy. The boundary is a geometric summary—not automatically a confidence region or a physical surface.

**Figure 2.** *An envelope made from circles.* The **Pg** default samples a supplied serif-letter image with 600 points (380 original image-derived sites plus 220 interior samples), preserving delicate outer contours and more densely stippling the bold strokes. At \(\alpha\approx-28.57\), its alpha-shape has two enclosed counters—one per letter; the alpha-hull traces curved arcs around its straight boundary. The original smiley remains selectable. Choosing an arc reveals its supporting circle. [Manipulate the boundary](https://heri-espino.github.io/proximitygraphs-siam-figures/#habitat).

Topology makes the scale question more consequential. **Alpha complexes**, related to but distinct from the displayed alpha-hulls, form filtrations in which persistent homology tracks connected components, loops, and higher-dimensional voids. Niyogi, Smale, and Weinberger (2008) establish conditions under which homology of an unknown manifold can be recovered reliably from random samples. Such ideas connect molecular cavities, porous materials, brain imaging, and the topology of learned representations. Graph geodesics similarly underpin nonlinear dimensionality reduction, where one misplaced edge can create a false shortcut between manifold folds. **The inferred structure is conditional on the neighborhood model.** ProximityGraphs provides graph constructions for investigating that choice, not a built-in persistent-homology engine.

## Empty regions as computational decisions

In a **beta-skeleton**, two points are joined when a prescribed region between them contains no competing point. The empty lune for \(\beta=2\) yields the relative neighborhood graph; at \(\beta=1\), the Gabriel graph arises. For planar point sets in general position, a familiar hierarchy is
\[
\mathrm{MST}\subseteq\mathrm{RNG}\subseteq\mathrm{GG}\subseteq\mathrm{Delaunay}.
\]
The inclusions expose different degrees of geometric sparsity, which matters for sensor-network candidates, decentralized communication, geometric routing, spatial anomaly detection, image morphology, and the skeleton of an observed shape. They do **not** guarantee that a wireless edge is physically viable or that a graph is an optimal routing network.

**Figure 3.** *An edge justified by emptiness.* Two synthetic sensor clusters connected by a relay corridor, with a beta-skeleton and its defining lens. Adding a point inside that lens may eliminate the selected edge. [Explore the empty-region test](https://heri-espino.github.io/proximitygraphs-siam-figures/#sensors).

This selective adjacency reaches AI systems through **inductive bias**: in a graph neural network, the edges define which objects exchange messages. In transformer-based search, neighborhood structures support approximate retrieval of relevant text, images, and other embeddings; Iff and collaborators (2026) benchmark filtered nearest-neighbor methods on embeddings from more than 2.7 million research papers, a setting relevant to retrieval-augmented generation and recommendation. The underlying question is shared—**which neighbors preserve useful information without making every pair adjacent?**—but ProximityGraphs is a geometric-graph toolkit, not a transformer index or a vector database.

## One-line stochastic geometry

What happens when the sites themselves are random? Devroye (1988) studied empty-region graphs in \(\mathbb R^d\) and showed that remarkably simple asymptotic degree laws emerge across broad sampling densities. For a stationary Poisson process of intensity \(\rho\), suppose the exclusion region of a pair at separation \(r\) has volume \(a\,r^d\). Writing \(v_d\) for the unit-ball volume gives
\[
\Pr(\text{edge}\mid r)=e^{-\rho a r^d},
\qquad
\mathbb E[\deg]=\frac{v_d}{a}.
\]
Thus **shape enters through a unit-region volume, and the mean degree does not depend on point intensity** under this homogeneous model. In two dimensions, the Gabriel graph has mean degree **4**; the relative neighborhood graph has mean degree approximately **2.558**. Penrose and Yukich (2013) show that many local geometric statistics of random samples on a smooth manifold have limiting laws governed by Poisson processes on its intrinsic-dimensional tangent planes. This connects ambient coordinates, hidden dimension, and statistical uncertainty, although curvature corrections beyond the tangent limit remain a separate mathematical problem.

## A geometry laboratory in Python

ProximityGraphs combines point generators (including random spatial processes), graph constructors, visualization, graph summaries, and repeated-experiment helpers. For instance, `pg.GG(points)`, `pg.RNG(points)`, and `pg.DelaunayG(points)` let researchers compare adjacency on unchanged coordinates; the resulting graphs can inform, rather than replace, downstream learning or topological analysis. Its source is MIT-licensed, and optional GIS utilities connect the workflow with geospatial data.

The [interactive companion](https://heri-espino.github.io/proximitygraphs-siam-figures/) makes three examples editable without installation: the default geometries are exported by the Python library, while user-edited points are recomputed separately in the browser. The scientific contribution is not a claim that one graph is always best. It is the ability to **make geometric assumptions explicit, change them reproducibly, and study their consequences**.

**Try the library:** [Source and examples](https://github.com/ProximityGraphs/ProximityGraphs) · [PyPI](https://pypi.org/project/proximitygraphs/) · `pip install proximitygraphs`. The Python release is currently a pre-release; selected algorithms and models are planar.

## References

Aldous, D. J., & Shun, J. (2010). Connected spatial networks over random points and a route-length statistic. *Statistical Science, 25*(3), 275–288. https://doi.org/10.1214/10-STS335

Costa, J. A., & Hero, A. O. (2004). Geodesic entropic graphs for dimension and entropy estimation in manifold learning. *IEEE Transactions on Signal Processing, 52*(8), 2210–2221. https://doi.org/10.1109/TSP.2004.831130

Devroye, L. (1988). The expected size of some graphs in computational geometry. *Computers & Mathematics with Applications, 15*(1), 53–64.

Dyballa, L., & Zucker, S. W. (2023). IAN: Iterated adaptive neighborhoods for manifold learning and dimensionality estimation. *Neural Computation, 35*(3), 453–524. https://doi.org/10.1162/neco_a_01566

Edelsbrunner, H., Kirkpatrick, D. G., & Seidel, R. (1983). On the shape of a set of points in the plane. *IEEE Transactions on Information Theory, 29*(4), 551–559.

Iff, P., Brügger, P., Chrapek, M., Kochergin, D., Besta, M., & Hoefler, T. (2026). Benchmarking filtered approximate nearest neighbor search algorithms on transformer-based embedding vectors. *Proceedings of SIGIR 2026*, 610–622. https://doi.org/10.1145/3805712.3809731

Maravillo Gómez, H. S., Calvillo Vives, G., & Treviño Aguilar, E. (2023). Recovering cyclic tilings through β-skeletons. *Procedia Computer Science, 223*, 343–351. https://doi.org/10.1016/j.procs.2023.08.246

Maravillo, H., Villarreal de la Cerda, D., & Espino-Montelongo, H. (2026). *ProximityGraphs* [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.21088183

Niyogi, P., Smale, S., & Weinberger, S. (2008). Finding the homology of submanifolds with high confidence from random samples. *Discrete & Computational Geometry, 39*, 419–441. https://doi.org/10.1007/s00454-008-9053-2

Penrose, M. D., & Yukich, J. E. (2013). Limit theory for point processes in manifolds. *Annals of Applied Probability, 23*(6), 2161–2211. https://doi.org/10.1214/12-AAP897

## About the authors

Héctor Maravillo works on computational geometry and proximity graphs at Universidad Autónoma Metropolitana (UAM), Mexico.

Diego Villarreal de la Cerda works at T-Systems and contributes to the computational development of ProximityGraphs.

Heriberto Espino-Montelongo develops mathematical research in geometric probability, stochastic geometry, and spatial networks at Universidad de las Américas Puebla.

*Editorial note: Provisional byline subject to approval; the article has not been submitted to SIAM News. The Voronoi figure uses digitized historical map coordinates; the Pg/smiley and sensor figures are synthetic. The general mathematical applications described are not assertions of implemented, validated workflows in the package.*
