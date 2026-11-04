"""Mathematical checks against the installed ProximityGraphs version."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from export_scenes import ALPHAS, BETAS, BETA, WATER, build, cells  # noqa: E402


class GeometryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.scenes = build()

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
        for a in ALPHAS:
            arcs = self.scenes["alpha"]["options"][str(a)]["arcs"]
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
        dataset = self.scenes["alpha"]
        triangles = dataset["triangles"]
        self.assertTrue(triangles)
        for alpha in ALPHAS:
            option = dataset["options"][str(alpha)]
            self.assertEqual(option["segments"], option["shape_edges"])
            boundary = set(map(tuple, option["shape_edges"]))
            self.assertTrue(boundary)
            for tri in option["kept_triangles"]:
                self.assertEqual(len(tri), 3)
                self.assertTrue(all(0 <= index < len(dataset["points"]) for index in tri))
            computed = [
                tri["vertices"] for tri in triangles
                if tri["r"] <= 1 / alpha + 1e-12
            ]
            self.assertEqual(sorted(computed),
                             sorted(option["kept_triangles"]))

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
        self.assertEqual(len(BETA), 19)
        for earlier, later in zip(graphs, graphs[1:]):
            self.assertTrue(later <= earlier)


if __name__ == "__main__":
    unittest.main()
