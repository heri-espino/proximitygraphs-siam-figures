# ProximityGraphs implementation audit — 2026-11-08

**Purpose.** Support the SIAM News article with a **verified inventory of implemented public Python constructors**, without overwhelming the reader with a catalogue. This is a code and documentation audit, **not** a performance benchmark or claim that every model is implemented in arbitrary dimensions.

**Source of truth:** [ProximityGraphs/ProximityGraphs](https://github.com/ProximityGraphs/ProximityGraphs), source revision [d1a216d7255cbebea68dcaad6a97382168a3ec55](https://github.com/ProximityGraphs/ProximityGraphs/tree/d1a216d7255cbebea68dcaad6a97382168a3ec55). Inspected its \`src/proximitygraphs/__init__.py\`, \`src/proximitygraphs/proximity/__init__.py\`, \`src/proximitygraphs/biological/__init__.py\`, specialized constructor modules, \`docs/source/index.rst\`, \`docs/source/modules/proximitygraphs.rst\`, \`docs/source/modules/biologicalgraphs.rst\`, and implementation pages. This is the version pinned by the companion's \`requirements.txt\`. An import/export is evidence of a maintained API *entry point*, not of independent correctness for every input.

## Public named geometric/proximity constructors

The top-level package exports **16 named constructors** and one shared base class \`ProximityGraph\` (which is *not* included in the count).

| Function or class | Role in the article | Implementation |
| --- | --- | --- |
| \`Voronoi\` | Nearest-site adjacency/partitions (diagram cells computed separately in the companion) | \`src/proximitygraphs/proximity/voronoi.py\` |
| \`DelaunayG\` | Adjacent sites and meshing | \`.../delaunay.py\` |
| \`Convex_Hull\` | Outer boundary | \`.../hull.py\` |
| \`Alpha_Shape\` | Straight scale-dependent shape | \`.../alpha.py\` |
| \`Alpha_Hull\` | Circular-arc boundary | \`.../alpha.py\` |
| \`MST\` | Minimum-total-length connections | \`.../spanning.py\` |
| \`NNG\` | Nearest-neighbor links | \`.../nearest.py\` |
| \`GG\` | Gabriel empty-disk adjacency | \`.../gabriel.py\` |
| \`RNG\` | Relative-neighborhood empty-lune adjacency | \`.../relateve.py\` |
| \`Beta_Skeleton\` | Parameterized circular/lune exclusion regions | \`.../beta.py\` |
| \`Gamma_Graph\` | Two-parameter γ-neighborhood regions | \`.../gamma.py\` |
| \`Stepping_Stone\` | Parameterized power-distance region, allowed blockers | \`.../stepping.py\` |
| \`Elliptic_GabrielG\` | Empty ellipses | \`.../elliptic.py\` |
| \`Sigma_Graph\` | Sigma-scaled local-region criterion | \`.../sigma.py\` |
| \`SIG\` | Sphere-of-influence overlap | \`.../influence.py\` |
| \`Unit_Disk\` | Distance-threshold connectivity | \`.../unit_disk.py\` |

**Do not present all sixteen names in the SIAM News prose.** The article deliberately tells readers which modeling knobs change (distance cutoff, empty region, scale, allowed intervening points, local sparsity) and names representative families that demonstrate these differences. The full name inventory belongs here or in the library's own reference docs.

## Two distinct bio-inspired constructors

| Class | Actual computational mechanism | Scope |
| --- | --- | --- |
| \`PhysarumGraph\` | Initializes a candidate network (Delaunay or complete), solves a pressure/flow system, adapts edge conductivities through repeated updates, and prunes weak connections | Algorithm inspired by *Physarum polycephalum*. A flow-based heuristic, **not** an experimentally validated organism simulation |
| \`FungalGraph\` | Builds on a Physarum-style backbone, adds candidate short links using degree and shortcut incentives, and prunes weaker non-backbone edges | A constructive fungal/mycelium-inspired heuristic, **not** a reproduction of an observed fungal specimen |

Both are exported in \`src/proximitygraphs/biological/__init__.py\` and re-exported by top-level \`__init__.py\`; implementations: \`src/proximitygraphs/biological/physarum.py\` and \`fungal.py\`. They complement rather than belong to the strict class of empty-region graphs.

A conceptual flow model (from the Physarum documentation) is

\[
Q_{ij}=D_{ij}(p_i-p_j)/L_{ij}, \qquad
D_{ij}^{\,\mathrm{new}} = D_{ij}+\Delta t\bigl(|Q_{ij}|^\gamma-D_{ij}\bigr),
\]

with \(D\) the conductivity, \(L\) the link length, \(p\) the solved node pressure and \(\gamma\) an adaptation exponent. This is a **mechanistic example**; no biological or route-optimality theorem follows merely from running it. In particular, when comparing to \`Gamma_Graph\`, note that the physically motivated **flow exponent \(\gamma\)** and the **geometric γ-neighborhood parameters** are unrelated.

## Shared computational workflow

\`SetPoints\` handles seeded point processes (including homogeneous and inhomogeneous Poisson examples), grids, clusters and transformations. \`Experiment\` configures several constructors, repeated seeds, and summaries of degree, edge length and connectedness. \`GeometricGraph\` supplies drawing, operations and optional GIS helpers; imports are exposed from \`src/proximitygraphs/__init__.py\`. Ancillary \`GeometricGraph.complete\` and Erdős–Rényi random graph support are not counted in the sixteen named proximity constructors.

**A mathematical distinction:** classical emptiness is not the same as a distance cutoff, adaptive flow or an optimization heuristic. The code provides all these **related classes of spatial network models**; the feature's editorial value is letting the reader contrast them on a common point set.

## Accuracy and limitations

- The package README, \`pyproject.toml\`, and docs identify a primarily **planar** implementation. Although point sets and some individual predicates admit larger \(\mathbb R^d\), **do not** claim every constructor supports arbitrary dimensions.
- \`Gamma_Graph\` is indeed implemented and exported, even though some documentation pages use older parameter explanations; prefer the **current Python source** for parameter semantics.
- \`PhysarumGraph\` and \`FungalGraph\` are *inspired* models and may require substantial computation. No universal resilience, optimality, convergence, or field-deployment claims are warranted by this audit.
- Real-world use cases in spatial planning, ML neighborhoods, geometric morphology and sensor-network **candidates** are motivating applications, **not** evidence that this library has been validated in those domains.
- This audit is scoped to the pinned 2026-11-08 commit. Reinspect source exports and implementation before asserting a future release's public API.

## Article inclusion strategy

The [SIAM feature](../article/feature.md) uses short functional clusters: spatial partitions, sparse and empty-region adjacency, tunable γ/β/stepping-stone/elliptic regions, alpha boundaries, followed by adaptive *Physarum* and fungal heuristics. One compact paragraph then explains \`SetPoints\`, \`Experiment\` and GIS; the rest of the article keeps its three interactive stories, the same ten references and the stochastic-geometry identity.

**Why this choice:** showing fourteen or sixteen names in a magazine column would weaken the narrative. Naming a handful of concrete implemented families, explaining *what changes physically or mathematically*, then linking the complete list is stronger software communication than a long catalogue.
