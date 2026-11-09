"""Mathematical checks against the installed ProximityGraphs version."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from export_scenes import (ALPHAS, SMILEY_ALPHAS, BETAS, BETA, WATER, HABITAT,
                           PG_POINTS, SMILEY_POINTS, SNOW_DEATHS, PUMP_LABELS,
                           BROAD_STREET, build, cells, alpha_topology)  # noqa: E402


class GeometryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.scenes = build()

    def test_historical_and_synthetic_default_provenance(self):
        self.assertEqual(len(WATER), 13)
        self.assertEqual(len(SNOW_DEATHS), 578)
        self.assertEqual(PUMP_LABELS[BROAD_STREET], "Broad St")
        self.assertEqual(len(HABITAT), 380)
        self.assertTrue(np.array_equal(HABITAT, PG_POINTS))
        self.assertEqual(len(SMILEY_POINTS), 53)
        self.assertEqual(len(BETA), 25)
        self.assertEqual(self.scenes["voronoi"]["labels"], PUMP_LABELS)
        self.assertEqual(len(self.scenes["voronoi"]["death_marks"]), 578)
        self.assertEqual(self.scenes["voronoi"]["historical"]["broad_street_index"], BROAD_STREET)
        self.assertTrue(np.all((WATER >= 0) & (WATER <= 1)))
        self.assertTrue(np.all((SNOW_DEATHS >= 0) & (SNOW_DEATHS <= 1)))

    def test_alpha_presets_and_exactly_two_pg_holes(self):
        alpha = self.scenes["alpha"]
        self.assertEqual(alpha["default_preset"], "pg")
        self.assertEqual(set(alpha["presets"]), {"pg", "smiley"})
        self.assertEqual(alpha["points"], alpha["presets"]["pg"]["points"])
        self.assertEqual(alpha["options"], alpha["presets"]["pg"]["options"])
        self.assertEqual(alpha["presets"]["pg"]["alpha_values"], list(ALPHAS))
        self.assertEqual(alpha["presets"]["smiley"]["alpha_values"], list(SMILEY_ALPHAS))
        self.assertEqual(len(alpha["presets"]["pg"]["points"]), 380)
        self.assertEqual(len(alpha["presets"]["smiley"]["points"]), 53)
        self.assertEqual(alpha["presets"]["pg"]["default_alpha_index"], 2)
        default = alpha["presets"]["pg"]["options"][str(ALPHAS[2])]
        self.assertEqual(default["topology"], {"components": 2, "holes": 2})
        self.assertEqual(alpha_topology(default["kept_triangles"]), default["topology"])
        # A real filtration: counters emerge as the circumradius cutoff tightens.
        self.assertEqual(alpha["options"]["22"]["topology"]["holes"], 3)
        self.assertEqual(alpha["options"]["26"]["topology"]["holes"], 2)
        self.assertEqual(alpha["options"]["32"]["topology"]["holes"], 2)
        self.assertEqual(len(alpha["presets"]["pg"]["point_roles"]), 380)
        self.assertEqual(alpha["presets"]["pg"]["point_roles"].count("outline"), 298)
        self.assertEqual(alpha["presets"]["pg"]["point_roles"].count("stroke"), 82)
        # Verify the four genuine loops: two outer letter contours and the
        # two counter boundaries, without a spurious closed lower-g flourish.
        boundary = default["shape_edges"]
        adjacency = {}
        for u,v in boundary:
            adjacency.setdefault(u,[]).append(v)
            adjacency.setdefault(v,[]).append(u)
        self.assertTrue(all(len(neighbors)==2 for neighbors in adjacency.values()))
        unseen = {tuple(edge) for edge in boundary}
        loops = []
        points = np.asarray(alpha["presets"]["pg"]["points"])
        while unseen:
            u,v = next(iter(unseen))
            start = u
            current, previous = u, -1
            indices = [start]
            for _ in range(len(boundary)+1):
                options = [w for w in adjacency[current]
                           if w!=previous and tuple(sorted((current,w))) in unseen]
                self.assertTrue(options, "Incomplete alpha-shape boundary cycle")
                nxt = options[0]
                unseen.remove(tuple(sorted((current,nxt))))
                if nxt==start:break
                indices.append(nxt)
                previous,current = current,nxt
            else:
                self.fail("Boundary cycle never closed")
            loops.append(points[indices])
        self.assertEqual(len(loops),4)
        def area(vertices):
            return .5*abs(np.dot(vertices[:,0],np.roll(vertices[:,1],-1))-
                           np.dot(vertices[:,1],np.roll(vertices[:,0],-1)))
        counters = sorted(loops,key=area)[:2]
        self.assertTrue(any(loop[:,0].mean()<.5 and loop[:,1].mean()>.55
                            for loop in counters),"P counter is missing")
        self.assertTrue(any(loop[:,0].mean()>.60 and loop[:,1].mean()>.43
                            for loop in counters),"g counter is missing")

    def test_voronoi_cells_are_valid_and_nearest(self):
        polygons = cells(WATER)
        self.assertEqual(len(polygons), len(WATER))
        for i, poly in enumerate(polygons):
            self.assertGreaterEqual(len(poly), 3)
            for v in poly:
                self.assertTrue(all(0 <= x <= 1 for x in v))
                d = np.linalg.norm(np.asarray(v) - WATER[i])
                for q in WATER:
                    self.assertLessEqual(d, np.linalg.norm(np.asarray(v) - q) + 1e-8)

    def test_voronoi_adjacency_matches_delaunay_dual(self):
        v = set(map(tuple, self.scenes["voronoi"]["adjacency"]))
        d = set(map(tuple, self.scenes["voronoi"]["delaunay"]))
        self.assertEqual(v, d)

    def test_alpha_arc_circle_radii(self):
        for preset in self.scenes["alpha"]["presets"].values():
            for a in preset["alpha_values"]:
                arcs = preset["options"][str(a)]["arcs"]
                self.assertGreater(len(arcs), 0)
                for samples in arcs:
                    if len(samples) < 3:
                        continue
                    p, q, r = np.asarray(samples)[[0, len(samples)//2, -1]]
                    mat = 2 * np.stack([q-p, r-p])
                    rhs = np.array([q@q-p@p, r@r-p@p])
                    if abs(np.linalg.det(mat)) < 1e-12:
                        continue
                    center = np.linalg.solve(mat, rhs)
                    self.assertAlmostEqual(float(np.linalg.norm(p-center)), 1/a, places=4)

    def test_alpha_shapes_and_retained_simplices(self):
        for dataset in self.scenes["alpha"]["presets"].values():
            triangles = dataset["triangles"]
            self.assertTrue(triangles)
            for alpha in dataset["alpha_values"]:
                option = dataset["options"][str(alpha)]
                self.assertEqual(option["segments"], option["shape_edges"])
                boundary = set(map(tuple, option["shape_edges"]))
                self.assertTrue(boundary)
                for tri in option["kept_triangles"]:
                    self.assertEqual(len(tri), 3)
                    self.assertTrue(all(0 <= index < len(dataset["points"])
                                        for index in tri))
                computed = [t["vertices"] for t in triangles
                            if t["r"] <= 1 / alpha + 1e-12]
                self.assertEqual(sorted(computed),
                                 sorted(option["kept_triangles"]))
                self.assertEqual(alpha_topology(computed), option["topology"])

    def test_compare_reference_graphs(self):
        compare = self.scenes["compare"]
        self.assertEqual(len(compare["points"]), len(BETA))
        keys = {"delaunay", "gabriel", "rng", "beta", "alpha-shape"}
        self.assertEqual(set(compare["options"]), keys)
        for edges in compare["options"].values():
            self.assertTrue(all(0 <= a < b < len(BETA) for a, b in edges))
        g = set(map(tuple, compare["options"]["gabriel"]))
        r = set(map(tuple, compare["options"]["rng"]))
        d = set(map(tuple, compare["options"]["delaunay"]))
        self.assertTrue(r <= g <= d)
        self.assertEqual(compare["options"]["beta"],
                         self.scenes["beta"]["options"]["1.5"])

    def test_beta_edges_nested_for_increasing_beta(self):
        graphs = [set(map(tuple, self.scenes["beta"]["options"][str(b)]))
                  for b in BETAS]
        self.assertEqual(len(BETA), 25)
        for earlier, later in zip(graphs, graphs[1:]):
            self.assertTrue(later <= earlier)


if __name__ == "__main__":
    unittest.main()
