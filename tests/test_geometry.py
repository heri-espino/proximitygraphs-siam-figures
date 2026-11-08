"""Mathematical checks against the installed ProximityGraphs version."""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from export_scenes import ALPHAS, ALPHA_PRESETS, SMILEY, PG, BETAS, BETA, WATER, HABITAT, SNOW_DEATHS, PUMP_LABELS, BROAD_STREET, build, cells, alpha_topology  # noqa: E402


class GeometryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.scenes = build()

    def test_historical_and_synthetic_default_provenance(self):
        self.assertEqual(len(WATER), 13)
        self.assertEqual(len(SNOW_DEATHS), 578)
        self.assertEqual(PUMP_LABELS[BROAD_STREET], "Broad St")
        self.assertEqual(len(HABITAT), 78)
        self.assertEqual(len(PG), 78)
        self.assertEqual(len(SMILEY), 53)
        self.assertEqual(len(BETA), 25)
        self.assertEqual(self.scenes["voronoi"]["labels"], PUMP_LABELS)
        self.assertEqual(len(self.scenes["voronoi"]["death_marks"]), 578)
        self.assertEqual(self.scenes["voronoi"]["historical"]["broad_street_index"], BROAD_STREET)
        self.assertTrue(np.all((WATER >= 0) & (WATER <= 1)))
        self.assertTrue(np.all((SNOW_DEATHS >= 0) & (SNOW_DEATHS <= 1)))

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

    def test_two_alpha_presets_and_two_pg_holes(self):
        alpha = self.scenes["alpha"]
        self.assertEqual(alpha["default_preset"], "pg")
        self.assertEqual(set(alpha["presets"]), {"pg", "smiley"})
        self.assertEqual(alpha["points"], alpha["presets"]["pg"]["points"])
        self.assertEqual(alpha["options"], alpha["presets"]["pg"]["options"])
        pg = alpha["presets"]["pg"]
        smiley = alpha["presets"]["smiley"]
        self.assertEqual(len(pg["points"]), 78)
        self.assertEqual(len(smiley["points"]), 53)
        self.assertEqual(pg["alpha_values"], list(ALPHAS))
        self.assertEqual(smiley["alpha_values"], list(ALPHA_PRESETS["smiley"]["alpha_values"]))
        self.assertEqual(pg["default_alpha_index"], 2)
        default = pg["options"]["11.8"]
        self.assertEqual(default["topology"], {"components": 1, "holes": 2})
        self.assertEqual(alpha_topology(pg["triangles"], 1/11.8), (1, 2))
        self.assertTrue(default["arcs"])
        # The two inner boundary loops must lie in distinct glyphs, not
        # merely give an Euler characteristic of two somewhere in the cloud.
        counts = {}
        for tri in default["kept_triangles"]:
            for u,v in ((tri[0],tri[1]),(tri[1],tri[2]),(tri[2],tri[0])):
                key = tuple(sorted((u,v)))
                counts[key] = counts.get(key,0)+1
        boundary = [edge for edge,n in counts.items() if n == 1]
        neighbors = {}
        for u,v in boundary:
            neighbors.setdefault(u,[]).append(v)
            neighbors.setdefault(v,[]).append(u)
        self.assertTrue(all(len(neigh)==2 for neigh in neighbors.values()))
        unseen = set(boundary)
        loops = []
        while unseen:
            u,v = next(iter(unseen))
            first = u
            path = [u]
            prev = -1
            cur = u
            for _ in range(len(boundary)+1):
                options = [q for q in neighbors[cur] if q!=prev
                           and tuple(sorted((cur,q))) in unseen]
                self.assertTrue(options, "Boundary loop unexpectedly open")
                nxt = options[0]
                unseen.remove(tuple(sorted((cur,nxt))))
                if nxt == first:
                    break
                path.append(nxt)
                prev,cur = cur,nxt
            else:
                self.fail("Boundary cycle exceeded edge count")
            loops.append(np.asarray(pg["points"])[path])
        self.assertEqual(len(loops),3)
        # Inner loops have the two smallest absolute polygonal areas.
        def area(loop):
            return abs(np.dot(loop[:,0],np.roll(loop[:,1],-1))
                       - np.dot(loop[:,1],np.roll(loop[:,0],-1)))/2
        interior = sorted(loops,key=area)[:2]
        centers = [loop.mean(axis=0) for loop in interior]
        self.assertTrue(any(c[0]<.50 and c[1]>.55 for c in centers),
                        "Missing counter inside P")
        self.assertTrue(any(c[0]>.55 and c[1]>.50 for c in centers),
                        "Missing counter inside g")
        for preset in (pg,smiley):
            for magnitude in preset["alpha_values"]:
                option = preset["options"][str(magnitude)]
                self.assertEqual(option["segments"], option["shape_edges"])
                self.assertEqual(tuple(option["topology"].values()),
                                 alpha_topology(preset["triangles"], 1/magnitude))

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
        self.assertEqual(len(BETA), 25)
        for earlier, later in zip(graphs, graphs[1:]):
            self.assertTrue(later <= earlier)


if __name__ == "__main__":
    unittest.main()
