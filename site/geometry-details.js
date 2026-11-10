"use strict";

/**
 * Geometric construction witnesses for interactive explanations.
 *
 * The original scene data are computed by the pinned Python ProximityGraphs
 * library. All geometry after point edits is recomputed in this independent,
 * documented JavaScript implementation. Calculations use normalized planar
 * Euclidean coordinates, with open empty-region predicates.
 */

function allPointPairs(points) {
  const pairs=[];
  for(let i=0;i<points.length;i++)
    for(let j=i+1;j<points.length;j++)pairs.push([i,j]);
  return pairs;
}

function betaPairDetails(points,beta,i,j) {
  if(!(beta>=1) || i<0 || j<0 || i===j ||
     i>=points.length || j>=points.length)
    return null;
  const p=points[i], q=points[j], h=beta/2;
  const radius=h*dist(p,q);
  const c1=[h*p[0]+(1-h)*q[0],h*p[1]+(1-h)*q[1]];
  const c2=[h*q[0]+(1-h)*p[0],h*q[1]+(1-h)*p[1]];
  const blockers=[];
  for(let k=0;k<points.length;k++){
    if(k===i||k===j)continue;
    const d1=dist(points[k],c1),d2=dist(points[k],c2);
    // The Python Beta_Skeleton(...,closed=False,type_region="lune")
    // uses strictly interior disks, excluding the two endpoints.
    if(d1<radius-1e-12 && d2<radius-1e-12)
      blockers.push({index:k, distance1:d1, distance2:d2});
  }
  blockers.sort((a,b)=>Math.max(a.distance1,a.distance2)-
                        Math.max(b.distance1,b.distance2));
  return {
    pair:[Math.min(i,j),Math.max(i,j)],
    beta,radius,centers:[c1,c2],blockers,
    valid:blockers.length===0,
    distance:dist(p,q)
  };
}

function convexHullIndices(points) {
  if(points.length<2)return points.map((_,i)=>i);
  const order=points.map((_,i)=>i).sort((i,j)=>
    points[i][0]-points[j][0]||points[i][1]-points[j][1]);
  const cross=(i,j,k)=>(points[j][0]-points[i][0])*
    (points[k][1]-points[i][1])-
    (points[j][1]-points[i][1])*(points[k][0]-points[i][0]);
  const lower=[],upper=[];
  for(const i of order){
    while(lower.length>=2 &&
      cross(lower[lower.length-2],lower[lower.length-1],i)<=1e-12)
      lower.pop();
    lower.push(i);
  }
  for(const i of order.slice().reverse()){
    while(upper.length>=2 &&
      cross(upper[upper.length-2],upper[upper.length-1],i)<=1e-12)
      upper.pop();
    upper.push(i);
  }
  return lower.slice(0,-1).concat(upper.slice(0,-1));
}

/**
 * Independent positive-alpha witness: farthest-site Delaunay triangles.
 * Only convex-hull vertices can be farthest Voronoi sites. A triple
 * belongs to the farthest-site Delaunay complex when its circumcircle
 * encloses every hull vertex; the empty-*outside* predicate differs
 * from the ordinary empty-inside Delaunay used for negative alpha.
 * O(h^4), where h is the number of hull vertices, typically small.
 */
function furthestDelaunayTriangles(points) {
  const hull=convexHullIndices(points),result=[];
  for(let a=0;a<hull.length;a++)
    for(let b=a+1;b<hull.length;b++)
      for(let c=b+1;c<hull.length;c++){
        const ids=[hull[a],hull[b],hull[c]];
        const circle=circumcircle(...ids.map(i=>points[i]));
        if(!circle)continue;
        const r2=circle.r*circle.r,eps=1e-9*Math.max(1,r2);
        if(hull.every(i=>{
          const dx=points[i][0]-circle.center[0];
          const dy=points[i][1]-circle.center[1];
          return dx*dx+dy*dy<=r2+eps;
        }))result.push({vertices:ids,r:circle.r});
      }
  return result;
}

function alphaSimplices(points,alpha,triangles) {
  const all=triangles || (alpha>0?furthestDelaunayTriangles(points):
    delaunayTriangles(points));
  const radius=alpha===0?Infinity:1/Math.abs(alpha);
  const kept=all.filter(t=>Number.isFinite(t.r) && t.r<=radius+1e-12);
  const discarded=all.filter(t=>!Number.isFinite(t.r) || t.r>radius+1e-12);
  const counts=new Map(),pairs=new Map();
  for(const tri of kept){
    const [i,j,k]=tri.vertices;
    for(const [u,v] of [[i,j],[j,k],[k,i]]){
      const key=edgeKey(u,v);
      counts.set(key,(counts.get(key)||0)+1);
      pairs.set(key,[Math.min(u,v),Math.max(u,v)]);
    }
  }
  const boundary=Array.from(counts.keys())
    .filter(k=>counts.get(k)===1).map(k=>pairs.get(k))
    .sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  // ProximityGraphs treats alpha=0 with two sites as a single hull edge.
  if(alpha===0&&points.length===2)boundary.push([0,1]);
  return {radius,kept,discarded,boundary,total:all.length};
}

