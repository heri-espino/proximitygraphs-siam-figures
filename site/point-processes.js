"use strict";

/**
 * Independent browser samplers for the interactive SIAM demonstration.
 * All points are normalized into W = [0,1]^2, with reproducible 32-bit seeds.
 *
 * BPP: N=n fixed; conditionally iid uniform points on W.
 * HPPP: N~Poisson(lambda*|W|), conditionally iid uniform points on W.
 * The smiley extends the original 53 image-independent contour/feature sites.
 * No repulsion is imposed on either point process.
 */
const PROCESS_MAX_PARAMETER=600;
const PROCESS_DEFAULT_PARAMETER=120;
const SMILEY_DEFAULT_INTERIOR=120;
const SMILEY_DEFAULT_SEED=64017;
const PROCESS_DEFAULT_SEED=85273;

function seededUniform(seed) {
  let state=seed>>>0;
  return function() {
    state=(Math.imul(state,1664525)+1013904223)>>>0;
    return state/4294967296;
  };
}

function pointInsidePolygon(x,y,vertices) {
  let inside=false;
  for(let k=0;k<vertices.length;k++){
    const a=vertices[k],b=vertices[(k+1)%vertices.length];
    if((a[1]>y)!==(b[1]>y) &&
       x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])
      inside=!inside;
  }
  return inside;
}

function pointSegmentDistanceSquared(p,a,b) {
  const dx=b[0]-a[0],dy=b[1]-a[1],denom=dx*dx+dy*dy;
  const t=denom===0?0:Math.max(0,Math.min(1,
    ((p[0]-a[0])*dx+(p[1]-a[1])*dy)/denom));
  const x=p[0]-a[0]-t*dx,y=p[1]-a[1]-t*dy;
  return x*x+y*y;
}

function nearPolyline(p,vertices,margin,closed) {
  const count=closed?vertices.length:vertices.length-1;
  for(let i=0;i<count;i++)
    if(pointSegmentDistanceSquared(p,vertices[i],vertices[(i+1)%vertices.length])<
        margin*margin)return true;
  return false;
}

function smileyWithInteriorPoints(reference,count=SMILEY_DEFAULT_INTERIOR,
  seed=SMILEY_DEFAULT_SEED) {
  if(reference.length!==53)throw Error("Smiley source must have 53 points");
  const n=Math.max(0,Math.min(PROCESS_MAX_PARAMETER,Math.round(count)));
  const base=reference.map(p=>p.slice());
  const face=base.slice(0,30),leftEye=base.slice(30,36),
    rightEye=base.slice(36,42),mouth=base.slice(42,53);
  const random=seededUniform(seed),added=[];
  for(let i=0;i<160000&&added.length<n;i++){
    const p=[.12+.76*random(),.12+.78*random()];
    const [x,y]=p;
    if(!pointInsidePolygon(x,y,face) ||
       pointInsidePolygon(x,y,leftEye) ||
       pointInsidePolygon(x,y,rightEye))continue;
    // Keep the mouth, two eyes, and the face's perimeter legible.
    if(nearPolyline(p,face,.015,true) ||
       nearPolyline(p,leftEye,.020,true) ||
       nearPolyline(p,rightEye,.020,true) ||
       nearPolyline(p,mouth,.018,false))continue;
    if([...base,...added].some(q=>(x-q[0])**2+(y-q[1])**2<.010**2))continue;
    added.push(p);
  }
  if(added.length!==n)throw Error("Smiley interior point capacity exhausted");
  return [...base,...added];
}

function stochasticPointSet(kind,parameter=PROCESS_DEFAULT_PARAMETER,
  seed=PROCESS_DEFAULT_SEED) {
  if(kind!=="poisson"&&kind!=="binomial")throw Error("Unknown point-process type");
  const magnitude=Number(parameter);
  if(!Number.isInteger(magnitude)||magnitude<0||magnitude>PROCESS_MAX_PARAMETER)
    throw RangeError("Point-process parameter must be an integer from 0 to 600");
  const random=seededUniform(seed);
  let n=magnitude;
  if(kind==="poisson"){
    // Arrival times of a unit-rate Poisson process in intensity space:
    // independent increments -log(U) ~ Exponential(rate=1).
    n=0;
    let arrival=0;
    while(true){
      arrival+=-Math.log(Math.max(1-random(),Number.MIN_VALUE));
      if(arrival>magnitude)break;
      n++;
      // Safety guard for a numerically pathological realization; at
      // lambda<=600, P(N>1100) is negligible. Never silently cap the count.
      if(n>1100)throw Error("Poisson realization exceeds interactive safety limit");
    }
  }
  const points=[];
  for(let k=0;k<n;k++)points.push([random(),random()]);
  return points;
}

if(typeof module!=="undefined" && module.exports)
  module.exports={seededUniform,pointInsidePolygon,smileyWithInteriorPoints,
    stochasticPointSet,PROCESS_MAX_PARAMETER};
