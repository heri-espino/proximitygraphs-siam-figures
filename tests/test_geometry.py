"""Mathematical checks against the installed ProximityGraphs version."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from export_scenes import (ALPHAS, SMILEY_ALPHAS, BETAS, BETA, WATER, HABITAT,
                           PG_POINTS, PG_REFERENCE_POINTS, SMILEY_POINTS, SNOW_DEATHS, PUMP_LABELS,
                           BROAD_STREET, build, cells, alpha_topology)  # noqa: E402


class GeometryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.scenes = build()

    def test_historical_and_synthetic_default_provenance(self):
        self.assertEqual(len(WATER), 13)
        self.assertEqual(len(SNOW_DEATHS), 578)
        self.assertEqual(PUMP_LABELS[BROAD_STREET], "Broad St")
        self.assertEqual(len(HABITAT), 600)
        self.assertTrue(np.array_equal(HABITAT, PG_POINTS))
        self.assertEqual(len(PG_REFERENCE_POINTS), 380)
        from export_scenes import PG_RANDOM_SEED, densify_pg_strokes
        self.assertEqual(PG_RANDOM_SEED, 32571)
        np.testing.assert_array_equal(PG_POINTS, densify_pg_strokes(PG_REFERENCE_POINTS))
        self.assertEqual(len(densify_pg_strokes(PG_REFERENCE_POINTS, 0)), 380)
        np.testing.assert_array_equal(PG_POINTS[:380], PG_REFERENCE_POINTS)
        # Added sites must lie in an actual stroke, not in either counter.
        from export_scenes import point_in_polygon
        g_outer, g_counter = PG_REFERENCE_POINTS[:147].tolist(), PG_REFERENCE_POINTS[147:176].tolist()
        p_outer, p_counter = PG_REFERENCE_POINTS[176:257].tolist(), PG_REFERENCE_POINTS[257:298].tolist()
        for x,y in PG_POINTS[380:]:
            self.assertGreaterEqual(np.min(np.hypot(PG_REFERENCE_POINTS[:298,0]-x,
                                                      PG_REFERENCE_POINTS[:298,1]-y)), .025-1e-12)
            self.assertTrue(
                (point_in_polygon(x,y,g_outer) and not point_in_polygon(x,y,g_counter)) or
                (point_in_polygon(x,y,p_outer) and not point_in_polygon(x,y,p_counter))
            )
            self.assertGreaterEqual(np.hypot(x-.595,y-.27),.047)
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
        self.assertEqual(len(alpha["presets"]["pg"]["points"]), 600)
        self.assertEqual(len(alpha["presets"]["smiley"]["points"]), 53)
        self.assertEqual(alpha["presets"]["pg"]["default_alpha_index"], 5)
        default = alpha["presets"]["pg"]["options"][str(ALPHAS[5])]
        self.assertEqual(default["topology"], {"components": 2, "holes": 2})
        self.assertEqual(alpha_topology(default["kept_triangles"]), default["topology"])
        # The wider range must actually produce a changing filtration,
        # independent of incidental small holes in a particular random draw.
        low = alpha["options"]["10"]
        high = alpha["options"]["44"]
        self.assertEqual(low["topology"]["components"], 1)
        self.assertGreater(len(low["kept_triangles"]), len(high["kept_triangles"]))
        self.assertTrue(any(
            alpha["options"][str(a)]["topology"] != default["topology"]
            for a in ALPHAS
        ))
        self.assertEqual(len(alpha["presets"]["pg"]["point_roles"]), 600)
        self.assertEqual(alpha["presets"]["pg"]["point_roles"].count("outline"), 298)
        self.assertEqual(alpha["presets"]["pg"]["point_roles"].count("stroke"), 302)
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