/**
 * First Betti number of the retained triangular complex. A hole is not just
 * an empty-looking white region: b1 = E - V - F + b0, where b0 counts
 * connected components. Isolated points are excluded consistently with the
 * Python exporter (only retained simplices contribute).
 */
function complexTopology(triangles){
  const vertices=new Set(),edges=new Map();
  for(const tri of triangles){
    if(tri.length!==3)continue;
    const [i,j,k]=tri;
    for(const v of [i,j,k])vertices.add(v);
    for(const [u,v] of [[i,j],[j,k],[k,i]])
      edges.set(edgeKey(u,v),[u,v]);
  }
  const adjacency=new Map();
  for(const v of vertices)adjacency.set(v,new Set());
  for(const [u,v] of edges.values()){
    adjacency.get(u).add(v);
    adjacency.get(v).add(u);
  }
  const remaining=new Set(vertices);
  let components=0;
  while(remaining.size){
    components++;
    const first=remaining.values().next().value;
    remaining.delete(first);
    const queue=[first];
    while(queue.length){
      const u=queue.pop();
      for(const v of adjacency.get(u)){
        if(remaining.has(v)){remaining.delete(v);queue.push(v);}
      }
    }
  }
  return {
    components,
    holes:edges.size-vertices.size-triangles.length+components
  };
}

function allAlphaCircles(arcs) {
  return arcs.map((arc,i)=>{
    const circle=arcCircle(arc);
    return circle && Number.isFinite(circle.r)?
      {index:i,center:circle.center,radius:circle.r}:null;
  }).filter(Boolean);
}

function bisectorClippedToUnitSquare(p,q) {
  // For normalized coordinates, ||x-p||² <= ||x-q||² is a half-plane.
  const n=[q[0]-p[0],q[1]-p[1]];
  const rhs=(q[0]*q[0]+q[1]*q[1]-p[0]*p[0]-p[1]*p[1])/2;
  const out=[];
  for(const x of [0,1])if(Math.abs(n[1])>1e-12){
    const y=(rhs-n[0]*x)/n[1];
    if(y>=-1e-10 && y<=1+1e-10)out.push([x,Math.max(0,Math.min(1,y))]);
  }
  for(const y of [0,1])if(Math.abs(n[0])>1e-12){
    const x=(rhs-n[1]*y)/n[0];
    if(x>=-1e-10 && x<=1+1e-10)out.push([Math.max(0,Math.min(1,x)),y]);
  }
  const unique=[];
  for(const pnt of out)if(!unique.some(a=>dist(a,pnt)<1e-9))unique.push(pnt);
  if(unique.length<2)return null;
  let best=[unique[0],unique[1]],length=0;
  for(let i=0;i<unique.length;i++)for(let j=i+1;j<unique.length;j++){
    const d=dist(unique[i],unique[j]);
    if(d>length){length=d;best=[unique[i],unique[j]];}
  }
  return best;
}

function findBlockedBetaPair(points,beta,reference=null) {
  const candidates=[];
  for(const [i,j] of allPointPairs(points)){
    const report=betaPairDetails(points,beta,i,j);
    if(report && !report.valid)
      candidates.push(report);
  }
  if(!candidates.length)return null;
  // A nearby blocked pair illustrates the predicate better than one spanning
  // the whole canvas. Prioritize modest distance and few blocking witnesses.
  candidates.sort((a,b)=>{
    const sa=a.distance+0.02*a.blockers.length;
    const sb=b.distance+0.02*b.blockers.length;
    return sa-sb;
  });
  if(reference){
    const key=edgeKey(reference[0],reference[1]);
    const next=candidates.find(x=>edgeKey(...x.pair)!==key);
    if(next)return next.pair;
  }
  return candidates[0].pair;
}

/**
 * Compare two graph rules on one fixed point cloud.  The optional arguments
 * are the actual per-panel controls; omitted arguments retain older defaults.
 * For alpha-hulls, return the boundary endpoint pairs here, while the view
 * renders their circular arcs using fallbackAlpha() rather than straight lines.
 * The signed alpha convention follows the rest of the laboratory.
 */
function compareGraphEdges(points, graph, beta=1.5, alpha=-4) {
  if(points.length<2)return [];
  if(graph==="delaunay"){
    return points.length===2?[[0,1]]:
      trianglesEdges(delaunayTriangles(points));
  }
  if(graph==="gabriel")return betaEdges(points,1);
  if(graph==="rng")return betaEdges(points,2);
  if(graph==="beta")return betaEdges(points,beta);
  if(graph==="alpha-shape" || graph==="alpha-hull")
    return alphaSimplices(points,alpha).boundary;
  return [];
}

if(typeof module!=="undefined" && module.exports){
  module.exports={allPointPairs,betaPairDetails,convexHullIndices,
    furthestDelaunayTriangles,alphaSimplices,
    complexTopology,allAlphaCircles,bisectorClippedToUnitSquare,
    findBlockedBetaPair,compareGraphEdges};
}
