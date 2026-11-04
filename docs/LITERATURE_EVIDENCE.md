# Literature evidence map — SIAM News ProximityGraphs feature

**Date:** 2026-11-04. **Status:** author research notes, not an accepted scientific or editorial claim.  
**Primary corpus:** [ProximityGraphs-ML/literature/extracted](https://github.com/heri-espino/ProximityGraphs-ML/tree/main/literature/extracted). This corpus contains Markdown extractions of scientific papers; the source PDFs are final authorities for quotation, precise hypotheses, formulas, and pagination. This file records what can *responsibly* be stated in an outreach feature.

## 1. Verified directly relevant studies

| Work | Main content verified from extracted text | Article opportunity | Limit |
| --- | --- | --- | --- |
| [Dyballa & Zucker, 2023, IAN](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Dyballa-Zucker_2023_IAN-Manifold-Learning-Dimension.md) | Iterated adaptive neighborhoods **begin with a Gabriel graph**, iteratively sparsify it, and improve manifold geodesic/dimension analysis | Concrete example of a *Gabriel construction actually used for machine learning* | The IAN algorithm is **not** implemented by ProximityGraphs |
| [Costa & Hero, 2004](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Costa-Hero_2004_Geodesic-Entropic-Graphs-Manifold-Dimension.md) | Geodesic MST length is used to estimate manifold intrinsic dimension and Rényi entropy | Geometric graphs can estimate statistical quantities, not only depict shapes | No geodesic-MST dimension/entropy estimator is promised by the library |
| [Gómez et al., 2023](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Gomez_2023_Recovering-Cyclic-Tilings-Beta-Skeletons.md) | Sufficient conditions for cyclic tilings to be β-skeletons; Mérida street-network example | Bridges mathematical morphology and real urban networks | Street geometry is not a road-construction prescription |
| [Aldous & Shun, 2010](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Aldous-Shun_2011_Connected-Spatial-Networks-Route-Length.md) | Quantifies trade-off between normalized network length and route efficiency in random spatial graphs | Adds objective functions beyond visual adjacency | Year is **2010** for the Statistical Science publication; extraction filename says 2011 |
| [Kannangara et al., 2018](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Kannangara_2018_Stepping-Stone-Graph-Public-Movement.md) | Stepping-stone graphs infer possible movement relations from sparse location social-network records | An especially interesting public movement application | Potential movement is not verified individual trajectories |
| [Jurkiewicz, 2023, TopoHub](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Jurkiewicz_2023_TopoHub-Gabriel-Graph-Topologies.md) | Physical-network and Gabriel model topologies for networking benchmarks; Mininet integration | Proximity graphs support reproducible network infrastructure benchmarking | **TopoHub is a separate software product**, not ProximityGraphs |

## 2. Higher dimensions, stochastic laws and statistical learning

| Work | Extracted evidence | Careful mathematical statement |
| --- | --- | --- |
| [Devroye, 1988](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Devroye_1988_Expected-Size-Computational-Geometry-Graphs.md) | Distribution-robust asymptotic expected size of several empty-region graphs | For homogeneous Poisson intensity \(\rho\) and an isotropic region with \(d\)-volume \(a r^d\), the fixed-pair probability is \(e^{-\rho a r^d}\), and the Palm mean degree is \(v_d/a\); planar Gabriel 4, RNG approximately 2.558. The Poisson formula and unit-region extension are also explicitly treated in the **working manuscript** listed next |
| [Espino & Maravillo, 2026, Unit-Region](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Espino_2026_Unit-Region-Factorization-Empty-Region-Graphs.md) | Template-scaling volume, Poisson Palm degree/edge length laws and higher-dimensional formulas | **Working manuscript**, not an independently accepted published source; do not imply journal acceptance or claim these results are first |
| [Penrose & Yukich, 2013](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Penrose-Yukich_2013_Limit-Theory-Point-Processes-Manifolds.md) | For stabilizing local statistics on an \(m\)-dimensional manifold in ambient \(\mathbb R^D\), tangent-plane Poisson models control limit theorems | Supports distinction between intrinsic and ambient dimensions under specified regularity and stabilization |
| [Brito, Quiroz & Yukich, 2013](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Brito-Quiroz-Yukich_2013_Intrinsic-Dimension-Graph-Theoretic-Methods.md) | Mean squared MST degrees, shared k-nearest neighbors and reach statistics estimate intrinsic dimension | Distinct graph statistics carry dimensional information |
| [Facco et al., 2017](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Facco_2017_TwoNN-Intrinsic-Dimension.md) | First/second nearest-neighbor distance ratios estimate intrinsic dimension | Intrinsic information may be extracted without building a full manifold model |
| [Agarwal & Matoušek, 1992](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Agarwal-Matousek_1992_Relative-Neighborhood-Graphs-3D.md) | Relative neighborhood graph algorithms in three-dimensional space | Supports *mathematical and algorithmic* extension beyond the plane |
| [Ceyhan, 2010](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Ceyhan_2010_Proximity-Regions-Higher-Dimensions.md) | Extends certain proximity regions to higher dimensions | Doesn't show that *every ProximityGraphs Python constructor* is dimension-generic |

## 3. Geometry, topology, and downstream AI

| Work | Grounded connection | Do not overclaim |
| --- | --- | --- |
| [Niyogi, Smale & Weinberger, 2008](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Niyogi-Smale-Weinberger_2008_Homology-Submanifolds-Random-Samples.md) | Recovery of manifold homology from random samples under curvature/reach and sample-size assumptions | Distinguish union-of-balls / topological inference from the *displayed* circular alpha-hull |
| [Cardinal et al., 2009](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Cardinal_2009_Empty-Region-Graphs.md) | General empty-region graph theory | Preserve the distinction between graph construction, topological complexes and statistical inference |
| [Iff et al., SIGIR 2026](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Iff_2026_Filtered-Approximate-NN-Search-Embeddings.md) | More than 2.7M arXiv abstract transformer embeddings and multiple nearest-neighbor filtering methods | *Related high-dimensional research*, not a built-in HNSW/filtered ANN/vector DB feature |
| [Eppstein, 2002](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Eppstein_2002_Beta-Skeletons-Unbounded-Dilation.md) | β-skeletons have unbounded dilation in worst-case point configurations | Sparsity does not automatically guarantee short routes or good geometric-spanner stretch |
| [Hayashi et al., 2026](https://github.com/heri-espino/ProximityGraphs-ML/blob/main/literature/extracted/Hayashi-Nomoto-Suzuki_2026_Curvature-Corrections-Random-Geometric-Graphs.md) | Curvature corrections for *intrinsic distance-threshold* random geometric graphs, not identical to ambient empty-region rules | Do not describe as a proved curvature correction for this library's beta-skeleton/ERG models |

## 4. Publication / citation checks

- [Dyballa & Zucker (2023)](https://doi.org/10.1162/neco_a_01566), *Neural Computation* **35**(3), 453–524.
- [Gómez et al. (2023)](https://doi.org/10.1016/j.procs.2023.08.246), *Procedia Computer Science* **223**, 343–351.
- [Iff et al. (2026)](https://doi.org/10.1145/3805712.3809731), SIGIR 2026, pp. 610–622.
- [Aldous & Shun (2010)](https://doi.org/10.1214/10-STS335), *Statistical Science* **25**(3), 275–288.
- [Niyogi et al. (2008)](https://doi.org/10.1007/s00454-008-9053-2), *Discrete & Computational Geometry* **39**, 419–441.
- [Penrose & Yukich (2013)](https://doi.org/10.1214/12-AAP897), *Annals of Applied Probability* **23**(6), 2161–2211.
- [Costa & Hero (2004)](https://doi.org/10.1109/TSP.2004.831130), *IEEE Transactions on Signal Processing* **52**(8), 2210–2221.

The **SIAM News article** is constrained to approximately 10 references. The above is an expanded source bank, not a suggestion to overload its bibliography.

## 5. Editorial selection

The revised \`article/feature.md\` cites or discusses ten highly useful sources, chosen to form four causal links in prose:

\[
\text{point cloud}\to\text{neighborhood rule}
\to\{\text{routes},\text{geodesics},\text{topology},\text{search}\}
\to\text{statistical observables}.
\]

The outreach article should not advertise curvature-estimation theorems that have not yet been proved in the separate ProximityGraphs-ML research project. Similarly, it must distinguish general (d)-dimensional mathematics from present **primarily planar** implementations in the software library.
