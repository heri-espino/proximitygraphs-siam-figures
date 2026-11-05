# SIAM News pitch — revised after literature audit (NOT SENT)

**Section:** Software and Programming  
**Title:** Who Counts as a Neighbor?  
**Subtitle:** From Empty Regions to AI, Topology, and Stochastic Geometry  
**Proposed authors (approval pending):** Héctor Maravillo (Universidad Autónoma Metropolitana, Mexico); Diego Villarreal de la Cerda (T-Systems); Heriberto Espino-Montelongo (Universidad de las Américas Puebla)

A cloud of points has no edges until somebody defines a neighborhood. That choice controls everything downstream: how service areas are partitioned, whether a road-like network balances total length against detours, which local connections preserve a sampled manifold, which spatial voids persist, and what a learning algorithm can propagate between observations. Our open-source Python library **ProximityGraphs** makes these geometric choices reproducible and comparable on the same point cloud.

We propose an approximately **1,150-word** SIAM News Software and Programming feature, supported by three static figures linked to an interactive companion. Readers can explore a modern Voronoi/Delaunay overlay on 13 digitized John Snow pump locations with 578 historical cholera death marks, a circular alpha-hull on a synthetic smiling-face point set, and a beta-skeleton on a synthetic relay sensor network. None is presented as a validated modern field deployment.

The narrative connects these illustrations to **specific published literature**: adaptive Gabriel neighborhoods for manifold learning (Dyballa & Zucker, 2023); β-skeleton street-network tilings (Maravillo Gómez et al., 2023); the spatial-network length/route-efficiency trade-off (Aldous & Shun, 2010); homology recovery from random manifold samples (Niyogi, Smale & Weinberger, 2008); and graph-based filtered embedding search relevant to RAG (Iff et al., 2026). A compact stochastic-geometry equation, linked to Devroye's empty-region results, conveys the depth behind the figures.

The mathematics generalizes to \(\mathbb R^d\); the present software release primarily implements **planar** algorithms. The purpose of the article is scientific explanation, not a claim that the library itself implements manifold learning, persistent homology, AI retrieval, wireless routing, or all high-dimensional graph types.

The manuscript and graphics follow the [SIAM News style guide](https://www.siam.org/media/gfbjvzck/siam-news-info-and-style-guide.pdf), with ten or fewer references and three credited images.

**Review materials:** [Complete article](feature.md) · [Expanded literature audit](../docs/LITERATURE_EVIDENCE.md) · [Python library](https://github.com/ProximityGraphs/ProximityGraphs) · [Interactive figures](https://heri-espino.github.io/proximitygraphs-siam-figures/) · [LaTeX proof](main.tex).

We would welcome editorial guidance on online versus print presentation and links to external interactive figures. **This pitch has not been sent, and all three coauthors must approve the final byline and text before submission.**


## Dataset update — November 2026
The website now displays **digitized John Snow pump positions (13) and cholera death marks (578)** from HistData/Rdatasets as a historical contextual overlay. Its alpha default is a **synthetic smiley point cloud** and its beta default a **synthetic two-cluster relay sensor layout**. The Voronoi/Delaunay edges are modern computations on historical map coordinates, not a technique used by Snow. These data do not support modern GIS distance, medical-causality, or radio-network claims. See [historical provenance](../data/historical/README.md).
