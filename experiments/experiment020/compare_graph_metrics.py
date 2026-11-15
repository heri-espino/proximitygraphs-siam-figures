#!/usr/bin/env python3
"""Reproduce Figure 3 graph length and shortest-route detour comparison.

Requires Python 3 stdlib only and the scientific source scene JSON generated
by scripts/export_scenes.py. No stochastic sampling or arbitrary re-solving.
"""
from __future__ import annotations
import argparse
import heapq
import itertools
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCENE = ROOT / "site" / "data" / "scenes.json"

def all_shortest(start, adj):
    n = len(adj)
    dist = [float("inf")] * n
    dist[start] = 0.
    queue = [(0., start)]
    while queue:
        d, u = heapq.heappop(queue)
        if d > dist[u] + 1e-14:
            continue
        for v, w in adj[u]:
            new = d + w
            if new < dist[v] - 1e-14:
                dist[v] = new
                heapq.heappush(queue, (new, v))
    return dist

def summarize(points, edge_pairs):
    n = len(points)
    adj = [[] for _ in range(n)]
    length = 0.
    for i, j in edge_pairs:
        w = math.dist(points[i], points[j])
        if not (w > 0):
            raise ValueError("Coincident sites invalidate route-stretch ratio")
        adj[i].append((j, w))
        adj[j].append((i, w))
        length += w
    route = [all_shortest(u, adj) for u in range(n)]
    ratios = []
    for i, j in itertools.combinations(range(n), 2):
        d = route[i][j]
        if not math.isfinite(d):
            raise ValueError("Disconnected input: undefined network path")
        ratios.append(d / math.dist(points[i], points[j]))
    return {
        "edges": len(edge_pairs),
        "total_edge_length": length,
        "mean_route_stretch": sum(ratios) / len(ratios),
        "max_route_stretch": max(ratios),
        "connected_components": 1,
    }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="assert fixed-source numerical results")
    ap.add_argument("--save", type=Path,
                    help="write deterministic JSON summary")
    args = ap.parse_args()
    scene = json.loads(SCENE.read_text(encoding="utf-8"))["compare"]
    pts = scene["points"]
    result = {
        "point_count": len(pts),
        "pair_count": len(pts) * (len(pts) - 1) // 2,
        "graphs": {
            name: summarize(pts, scene["options"][name])
            for name in ("gabriel", "rng")
        }
    }
    if args.check:
        assert result["point_count"] == 25
        assert result["pair_count"] == 300
        assert result["graphs"]["gabriel"]["edges"] == 46
        assert result["graphs"]["rng"]["edges"] == 31
        for k, length, stretch in [
            ("gabriel", 7.873373853078, 1.100802911929),
            ("rng", 4.791049476152, 1.271160882413)
        ]:
            actual = result["graphs"][k]
            assert abs(actual["total_edge_length"] - length) < 1e-8
            assert abs(actual["mean_route_stretch"] - stretch) < 1e-8
    output = json.dumps(result, indent=2) + "\n"
    if args.save:
        args.save.parent.mkdir(parents=True, exist_ok=True)
        args.save.write_text(output, encoding="utf-8")
    print(output, end="")

if __name__ == "__main__":
    main()
