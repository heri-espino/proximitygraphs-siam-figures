# Who Counts as a Neighbor?
*From empty regions to AI, topology, and stochastic geometry*

**SIAM News — Software and Programming | Revised author draft, not submitted**

**Héctor Maravillo** — Universidad Autónoma Metropolitana (UAM), Mexico; **Diego Villarreal de la Cerda** — T-Systems; **Heriberto Espino-Montelongo** — Universidad de las Américas Puebla (UDLAP). *Byline and affiliations remain subject to the coauthors’ approval.*

A cloud of points has no edges until someone defines what *neighbor* means. That definition determines which information can flow through a graph, which gaps count as meaningful, and which geometric structures survive noise. It may also determine the output of a graph neural network or the topology inferred from a dataset. **[ProximityGraphs](https://github.com/ProximityGraphs/ProximityGraphs)** is an open-source Python toolkit that turns this modeling decision into an experiment: construct multiple geometric graphs on the same point set, compare their structure, and examine what changes when the neighborhood rule changes.

## From locations to structure

Voronoi diagrams divide space by the nearest site; their Delaunay dual connects sites with adjacent cells. The same construction can organize emergency-water stations, emergency-response territories, facility allocation, spatial interpolation, and adaptive meshes for partial differential equations. John Snow's 1854 cholera investigation makes the nearest-water-source question historically recognizable, although our example uses invented sites and straight-line distances, not Snow's data or street-network distances.

**Figure 1.** *Service areas and their dual network.* Synthetic water stations, Euclidean Voronoi cells, and Delaunay edges. Move a station, add another, or inspect which cells exchange territory. [Explore the interactive geometry](https://heri-espino.github.io/proximitygraphs-siam-figures/#water).

Geometry also structures observations that cannot conveniently be placed on a map. In an astronomical catalog, observations are points in a space of measured features; in single-cell biology, coordinates and molecular markers describe a tissue; in robotics, LiDAR returns millions of 3D samples. Converting these locations to neighborhoods supplies the computational substrate for local estimation, spatial clustering, graph signal processing, and mesh-based simulation. A particularly concrete example appeared in 2026: the **SpaCEy** explainable graph-neural-network model constructs Delaunay graphs between tissue cells to learn spatial patterns associated with clinical outcomes (Rifaioglu et al., 2026). The geometry specifies which cells can exchange information; the learning algorithm decides what to infer from it.

The general mathematical setting is **\(\mathbb R^d\), for any \(d\geq1\)**: points can be geographic coordinates, 3D positions, gene-expression measurements, or learned embeddings. The current **ProximityGraphs implementation concentrates on planar algorithms**; although its point-set container accommodates other coordinate dimensions, not every graph constructor is yet dimension-general.

## Shape, holes, and scale

A convex hull covers a point cloud but hides indentations. Alpha-shapes and circular-arc **alpha-hulls** recover scale-dependent envelopes: tightening the underlying geometric radius can expose bays, separated clusters, and gaps. That scale choice matters when delineating observed habitats, outlining archaeological sites, reconstructing scanned objects, analyzing porous materials, or approximating regions in microscopy. The boundary is a geometric summary—not automatically a confidence region or a physical surface.

**Figure 2.** *An envelope made from circles.* A circular alpha-hull around synthetic ecological observations; selecting an arc reveals its supporting circle, while changing \(\alpha\) changes the scale. [Manipulate the boundary](https://heri-espino.github.io/proximitygraphs-siam-figures/#habitat).

The connection to topology goes deeper than an outline. **Alpha complexes**, related to—but mathematically distinct from—the plotted alpha-hulls, form a filtration as the scale varies. Persistent homology can then follow connected components, loops, and higher-dimensional voids: features useful when studying molecular cavities, brain-imaging point clouds, porous structures, or the shape of a learned latent space. Likewise, Isomap replaces straight-line distances with shortest paths on a neighborhood graph to reconstruct nonlinear manifolds (Tenenbaum et al., 2000). In both settings, **the topology or geodesic geometry discovered downstream depends on which neighborhoods were constructed upstream**. ProximityGraphs offers a way to compare such graph choices; it does not itself claim to compute persistent homology or perform manifold learning.

## Empty regions as computational decisions

In a **beta-skeleton**, two points are joined when a prescribed region between them contains no competing point. The empty lune for \(\beta=2\) yields the relative neighborhood graph; at \(\beta=1\), the Gabriel graph arises. For planar point sets in general position, a familiar hierarchy is
\[
\mathrm{MST}\subseteq\mathrm{RNG}\subseteq\mathrm{GG}\subseteq\mathrm{Delaunay}.
\]
The inclusions expose different degrees of geometric sparsity, which matters for sensor-network candidates, decentralized communication, geometric routing, spatial anomaly detection, image morphology, and the skeleton of an observed shape. They do **not** guarantee that a wireless edge is physically viable or that a graph is an optimal routing network.

**Figure 3.** *An edge justified by emptiness.* Synthetic sensor locations with a beta-skeleton and its defining lens. Adding a point inside that lens may eliminate the selected edge. [Explore the empty-region test](https://heri-espino.github.io/proximitygraphs-siam-figures/#sensors).

This notion of selective adjacency is also consequential in AI. A graph neural network aggregates messages over chosen edges; different neighborhood rules therefore impose different **inductive biases**—assumptions about which observations should influence one another. In manifold learning, a bridge between nearby but separate structures can create an artificial geodesic shortcut. In graph-based vector search, navigable small-world graphs connect high-dimensional embeddings so that approximate nearest-neighbor queries can traverse only part of a database (Malkov & Yashunin, 2020), a mechanism relevant to retrieval systems and recommendation pipelines. Such indexes are **related research applications of proximity graphs**, not HNSW features provided by the present library.

## One-line stochastic geometry

What happens when the sites themselves are random? Devroye (1988) studied empty-region graphs in \(\mathbb R^d\) and showed that remarkably simple asymptotic degree laws emerge across broad sampling densities. For a stationary Poisson process of intensity \(\rho\), suppose the exclusion region of a pair at separation \(r\) has volume \(a\,r^d\). Writing \(v_d\) for the unit-ball volume gives
\[
\Pr(\text{edge}\mid r)=e^{-\rho a r^d},
\qquad
\mathbb E[\deg]=\frac{v_d}{a}.
\]
Thus **shape enters through a unit-region volume, and the mean degree does not depend on point intensity** under this homogeneous model. In two dimensions, the Gabriel graph has mean degree **4**; the relative neighborhood graph has mean degree approximately **2.558**. Penrose and Yukich (2001) further studied central limit theorems for geometric-graph statistics, including total edge length and component counts under specified random-point models. The same constructions therefore connect visual geometry to sampling theory, uncertainty quantification, and statistical tests for spatial organization.

## A geometry laboratory in Python

ProximityGraphs combines point generators (including random spatial processes), graph constructors, visualization, graph summaries, and repeated-experiment helpers. For instance, `pg.GG(points)`, `pg.RNG(points)`, and `pg.DelaunayG(points)` let researchers compare adjacency on unchanged coordinates; the resulting graphs can inform, rather than replace, downstream learning or topological analysis. Its source is MIT-licensed, and optional GIS utilities connect the workflow with geospatial data.

The [interactive companion](https://heri-espino.github.io/proximitygraphs-siam-figures/) makes three examples editable without installation: the default geometries are exported by the Python library, while user-edited points are recomputed separately in the browser. The scientific contribution is not a claim that one graph is always best. It is the ability to **make geometric assumptions explicit, change them reproducibly, and study their consequences**.

**Try the library:** [Source and examples](https://github.com/ProximityGraphs/ProximityGraphs) · [PyPI](https://pypi.org/project/proximitygraphs/) · `pip install proximitygraphs`. The Python release is currently a pre-release; selected algorithms and models are planar.

## References

Devroye, L. (1988). The expected size of some graphs in computational geometry. *Computers & Mathematics with Applications, 15*(1), 53–64.

Edelsbrunner, H., Kirkpatrick, D. G., & Seidel, R. (1983). On the shape of a set of points in the plane. *IEEE Transactions on Information Theory, 29*(4), 551–559.

Gabriel, K. R., & Sokal, R. R. (1969). A new statistical approach to geographic variation analysis. *Systematic Zoology, 18*(3), 259–278.

Malkov, Y. A., & Yashunin, D. A. (2020). Efficient and robust approximate nearest neighbor search using hierarchical navigable small world graphs. *IEEE Transactions on Pattern Analysis and Machine Intelligence, 42*(4), 824–836.

Maravillo, H., Villarreal de la Cerda, D., & Espino-Montelongo, H. (2026). *ProximityGraphs* [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.21088183

Penrose, M. D., & Yukich, J. E. (2001). Central limit theorems for some graphs in computational geometry. *Annals of Applied Probability, 11*(4), 1005–1041.

Rifaioglu, A. S., Ervin, E. H., Sarigun, A., et al. (2026). SpaCEy links spatial tissue patterns to clinical outcomes using explainable graph neural networks. *Nature Communications, 17*, 10232. https://doi.org/10.1038/s41467-026-77924-z

Tenenbaum, J. B., de Silva, V., & Langford, J. C. (2000). A global geometric framework for nonlinear dimensionality reduction. *Science, 290*(5500), 2319–2323.

Toussaint, G. T. (1980). The relative neighbourhood graph of a finite planar set. *Pattern Recognition, 12*(4), 261–268.

## About the authors

Héctor Maravillo works on computational geometry and proximity graphs at Universidad Autónoma Metropolitana (UAM), Mexico.

Diego Villarreal de la Cerda works at T-Systems and contributes to the computational development of ProximityGraphs.

Heriberto Espino-Montelongo studies stochastic geometry, spatial statistics, and computational mathematics at Universidad de las Américas Puebla.

*Editorial note: Provisional author-approved-byline status; the article has not been submitted to SIAM News. All three figures use synthetic locations. The general mathematical applications described are not assertions of implemented, validated workflows in the package.*
