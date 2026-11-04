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

    def test_beta_edges_nested_for_increasing_beta(self):
        graphs = [set(map(tuple, self.scenes["beta"]["options"][str(b)]))
                  for b in BETAS]
        self.assertEqual(len(BETA), 19)
        for earlier, later in zip(graphs, graphs[1:]):
            self.assertTrue(later <= earlier)


if __name__ == "__main__":
    unittest.main()
