"use strict";

// Browser preview is self-contained. When available, generated JSON from the
// authoritative ProximityGraphs Python pipeline replaces ALL graph results.
const NS = "http://www.w3.org/2000/svg";
const WIDTH = 640, HEIGHT = 600;
const frame = { x: 65, y: 43, w: 510, h: 510 };
const teal = "#34383c", orange = "#6d6c75", dark = "#30302e";
const alphaValues = [10, 14, 18, 22, 26, 28.57142857142857, 32, 38, 44]; // wider alpha filtration, default R=0.035
const smileyAlphaValues = [4, 8, 10, 12];
const betaValues = [1, 1.25, 1.5, 1.75, 2];
// Screenshot's requested interactive view; Python source exports remain unchanged.
const PG_VIEW_ALPHA = -48.65245;
const PG_VIEW_INTERIOR = 347;
const COMPARE_DEFAULT_PARAMETER = 25;
const COMPARE_DEFAULT_SEED = 90311;
const state = {
  waterSite:6, waterTriangleIndex:0,
  alphaPreset:"pg",alphaValue:PG_VIEW_ALPHA,alphaArc:0,
  pgInteriorCount:PG_VIEW_INTERIOR,pgSeed:32571,
  smileyInteriorCount:SMILEY_DEFAULT_INTERIOR,smileySeed:SMILEY_DEFAULT_SEED,
  processParameter:PROCESS_DEFAULT_PARAMETER,processSeed:PROCESS_DEFAULT_SEED,
  betaIndex:2,betaPair:null,betaInspectFirst:null,
  comparePointSet:"sensors",compareParameter:COMPARE_DEFAULT_PARAMETER,
  compareSeed:COMPARE_DEFAULT_SEED,comparePoints:null
};
let dataset = null;

// Fallback sites when the authoritative scene JSON cannot be fetched.
// The deployed site normally uses Python-generated historical data.
const snowPumpRaw=[
 [8.6512012,17.8915997],[10.9847803,18.5178509],
 [13.37819,17.3945408],[14.8798304,17.8099194],
 [8.694768,14.9054699],[8.8644161,12.75354],
 [12.5713596,11.72717],[10.6609697,7.428647],
 [13.5214596,7.95825],[16.4348907,9.2521296],
 [18.9143906,9.7378187],[16.0051098,5.0468378],
 [8.9994402,5.1010232]
];
const snowBounds={min:[8.280715,5.0468378],max:[18.9143906,18.5178509]};
const snowScale=.84/Math.max(...[0,1].map(i=>snowBounds.max[i]-snowBounds.min[i]));
const snowOffset=[0,1].map(i=>(1-snowScale*(snowBounds.max[i]-snowBounds.min[i]))/2);
const waterPoints=snowPumpRaw.map(p=>p.map((v,i)=>snowOffset[i]+(v-snowBounds.min[i])*snowScale));
const betaPoints=[
 [.12,.18],[.22,.16],[.32,.23],[.14,.36],[.28,.35],[.39,.30],
 [.12,.55],[.25,.51],[.36,.60],[.18,.78],[.32,.79],
 [.44,.43],[.49,.49],[.55,.56],
 [.61,.18],[.75,.15],[.87,.22],[.614,.334],[.74,.35],[.86,.40],
 [.62,.54],[.76,.56],[.89,.65],[.64,.78],[.79,.81]
];
const smileyPoints=(function(){
 const outline=Array.from({length:30},(_,i)=>{
   const t=2*Math.PI*i/30+.011;
   const r=.336+.006*Math.cos(5*t)+.003*Math.sin(7*t);
   return [.5+r*Math.cos(t),.52+r*Math.sin(t)];
 });
 const eyes=[];
 for(const side of ["left","right"])for(let i=0;i<6;i++){
   const t=2*Math.PI*i/6+.19+(side==="right"?.13:0);
   eyes.push(side==="left"?
     [.39+.030*Math.cos(t),.635+.023*Math.sin(t)]:
     [.61+.029*Math.cos(t),.635+.024*Math.sin(t)]);
 }
 const mouth=Array.from({length:11},(_,i)=>{
   const x=.327+(.673-.327)*i/10;
   return [x,.345+.081*((x-.5)/.173)**2+.001*Math.sin(73*x)];
 });
 return [...outline,...eyes,...mouth];
})();

// Augment the exact traced reference with deterministic ink-interior samples.
// The 380 original sites, including 298 boundary sites, remain unchanged.
function insidePgPolygon(x,y,vertices){
  let inside=false;
  for(let k=0;k<vertices.length;k++){
    const a=vertices[k],b=vertices[(k+1)%vertices.length];
    if((a[1]>y)!==(b[1]>y) &&
       x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
const PG_DEFAULT_INTERIOR = 302;
const PG_MAX_INTERIOR = 600;
const PG_RANDOM_SEED = 32571;

function pgWordmarkPoints(interiorCount=PG_DEFAULT_INTERIOR, seed=PG_RANDOM_SEED){
  // Mirrors Python's densify_pg_strokes() for the 600-site reference state.
  // Varying the density never changes the 298 authentic source contours.
  const target=Math.max(0,Math.min(PG_MAX_INTERIOR,Math.round(interiorCount)));
  const base=rasterPgPoints.map(p=>p.slice());
  // Keep original ink sites at the reference seed. Any reshuffle generates
  // a fresh set even when the requested density is below 82.
  const originalInterior=(seed>>>0)===PG_RANDOM_SEED?Math.min(82,target):0;
  const chosen=base.slice(0,298+originalInterior);
  if(target===originalInterior)return chosen;
  const [gOuter,gHole,pOuter,pHole]=[
    base.slice(0,147),base.slice(147,176),
    base.slice(176,257),base.slice(257,298)
  ];
  let rng=seed>>>0;
  function randomFraction(){
    rng=(Math.imul(1664525,rng)+1013904223)>>>0;
    return rng/4294967296;
  }
  const extra=[],wanted=target-originalInterior;
  // Samples are uniformly pseudorandom in the proposal rectangle,
  // accepted only within glyph ink (not the two empty counters).
  for(let k=0;k<150000&&extra.length<wanted;k++){
    const x=.07+.86*randomFraction(),y=.16+.69*randomFraction();
    const ink=(insidePgPolygon(x,y,gOuter)&&!insidePgPolygon(x,y,gHole))||
      (insidePgPolygon(x,y,pOuter)&&!insidePgPolygon(x,y,pHole));
    if(!ink||Math.hypot(x-.595,y-.27)<.047)continue;
    if(base.slice(0,298).some(p=>(p[0]-x)**2+(p[1]-y)**2<.025**2))continue;
    if([...base,...extra].some(p=>(p[0]-x)**2+(p[1]-y)**2<.008**2))continue;
    extra.push([x,y]);
  }
  if(extra.length!==wanted)throw Error("Requested Pg interior density could not be sampled");
  return [...chosen,...extra];
}

const habitatPoints=pgWordmarkPoints();

function currentAlphaSource(){
  const alpha=dataset?.alpha;
  if(!alpha || !["pg","smiley"].includes(state.alphaPreset))return null;
  return alpha.presets?.[state.alphaPreset] ||
    (state.alphaPreset==="pg"?alpha:null);
}

function presetPointSet(){
  if(state.alphaPreset==="pg"){
    const source=currentAlphaSource();
    const clean=state.pgInteriorCount===PG_DEFAULT_INTERIOR &&
      state.pgSeed===PG_RANDOM_SEED;
    return clean?(source?.points||habitatPoints.map(p=>p.slice())):
      pgWordmarkPoints(state.pgInteriorCount,state.pgSeed);
  }
  if(state.alphaPreset==="smiley")
    return smileyWithInteriorPoints(currentAlphaSource()?.points||smileyPoints,
      state.smileyInteriorCount,state.smileySeed);
  return stochasticPointSet(state.alphaPreset,state.processParameter,
    state.processSeed);
}

function syncPgDensityControls(){
  const pg=state.alphaPreset==="pg",smiley=state.alphaPreset==="smiley";
  const pgPanel=document.getElementById("pg-density-controls");
  if(!pgPanel)return;
  pgPanel.hidden=!pg;
  document.getElementById("smiley-density-controls").hidden=!smiley;
  document.getElementById("process-controls").hidden=pg||smiley;
  document.getElementById("pg-interior-slider").value=String(state.pgInteriorCount);
  detail("pg-interior-count",String(state.pgInteriorCount));
  document.getElementById("smiley-interior-slider").value=
    String(state.smileyInteriorCount);
  detail("smiley-interior-count",String(state.smileyInteriorCount));
  document.getElementById("process-slider").value=String(state.processParameter);
  const poisson=state.alphaPreset==="poisson";
  detail("process-parameter-title",poisson?"Expected number of points (λ)":
    "Number of points (n)");
  detail("process-parameter-count",String(state.processParameter));
  detail("process-definition",poisson?
    "The number of points varies randomly, with mean λ.":
    "Exactly n points are placed independently across the square.");
}

function replaceHabitatRealization(){
  const points=presetPointSet();
  const source=currentAlphaSource();
  const authoritative=(state.alphaPreset==="pg" &&
    state.pgInteriorCount===PG_DEFAULT_INTERIOR &&
    state.pgSeed===PG_RANDOM_SEED) ||
    (state.alphaPreset==="smiley" && state.smileyInteriorCount===0);
  const editor=pointEditors.habitat;
  if(editor){
    // The generated realization becomes a resettable baseline for Move/Add/
    // Delete. A new realization always invalidates cached Python geometry.
    editor.original=points.map(p=>p.slice());
    editor.points=points.map(p=>p.slice());
    editor.active=null;editor.pending=false;
    editor.dirty=!authoritative;
    editor.generation=(editor.generation||0)+1;
    recomputeNotice("habitat");
  }
  state.alphaArc=0;
  syncPgDensityControls();
  if(state.alphaPreset==="poisson"||state.alphaPreset==="binomial")
    detail("process-realized","Points in this sample: "+points.length);
  drawHabitat();
}

function setPgInteriorCount(count,seed=state.pgSeed){
  if(state.alphaPreset!=="pg")return;
  state.pgInteriorCount=Math.max(0,Math.min(PG_MAX_INTERIOR,Math.round(count)));
  state.pgSeed=seed>>>0;
  replaceHabitatRealization();
}

function setSmileyInteriorCount(count,seed=state.smileySeed){
  if(state.alphaPreset!=="smiley")return;
  state.smileyInteriorCount=Math.max(0,Math.min(PROCESS_MAX_PARAMETER,Math.round(count)));
  state.smileySeed=seed>>>0;
  replaceHabitatRealization();
}

function setProcessParameter(count,seed=state.processSeed){
  if(state.alphaPreset!=="poisson"&&state.alphaPreset!=="binomial")return;
  state.processParameter=Math.max(0,Math.min(PROCESS_MAX_PARAMETER,Math.round(count)));
  state.processSeed=seed>>>0;
  replaceHabitatRealization();
}

function resetHabitatPointSet(){
  if(state.alphaPreset==="pg"){
    state.pgInteriorCount=PG_VIEW_INTERIOR;
    state.pgSeed=PG_RANDOM_SEED;
  }else if(state.alphaPreset==="smiley"){
    state.smileyInteriorCount=SMILEY_DEFAULT_INTERIOR;
    state.smileySeed=SMILEY_DEFAULT_SEED;
  }else{
    state.processParameter=PROCESS_DEFAULT_PARAMETER;
    state.processSeed=PROCESS_DEFAULT_SEED;
  }
  // Resetting sites does not change the user's selected alpha value.
  replaceHabitatRealization();
}

function switchAlphaPreset(key){
  if(!["pg","smiley","poisson","binomial"].includes(key))return;
  state.alphaPreset=key;
  state.alphaValue=key==="pg"?PG_VIEW_ALPHA:
    key==="smiley"?-8:-10;
  document.getElementById("alpha-slider").value=String(state.alphaValue);
  resetHabitatPointSet();
}


function el(tag, attrs, parent, label) {
  const item = document.createElementNS(NS, tag);
  Object.entries(attrs || {}).forEach(function(entry){ item.setAttribute(entry[0], String(entry[1])); });
  if (label != null) item.textContent = label;
  if (parent) parent.appendChild(item);
  return item;
}
function sx(x) { return frame.x + x*frame.w; }
function sy(y) { return frame.y + (1-y)*frame.h; }
function xy(p) { return [sx(p[0]), sy(p[1])]; }
function pointsAttr(ps) { return ps.map(function(p) { const v=xy(p); return v[0].toFixed(2)+","+v[1].toFixed(2); }).join(" "); }
function dist(a,b) { return Math.hypot(a[0]-b[0],a[1]-b[1]); }
function edgeKey(i,j) {return Math.min(i,j)+":"+Math.max(i,j);}
function background(svg, tag) {
  svg.replaceChildren();
  el("rect", {width:WIDTH,height:HEIGHT,fill:"#fdfcfa"},svg);
  for (let k=0;k<=10;k++) {
    const x=frame.x+frame.w*k/10, y=frame.y+frame.h*k/10;
    el("line",{x1:x,y1:frame.y,x2:x,y2:frame.y+frame.h,stroke:"#f1f0ed","stroke-width":1},svg);
    el("line",{x1:frame.x,y1:y,x2:frame.x+frame.w,y2:y,stroke:"#f1f0ed","stroke-width":1},svg);
  }
  el("rect",{x:frame.x,y:frame.y,width:frame.w,height:frame.h,fill:"none",stroke:"#dddcd8","stroke-width":1.5},svg);
  el("text",{x:frame.x,y:28,fill:"#76736e","font-size":12,"letter-spacing":1},svg,tag.toUpperCase());
  const historic=tag.startsWith("01") && dataset?.voronoi?.historical;
  el("text",{x:frame.x,y:HEIGHT-18,fill:"#76736e","font-size":11},svg,
    historic?"Soho, London · 1854 map locations":
    "Illustrative point set · Euclidean distance");
}
function site(svg,p,i,selected,handler,displayName,pointRole) {
  const v=xy(p);
  const imageSite=pointRole==="outline"||pointRole==="stroke";
  const contour=pointRole==="outline";
  const radius=imageSite?(contour?3.2:2.4):(selected?8:6.2);
  const fill=imageSite?(contour?"#30302e":"#696763"):(selected?orange:teal);
  const opacity=imageSite?(contour?.98:(.52+.26*((i*37)%13)/12)):1;
  const c=el("circle",{cx:v[0],cy:v[1],r:radius,fill,opacity,
    stroke:imageSite?"none":"#fff","stroke-width":imageSite?0:2.4,
    class:"selectable editable-site",role:"button",tabindex:0,
    "data-point-index":i,"aria-label":"Select or drag site "+(i+1)},svg);
  el("title",{},c,(displayName||"Site "+(i+1))+" · select to inspect");
  // A larger transparent hit area keeps small scientific markers usable on touch screens.
  const hit=el("circle",{cx:v[0],cy:v[1],r:imageSite?9:18,fill:"transparent",
    class:"selectable editable-site",role:"button",tabindex:0,
    "data-point-index":i,"aria-label":"Site "+(i+1)+"; drag to move or use arrow keys"},svg);
  el("title",{},hit,(displayName||"Site "+(i+1))+" · drag or use edit controls");
  if(handler){
    for(const target of [c,hit]){
      target.addEventListener("click",function(){handler(i);});
      target.addEventListener("keydown",function(e){
        if(e.key==="Enter" || e.key===" "){e.preventDefault();handler(i);}
      });
    }
  }
  return c;
}
function segment(svg,a,b,color,width,opacity) {
  const p=xy(a),q=xy(b);
  return el("line",{x1:p[0],y1:p[1],x2:q[0],y2:q[1],stroke:color||teal,"stroke-width":width||2,"stroke-opacity":opacity==null?1:opacity,"stroke-linecap":"round"},svg);
}
function dot(a,b){return a[0]*b[0]+a[1]*b[1];}
function clipCell(poly,normal,rhs){
  const out=[];
  for(let k=0;k<poly.length;k++){
    const a=poly[k],b=poly[(k+1)%poly.length];
    const da=dot(a,normal)-rhs,db=dot(b,normal)-rhs;
    if(da<=1e-10)out.push(a);
    if((da<0&&db>0)||(da>0&&db<0)){
      const t=da/(da-db);
      out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
    }
  }
  return out;
}
function cells(points){
  return points.map(function(p,i){
    let poly=[[0,0],[1,0],[1,1],[0,1]];
    points.forEach(function(q,j){if(i!==j && poly.length){
      poly=clipCell(poly,[2*(q[0]-p[0]),2*(q[1]-p[1])],
        q[0]*q[0]+q[1]*q[1]-p[0]*p[0]-p[1]*p[1]);
    }});
    return poly;
  });
}
function circumcircle(a,b,c){
  const d=2*(a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]));
  if(Math.abs(d)<1e-10)return null;
  const aa=a[0]*a[0]+a[1]*a[1],bb=b[0]*b[0]+b[1]*b[1],cc=c[0]*c[0]+c[1]*c[1];
  const ux=(aa*(b[1]-c[1])+bb*(c[1]-a[1])+cc*(a[1]-b[1]))/d;
  const uy=(aa*(c[0]-b[0])+bb*(a[0]-c[0])+cc*(b[0]-a[0]))/d;
  const center=[ux,uy];return {center:center,r:dist(a,center)};
}
function delaunayTriangles(points){
  return triangulate(points);
}
function trianglesEdges(tris){
  const seen=new Map();
  tris.forEach(function(t){
    [[0,1],[1,2],[2,0]].forEach(function(ab){
      const i=t.vertices[ab[0]],j=t.vertices[ab[1]];
      seen.set(edgeKey(i,j),[Math.min(i,j),Math.max(i,j)]);
    });
  });
  return Array.from(seen.values());
}
function betaEdges(points,beta){
  const result=[];
  for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
    const p=points[i],q=points[j],h=beta/2,r=h*dist(p,q);
    const c1=[h*p[0]+(1-h)*q[0],h*p[1]+(1-h)*q[1]];
    const c2=[h*q[0]+(1-h)*p[0],h*q[1]+(1-h)*p[1]];
    if(points.every(function(s,k){return k===i||k===j||!(dist(s,c1)<r-1e-12&&dist(s,c2)<r-1e-12);}))
      result.push([i,j]);
  }
  return result;
}
function signedArea(pts){
  return pts.reduce(function(s,p,i){const q=pts[(i+1)%pts.length];return s+p[0]*q[1]-p[1]*q[0];},0)/2;
}
function curveBetween(p,q,r,orientation,alpha){
  const d=dist(p,q);if(d>2*r||d===0)return [p,q];
  const m=[(p[0]+q[0])/2,(p[1]+q[1])/2];
  const h=Math.sqrt(Math.max(0,r*r-d*d/4));
  const normal=[-(q[1]-p[1])/d,(q[0]-p[0])/d];
  // Pinned library: negative alpha chooses exterior circle centers;
  // positive alpha chooses interior centers based on boundary orientation.
  const side=(orientation>0?1:-1)*(alpha>0?1:-1);
  const c=[m[0]+side*h*normal[0],m[1]+side*h*normal[1]];
  const a=Math.atan2(p[1]-c[1],p[0]-c[0]);
  let delta=Math.atan2(q[1]-c[1],q[0]-c[0])-a;
  while(delta>Math.PI)delta-=2*Math.PI;
  while(delta< -Math.PI)delta+=2*Math.PI;
  return Array.from({length:32},(_,k)=>{
    const t=a+delta*k/31;
    return [c[0]+r*Math.cos(t),c[1]+r*Math.sin(t)];
  });
}
function fallbackAlpha(points,alpha,triangles){
  const filtered=alphaSimplices(points,alpha,triangles);
  const boundaries=filtered.boundary;
  // The exact alpha=0 limit is the convex hull with straight edges,
  // not a circle of infinite radius.
  if(alpha===0||!boundaries.length)return {arcs:[],segments:boundaries};
  const neighbors=new Map();
  for(const [i,j] of boundaries){
    if(!neighbors.has(i))neighbors.set(i,[]);
    if(!neighbors.has(j))neighbors.set(j,[]);
    neighbors.get(i).push(j);neighbors.get(j).push(i);
  }
  const visited=new Set(),arcs=[];
  for(const edge of boundaries){
    if(visited.has(edgeKey(edge[0],edge[1])))continue;
    const cycle=[edge[0]],start=edge[0];
    let previous=-1,current=start;
    for(let tries=0;tries<=boundaries.length+1;tries++){
      const next=(neighbors.get(current)||[]).find(q=>
        q!==previous&&!visited.has(edgeKey(current,q)));
      if(next==null)break;
      visited.add(edgeKey(current,next));previous=current;current=next;
      if(current===start)break;
      cycle.push(current);
    }
    if(cycle.length<3||current!==start)continue;
    const area=signedArea(cycle.map(i=>points[i]));
    for(let k=0;k<cycle.length;k++){
      const i=cycle[k],j=cycle[(k+1)%cycle.length];
      arcs.push(curveBetween(points[i],points[j],1/Math.abs(alpha),area,alpha));
    }
  }
  return {arcs,segments:boundaries};
}
function arcCircle(arc){
  if(!arc||arc.length<3)return null;
  return circumcircle(arc[0],arc[Math.floor(arc.length/2)],arc[arc.length-1]);
}

function hasLayer(id) {
  const control=document.getElementById(id);
  return !!control && !!control.checked;
}
function detail(id,value) {
  const node=document.getElementById(id);
  if(node)node.textContent=value;
}
function circleOverlay(svg,center,radius,color,width,dashed,filled,parent) {
  const v=xy(center);
  return el("circle",{cx:v[0],cy:v[1],r:radius*frame.w,
    fill:filled || "none",stroke:color,"stroke-width":width||1.5,
    "stroke-dasharray":dashed?"7 5":"none"},parent||svg);
}
function squareClip(svg,id) {
  const defs=el("defs",{},svg),clip=el("clipPath",{id:id},defs);
  el("rect",{x:frame.x,y:frame.y,width:frame.w,height:frame.h},clip);
  return el("g",{"clip-path":"url(#"+id+")"},svg);
}
function clickLine(svg,p,q,color,width,label,onClick) {
  const a=xy(p),b=xy(q);
  const node=el("line",{x1:a[0],y1:a[1],x2:b[0],y2:b[1],
    stroke:color,"stroke-width":width||3,"stroke-linecap":"round",
    class:"selectable",role:"button",tabindex:0,"aria-label":label},svg);
  el("title",{},node,label);
  node.addEventListener("click",onClick);
  node.addEventListener("keydown",function(e){
    if(e.key==="Enter"||e.key===" "){e.preventDefault();onClick();}
  });
  return node;
}
function drawWater(){
  const svg=document.getElementById("water-plot"),source=dataset&&dataset.voronoi;
  const points=editablePoints("water",source?source.points:waterPoints);
  const original=source&&!edited("water");
  const polygons=original?source.cells:cells(points);
  const tri=original&&source.triangles?source.triangles:delaunayTriangles(points);
  const edges=original?source.delaunay:
    (points.length===2?[[0,1]]:trianglesEdges(tri));
  if(points.length)state.waterSite=Math.max(0,Math.min(state.waterSite,points.length-1));
  background(svg,"01 / nearest-site regions and Delaunay edges");
  if(hasLayer("water-cells")){
    const palette=["#f0eeeb","#eeeae7","#ecebe6","#ece9e4","#efeeec",
      "#f1eeeb","#ebe9e5","#ecebed","#f1e9e8","#edece9","#eeedef","#efebe6"];
    for(let i=0;i<polygons.length;i++)if(polygons[i].length>=3)
      el("polygon",{points:pointsAttr(polygons[i]),
        fill:i===state.waterSite?"#e5e3de":palette[i%palette.length],
        "fill-opacity":i===state.waterSite?.94:.78,
        stroke:"#fff","stroke-width":1.7},svg);
  }
  // Historical death marks remain separate from the 13 editable pump sites.
  if(hasLayer("water-deaths")&&source?.death_marks){
    const layer=el("g",{"pointer-events":"none","aria-hidden":"true"},svg);
    for(const p of source.death_marks){
      const v=xy(p);
      el("circle",{cx:v[0],cy:v[1],r:2.45,
        fill:"#967b79","fill-opacity":.36},layer);
    }
  }
  if(hasLayer("water-triangles")){
    for(const t of tri){
      const p=t.vertices.map(i=>points[i]);
      if(p.some(x=>!x))continue;
      el("polygon",{points:pointsAttr(p),fill:"#d7d5ce","fill-opacity":.12,
        stroke:"#c1beb9","stroke-width":1.1,"stroke-dasharray":"4 4"},svg);
    }
  }
  if(hasLayer("water-bisectors")&&points.length){
    const selected=points[state.waterSite];
    for(let i=0;i<points.length;i++){
      if(i===state.waterSite)continue;
      const bis=bisectorClippedToUnitSquare(selected,points[i]);
      if(bis){
        const line=segment(svg,bis[0],bis[1],"#a6a8af",1.4,.68);
        line.setAttribute("stroke-dasharray","7 5");
      }
    }
  }
  if(hasLayer("water-dual"))
    for(const [i,j] of edges)segment(svg,points[i],points[j],"#767475",2.25,.8);
  const selectedTriangles=tri.filter(t=>t.vertices.includes(state.waterSite));
  const chosen=selectedTriangles.length?
    selectedTriangles[state.waterTriangleIndex%selectedTriangles.length]:null;
  if(chosen&&hasLayer("water-circumcircle")){
    const pts=chosen.vertices.map(i=>points[i]);
    const cc=circumcircle(...pts);
    if(cc){
      const clipped=squareClip(svg,"water-circle-square");
      circleOverlay(svg,cc.center,cc.r,"#6e6972",2,true,"#aaa3ad14",clipped);
      const center=xy(cc.center);
      el("circle",{cx:center[0],cy:center[1],r:4,fill:"#6f6b6b"},svg);
      for(const index of chosen.vertices){
        const p=xy(points[index]);
        el("circle",{cx:p[0],cy:p[1],r:11,fill:"none",stroke:"#868088","stroke-width":2.3},svg);
      }
    }
  }
  points.forEach(function(p,i){
    site(svg,p,i,i===state.waterSite,function(index){
      state.waterSite=index;state.waterTriangleIndex=0;drawWater();
    },original?source.labels?.[i]:null);
  });
  if(original&&points[state.waterSite]&&hasLayer("water-pump-label")){
    const v=xy(points[state.waterSite]);
    el("text",{x:v[0]+11,y:v[1]-12,fill:"#5c5750",
      "font-size":12,"font-weight":750,"paint-order":"stroke",
      stroke:"#fdfcfa","stroke-width":4,
      "pointer-events":"none"},svg,source.labels?.[state.waterSite]||"Pump");
  }
  detail("water-stat",points.length+(original?" pumps":" sites")+
    " · "+edges.length+" Delaunay edges"+
    (source?.death_marks?" · "+source.death_marks.length+" death marks":""));
  if(points.length){
    const degree=edges.filter(e=>e.includes(state.waterSite)).length;
    const p=points[state.waterSite];
    const cc=chosen?circumcircle(...chosen.vertices.map(i=>points[i])):null;
    detail("water-details",(original?"Pump ":"Site ")+(state.waterSite+1)+
      (original && source.labels?.[state.waterSite]?
        " · "+source.labels[state.waterSite]:"")+
      " at ("+p[0].toFixed(3)+", "+p[1].toFixed(3)+"). "+
      degree+" Delaunay neighbors; "+polygons[state.waterSite].length+
      " corners in its visible Voronoi region."+
      (chosen&&cc?" Triangle "+chosen.vertices.map(i=>i+1).join("–")+
        " has circumradius "+cc.r.toFixed(3)+".":""));
    detail("water-note","The Voronoi region contains the locations closest to the selected site. "+
      "Delaunay triangles have empty circumcircles. Cholera death marks provide historical context, not graph vertices.");
  } else {
    detail("water-details","No sites are shown. Choose Add to place a point.");
    detail("water-note","A graph edge needs at least two sites.");
  }
}
function drawHabitat(){
  const svg=document.getElementById("habitat-plot"),source=currentAlphaSource();
  const points=pointEditors.habitat?
    pointEditors.habitat.points:presetPointSet();
  const alpha=state.alphaValue;
  // Use original Python constructions *only* for the exact precomputed
  // negative-alpha parameter and the unmodified matching reference set.
  const sourceShape=alpha<0?source?.options?.[String(-alpha)]:null;
  const original=!!sourceShape&&!edited("habitat");
  const triangles=alpha>0?furthestDelaunayTriangles(points):
    (source&&!edited("habitat")&&source.triangles?
      source.triangles:delaunayTriangles(points));
  const filtered=alphaSimplices(points,alpha,triangles);
  const shape=original?sourceShape:fallbackAlpha(points,alpha,triangles);
  const arcs=shape?.arcs||[];
  const boundary=original&&shape.shape_edges?shape.shape_edges:filtered.boundary;
  const kept=original&&shape.kept_triangles?
    shape.kept_triangles:filtered.kept.map(t=>t.vertices);
  const radius=alpha===0?Infinity:1/Math.abs(alpha);
  const alphaText=Number.isInteger(alpha)?String(alpha):
    String(Number(alpha.toFixed(5)));
  const radiusText=Number.isFinite(radius)?radius.toFixed(3):"∞";
  background(svg,"02 / straight and curved boundaries");
  detail("alpha-value","α = "+alphaText+" · R = "+radiusText);
  detail("alpha-preset-title",({
    pg:"Pg letterform",
    smiley:"Smiling face",
    poisson:"Poisson point pattern",
    binomial:"Binomial point pattern"
  })[state.alphaPreset]);
  const provenance=document.getElementById("habitat-edit-source");
  if(provenance){
    provenance.textContent=({
      pg:"Letterform point set · outlines remain fixed when generating points.",
      smiley:"Smiling face · facial features remain fixed when generating points.",
      poisson:"Poisson point pattern · the point count varies between samples.",
      binomial:"Binomial point pattern · the point count stays fixed."
    })[state.alphaPreset];
  }
  if(hasLayer("alpha-triangulation")){
    for(const t of triangles){
      const poly=t.vertices.map(i=>points[i]);
      if(poly.some(x=>!x))continue;
      el("polygon",{points:pointsAttr(poly),fill:"none",
        stroke:"#cfcdc9","stroke-width":1.05,"stroke-dasharray":"3 3",
        "stroke-opacity":.65},svg);
    }
  }
  if(hasLayer("alpha-kept")){
    for(const indices of kept){
      const poly=indices.map(i=>points[i]);
      if(poly.some(x=>!x))continue;
      el("polygon",{points:pointsAttr(poly),
        fill:"#a6a39f","fill-opacity":.24,stroke:"#aaa7a2",
        "stroke-width":.9,"stroke-opacity":.55},svg);
    }
  }
  const circles=allAlphaCircles(arcs);
  if(arcs.length && state.alphaArc>=arcs.length)state.alphaArc=0;
  const chosenCircle=circles.find(c=>c.index===state.alphaArc);
  const clipped=squareClip(svg,"alpha-circles-square");
  if(hasLayer("alpha-all-circles")){
    for(const c of circles)circleOverlay(svg,c.center,c.radius,"#cccac3",1.25,true,"none",clipped)
      .setAttribute("stroke-opacity",.45);
  }
  if(hasLayer("alpha-circle")&&chosenCircle){
    const c=chosenCircle;
    circleOverlay(svg,c.center,c.radius,"#73717c",2.4,true,"none",clipped);
  }
  if(hasLayer("alpha-centers")){
    for(const c of circles){
      const v=xy(c.center);
      el("circle",{cx:v[0],cy:v[1],r:c.index===state.alphaArc?5:3,
        fill:c.index===state.alphaArc?"#77727a":"#91959a","fill-opacity":.9},clipped);
    }
  }
  if(hasLayer("alpha-shape")){
    for(const [i,j] of boundary){
      const line=segment(svg,points[i],points[j],"#656777",3,.85);
      line.setAttribute("stroke-dasharray","5 4");
    }
  }
  if(hasLayer("alpha-hull")){
    if(alpha===0)for(const [i,j] of boundary)
      segment(svg,points[i],points[j],"#7f7b84",2.8,.9);
    arcs.forEach(function(arc,index){
      const selected=index===state.alphaArc;
      const line=el("polyline",{points:pointsAttr(arc),fill:"none",
        stroke:selected?"#5d5c64":"#7f7b84",
        "stroke-width":selected?4.2:2.8,"stroke-linecap":"round",
        class:"selectable",role:"button",tabindex:0,
        "aria-label":"Inspect circular alpha-hull arc "+(index+1)},svg);
      const select=function(){state.alphaArc=index;drawHabitat();};
      line.addEventListener("click",select);
      line.addEventListener("keydown",function(e){
        if(e.key==="Enter"||e.key===" "){e.preventDefault();select();}
      });
      el("title",{},line,"Arc "+(index+1)+" · click for its circle");
    });
  }
  const roles=state.alphaPreset==="pg"?
    points.map((_,i)=>i<298?"outline":"stroke"):
    state.alphaPreset==="smiley"?
      points.map((_,i)=>i<53?"outline":"stroke"):null;
  points.forEach(function(p,i){
    site(svg,p,i,false,undefined,undefined,roles?roles[i]:undefined);
  });
  const topology=original&&shape.topology?shape.topology:
    complexTopology(filtered.kept.map(t=>t.vertices));
  detail("habitat-stat",points.length+" sites · "+boundary.length+
    " shape edges · "+topology.holes+" hole"+(topology.holes===1?"":"s")+
    " · "+arcs.length+" arcs");
  const c=chosenCircle;
  const family=({
    pg:"Pg",smiley:"Smiley",poisson:"Poisson",binomial:"Binomial"
  })[state.alphaPreset];
  detail("habitat-details",family+" · α = "+alphaText+". "+
    (alpha===0?"The boundary is the convex hull.":
      "The radius cutoff is R = "+radiusText+" ("+
      (alpha>0?"furthest-site":"ordinary")+" Delaunay).")+
    " "+kept.length+" of "+triangles.length+" triangles pass the test. "+
    topology.components+" connected region"+(topology.components===1?"":"s")+
    ", "+topology.holes+" hole"+(topology.holes===1?"":"s")+
    " and "+boundary.length+" boundary edges."+
    (c?" Arc "+(state.alphaArc+1)+" is centered at ("+
      c.center[0].toFixed(3)+", "+c.center[1].toFixed(3)+").":""));
  detail("habitat-note",alpha===0?
    "At α = 0, the boundary is the convex hull. It consists of straight edges, with no finite supporting circles.":
    "A triangle passes when its circumradius is at most R. Negative α uses ordinary Delaunay; positive α uses furthest-site Delaunay.");
}
function selectBetaPair(pair) {
  state.betaPair=pair?pair.slice():null;
  state.betaInspectFirst=null;
  drawSensors();
}
function inspectBetaPoint(index){
  const n=editablePoints("sensors",dataset?.beta?.points||betaPoints).length;
  if(index<0||index>=n)return;
  if(state.betaInspectFirst===null){
    state.betaInspectFirst=index;
    detail("sensors-note","Sensor "+(index+1)+" selected. Choose a second sensor to test the connection.");
    drawSensors();
    return;
  }
  if(state.betaInspectFirst===index){
    detail("sensors-note","Choose a different sensor to complete the pair.");
    return;
  }
  const pair=[Math.min(state.betaInspectFirst,index),Math.max(state.betaInspectFirst,index)];
  selectBetaPair(pair);
}
function drawSensors(){
  const svg=document.getElementById("sensors-plot"),source=dataset&&dataset.beta;
  const points=editablePoints("sensors",source?source.points:betaPoints);
  const beta=betaValues[state.betaIndex];
  const edges=source&&!edited("sensors")?source.options[String(beta)]:betaEdges(points,beta);
  const validKeys=new Set(edges.map(e=>edgeKey(...e)));
  background(svg,"03 / geometric connections and blockers");
  detail("beta-value","β = "+beta);
  if(!state.betaPair || state.betaPair[1]>=points.length ||
     state.betaPair[0]===state.betaPair[1]){
    state.betaPair=edges.length?edges[Math.floor(edges.length/2)].slice():
      (points.length>=2?[0,1]:null);
  }
  const pair=state.betaPair,report=pair?betaPairDetails(points,beta,...pair):null;
  if(report && hasLayer("beta-lune")){
    const group=squareClip(svg,"beta-pair-square");
    const a=xy(report.centers[0]),b=xy(report.centers[1]);
    const defs=el("defs",{},svg),cp=el("clipPath",{id:"beta-lune-mask"},defs);
    el("circle",{cx:a[0],cy:a[1],r:report.radius*frame.w},cp);
    const clipped=el("g",{"clip-path":"url(#beta-lune-mask)"},group);
    el("circle",{cx:b[0],cy:b[1],r:report.radius*frame.w,
      fill:report.valid?"#c8c5be":"#c9aeb0","fill-opacity":.38},clipped);
  }
  if(report && hasLayer("beta-disks")){
    const group=squareClip(svg,"beta-disk-square");
    for(const c of report.centers)
      circleOverlay(svg,c,report.radius,report.valid?"#aaa8ac":"#bb9b9a",
        1.6,true,"none",group);
  }
  const shouldShowInvalid=hasLayer("beta-invalid");
  const tooMany=points.length>45;
  if(shouldShowInvalid && !tooMany){
    for(const p of allPointPairs(points)){
      if(validKeys.has(edgeKey(...p)))continue;
      const e=segment(svg,points[p[0]],points[p[1]],"#a8a0a2",1,.16);
      e.setAttribute("stroke-dasharray","3 5");
    }
  }
  if(hasLayer("beta-edges")){
    for(const e of edges){
      const selected=pair&&edgeKey(...pair)===edgeKey(...e);
      segment(svg,points[e[0]],points[e[1]],selected?"#77717b":"#34383c",
        selected?4:2.1,selected?1:.65);
    }
  }
  // A selected rejected pair is always visible, even though it is not an edge.
  if(report){
    const e=segment(svg,points[pair[0]],points[pair[1]],
      report.valid?"#77727a":"#ad6469",4,1);
    if(!report.valid)e.setAttribute("stroke-dasharray","9 5");
    for(const i of pair){
      const v=xy(points[i]);el("circle",{cx:v[0],cy:v[1],r:11,
        fill:"none",stroke:report.valid?"#77727a":"#ad6469",
        "stroke-width":2},svg);
    }
  }
  // Accessible selection from valid links; inspect-pair mode also enables
  // choosing any *rejected* pair by selecting two vertices in sequence.
  for(const e of edges){
    clickLine(svg,points[e[0]],points[e[1]],"transparent",11,
      "Inspect candidate "+(e[0]+1)+"–"+(e[1]+1),
      function(){selectBetaPair(e);});
  }
  points.forEach(function(p,i){
    const blocker=report&&report.blockers.some(x=>x.index===i);
    const selected=!!report&&(i===pair[0]||i===pair[1]);
    if(blocker&&hasLayer("beta-blockers")){
      const v=xy(p);
      el("circle",{cx:v[0],cy:v[1],r:15,fill:"#b56c73","fill-opacity":.14,
        stroke:"#b36e73","stroke-width":1.6},svg);
    }
    site(svg,p,i,selected);
    if(blocker&&hasLayer("beta-blockers")){
      const v=xy(p);
      el("circle",{cx:v[0],cy:v[1],r:6.3,fill:"#a05f65",
        stroke:"#fff","stroke-width":1.8,"pointer-events":"none"},svg);
    }
  });
  if(state.betaInspectFirst!==null && points[state.betaInspectFirst]){
    const v=xy(points[state.betaInspectFirst]);
    el("circle",{cx:v[0],cy:v[1],r:20,fill:"none",
      stroke:"#727286","stroke-width":2.6,"stroke-dasharray":"4 3",
      "pointer-events":"none"},svg);
  }
  const total=points.length*(points.length-1)/2;
  detail("sensors-stat",points.length+" sensors · "+edges.length+
    " accepted · "+(total-edges.length)+" rejected");
  if(report){
    const names=report.blockers.map(b=>b.index+1);
    detail("sensors-details","Pair "+(pair[0]+1)+"–"+(pair[1]+1)+": "+
      (report.valid?"ACCEPTED · empty lune.":"REJECTED · "+names.length+
      " blocking point"+(names.length===1?"":"s")+".")+
      " Distance "+report.distance.toFixed(3)+
      "; each disk radius "+report.radius.toFixed(3)+
      (names.length?"; blockers: "+names.join(", ")+".":""));
    detail("sensors-note",report.valid?
      "The defining disks share no other interior site, so the pair forms an edge.":
      "The highlighted site"+(names.length===1?" lies":"s lie")+
      " inside both disks, so this pair does not form an edge.");
  } else {
    detail("sensors-details","Add at least two sensors to test a connection.");
    detail("sensors-note","For β ≥ 1, two sites connect when their open lune contains no other point.");
  }
  if(tooMany && shouldShowInvalid)detail("sensors-note",
    "There are too many rejected pairs to show at once. Select two sensors to examine a particular connection.");
}
/**
 * A stochastic comparison is sampled exactly once per (kind, seed, parameter)
 * change; both graph panels consume the SAME array reference, and swapping
 * graph definitions never samples a second point cloud.
 */
function compareSourcePoints(){
  if(state.comparePointSet==="sensors")
    return editablePoints("sensors",dataset?.beta?.points||betaPoints);
  if(!state.comparePoints)state.comparePoints=stochasticPointSet(
    state.comparePointSet,state.compareParameter,state.compareSeed);
  return state.comparePoints;
}
function syncComparisonControls(){
  const stochastic=state.comparePointSet!=="sensors";
  const group=document.getElementById("compare-process-controls");
  if(!group)return;
  group.hidden=!stochastic;
  document.getElementById("compare-point-set").value=state.comparePointSet;
  document.getElementById("compare-process-slider").value=
    String(state.compareParameter);
  if(stochastic){
    detail("compare-parameter-title",state.comparePointSet==="poisson"?
      "Expected number of points (λ)":"Number of points (n)");
    detail("compare-parameter-count",String(state.compareParameter));
    detail("compare-process-definition",state.comparePointSet==="poisson"?
      "The number of points varies randomly, with mean λ.":
      "Exactly n points are placed independently across the square.");
    detail("compare-realized","Points in this sample: "+compareSourcePoints().length);
  }
}
function setComparisonPointSet(kind){
  if(!["sensors","poisson","binomial"].includes(kind))return;
  state.comparePointSet=kind;
  state.comparePoints=kind==="sensors"?null:stochasticPointSet(
    kind,state.compareParameter,state.compareSeed);
  syncComparisonControls();
  drawCompare();
}
function setComparisonParameter(parameter,seed=state.compareSeed){
  if(state.comparePointSet==="sensors")return;
  state.compareParameter=Math.max(0,Math.min(80,Math.round(parameter)));
  state.compareSeed=seed>>>0;
  state.comparePoints=stochasticPointSet(state.comparePointSet,
    state.compareParameter,state.compareSeed);
  syncComparisonControls();
  drawCompare();
}
function resetComparison(){
  state.comparePointSet="sensors";
  state.compareParameter=COMPARE_DEFAULT_PARAMETER;
  state.compareSeed=COMPARE_DEFAULT_SEED;
  state.comparePoints=null;
  document.getElementById("compare-left").value="gabriel";
  document.getElementById("compare-right").value="rng";
  syncComparisonControls();
  drawCompare();
}
function drawCompare(){
  const source=dataset?.compare;
  const points=compareSourcePoints();
  const authoritative=state.comparePointSet==="sensors" &&
    !edited("sensors") && !!source?.options;
  const catalog={
    delaunay:"Delaunay triangulation",gabriel:"Gabriel graph",
    rng:"Relative neighborhood graph",beta:"β-skeleton (β = 1.5)",
    "alpha-shape":"Alpha-shape boundary (α = −4)"
  };
  const counts=[];
  for(const side of ["left","right"]){
    const graph=document.getElementById("compare-"+side).value;
    const edges=authoritative&&source.options[graph]?
      source.options[graph]:compareGraphEdges(points,graph);
    const svg=document.getElementById("compare-"+side+"-plot");
    background(svg,"04 / "+graph.replace("-"," "));
    for(const [i,j] of edges)
      segment(svg,points[i],points[j],
        side==="left"?"#303338":"#89818a",2.2,.8);
    for(const p of points){
      const v=xy(p);
      el("circle",{cx:v[0],cy:v[1],r:5.4,fill:"#303136",
        stroke:"#fff","stroke-width":1.7},svg);
    }
    detail("compare-"+side+"-label",catalog[graph]);
    detail("compare-"+side+"-count",edges.length+" edges");
    counts.push(edges.length);
  }
  const descriptor=state.comparePointSet==="sensors"?
    "sensor network":state.comparePointSet==="poisson"?
      "Poisson sample":"binomial sample";
  detail("compare-details",points.length+" points from the "+descriptor+
    " appear in both panels. Left: "+counts[0]+" edges; right: "+counts[1]+
    " edges. Only the connection rule changes.");
  if(state.comparePointSet!=="sensors")
    detail("compare-realized","Points in this sample: "+points.length);
  detail("compare-source",state.comparePointSet==="sensors"?
    (authoritative?"The sensor positions are the same in both diagrams.":
      "The modified sensor positions are used in both diagrams."):
    "Both diagrams use one "+(state.comparePointSet==="poisson"?"Poisson":"binomial")+
    " sample. Generate a new sample to explore another arrangement.");
}
function setPreset(scene,preset){
  const presets={
    water:{
      final:{"water-cells":true,"water-dual":true,"water-bisectors":false,"water-circumcircle":false,"water-triangles":false,"water-deaths":true,"water-pump-label":true},
      construction:{"water-cells":false,"water-dual":true,"water-bisectors":true,"water-circumcircle":true,"water-triangles":true,"water-deaths":true,"water-pump-label":true},
      both:{"water-cells":true,"water-dual":true,"water-bisectors":true,"water-circumcircle":true,"water-triangles":false,"water-deaths":true,"water-pump-label":true}
    },
    habitat:{
      final:{"alpha-hull":true,"alpha-shape":true,"alpha-triangulation":false,"alpha-kept":false,
        "alpha-circle":false,"alpha-all-circles":false,"alpha-centers":false},
      construction:{"alpha-hull":false,"alpha-shape":true,"alpha-triangulation":true,"alpha-kept":true,
        "alpha-circle":true,"alpha-all-circles":true,"alpha-centers":true},
      both:{"alpha-hull":true,"alpha-shape":true,"alpha-triangulation":false,"alpha-kept":true,
        "alpha-circle":false,"alpha-all-circles":true,"alpha-centers":false}
    },
    sensors:{
      final:{"beta-edges":true,"beta-invalid":false,"beta-lune":false,
        "beta-disks":false,"beta-blockers":false},
      construction:{"beta-edges":false,"beta-invalid":true,"beta-lune":true,
        "beta-disks":true,"beta-blockers":true},
      both:{"beta-edges":true,"beta-invalid":false,"beta-lune":true,
        "beta-disks":true,"beta-blockers":true}
    }
  };
  const spec=presets[scene]?.[preset];
  if(!spec)return;
  for(const [id,value] of Object.entries(spec))document.getElementById(id).checked=value;
  ({water:drawWater,habitat:drawHabitat,sensors:drawSensors}[scene])();
}

function saveBlob(blob,name){
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url);},3000);
}
function svgText(id){
  const clone=document.getElementById(id).cloneNode(true);
  clone.setAttribute("xmlns",NS);clone.setAttribute("width","1280");clone.setAttribute("height","1200");
  return new XMLSerializer().serializeToString(clone);
}
function attachExports(){
  document.querySelectorAll("[data-export]").forEach(function(btn){
    btn.addEventListener("click",function(){const id=btn.dataset.export;saveBlob(new Blob([svgText(id)],{type:"image/svg+xml;charset=utf-8"}),id+".svg");});
  });
  document.querySelectorAll("[data-png]").forEach(function(btn){
    btn.addEventListener("click",function(){
      const id=btn.dataset.png,img=new Image(),url=URL.createObjectURL(new Blob([svgText(id)],{type:"image/svg+xml;charset=utf-8"}));
      img.onload=function(){
        const canvas=document.createElement("canvas");canvas.width=1280;canvas.height=1200;
        const context=canvas.getContext("2d");context.drawImage(img,0,0,canvas.width,canvas.height);
        canvas.toBlob(function(blob){if(blob)saveBlob(blob,id+".png");URL.revokeObjectURL(url);},"image/png");
      };
      img.onerror=function(){URL.revokeObjectURL(url);alert("PNG export failed; SVG export remains available.");};
      img.src=url;
    });
  });
}

async function start(){
  for(const [name,ids,render] of [
    ["water",["water-cells","water-dual","water-bisectors","water-circumcircle","water-triangles","water-deaths","water-pump-label"],drawWater],
    ["habitat",["alpha-hull","alpha-shape","alpha-triangulation","alpha-kept",
      "alpha-circle","alpha-all-circles","alpha-centers"],drawHabitat],
    ["sensors",["beta-edges","beta-invalid","beta-lune","beta-disks","beta-blockers"],drawSensors]
  ]){
    for(const id of ids)document.getElementById(id).addEventListener("change",render);
    document.getElementById(name==="habitat"?"alpha-view":name==="sensors"?"beta-view":"water-view")
      .addEventListener("change",function(e){setPreset(name,e.target.value);});
  }
  document.getElementById("water-next-triangle").addEventListener("click",function(){
    state.waterTriangleIndex+=1;drawWater();
  });
  document.getElementById("alpha-point-set").addEventListener("change",function(e){
    switchAlphaPreset(e.target.value);
  });
  const alphaSlider=document.getElementById("alpha-slider");
  let alphaTimer=null;
  const commitAlpha=function(){
    if(alphaTimer!==null)clearTimeout(alphaTimer);
    alphaTimer=null;
    drawHabitat();
  };
  alphaSlider.addEventListener("input",function(e){
    state.alphaValue=Number(e.target.value);
    state.alphaArc=0;
    const a=state.alphaValue;
    detail("alpha-value","α = "+Number(a.toFixed(3))+
      " · R = "+(a===0?"∞":(1/Math.abs(a)).toFixed(3)));
    if(alphaTimer!==null)clearTimeout(alphaTimer);
    // Recompute once pointer motion settles; signed alpha requires fresh
    // triangulation and geometry for non-precomputed parameter values.
    alphaTimer=setTimeout(commitAlpha,110);
  });
  alphaSlider.addEventListener("change",commitAlpha);

  function bindDensitySlider(sliderId,preset,previewId,apply){
    const slider=document.getElementById(sliderId);
    let timer=null;
    const commit=function(){
      if(timer!==null)clearTimeout(timer);
      timer=null;
      if(state.alphaPreset===preset)apply(Number(slider.value));
    };
    slider.addEventListener("input",function(){
      detail(previewId,slider.value);
      if(timer!==null)clearTimeout(timer);
      timer=setTimeout(commit,130);
    });
    slider.addEventListener("change",commit);
  }
  bindDensitySlider("pg-interior-slider","pg","pg-interior-count",
    n=>setPgInteriorCount(n));
  bindDensitySlider("smiley-interior-slider","smiley","smiley-interior-count",
    n=>setSmileyInteriorCount(n));
  bindDensitySlider("process-slider","poisson","process-parameter-count",
    n=>setProcessParameter(n));
  // Binomial shares the same parameter slider; its separate listener
  // is no-op while the Poisson preset is active.
  bindDensitySlider("process-slider","binomial","process-parameter-count",
    n=>setProcessParameter(n));
  document.getElementById("pg-reshuffle").addEventListener("click",function(){
    setPgInteriorCount(state.pgInteriorCount,(state.pgSeed+1)>>>0);
  });
  document.getElementById("smiley-reshuffle").addEventListener("click",function(){
    setSmileyInteriorCount(state.smileyInteriorCount,(state.smileySeed+1)>>>0);
  });
  document.getElementById("process-reshuffle").addEventListener("click",function(){
    setProcessParameter(state.processParameter,(state.processSeed+1)>>>0);
  });
  document.getElementById("beta-slider").addEventListener("input",function(e){
    state.betaIndex=Number(e.target.value);drawSensors();
  });
  document.getElementById("beta-show-blocked").addEventListener("click",function(){
    const points=editablePoints("sensors",dataset?.beta?.points||betaPoints);
    const beta=betaValues[state.betaIndex];
    const blocked=findBlockedBetaPair(points,beta,state.betaPair);
    if(blocked)selectBetaPair(blocked);
    else detail("sensors-note","No rejected pair was found for the current points and parameter.");
  });
  document.getElementById("beta-next-pair").addEventListener("click",function(){
    const pts=editablePoints("sensors",dataset?.beta?.points||betaPoints);
    const pairs=allPointPairs(pts);
    if(!pairs.length)return;
    const k=state.betaPair?pairs.findIndex(p=>edgeKey(...p)===edgeKey(...state.betaPair)):-1;
    selectBetaPair(pairs[(k+1)%pairs.length]);
  });
  for(const side of ["left","right"]){
    document.getElementById("compare-"+side).addEventListener("change",drawCompare);
  }
  document.getElementById("compare-swap").addEventListener("click",function(){
    const a=document.getElementById("compare-left"),b=document.getElementById("compare-right");
    const v=a.value;a.value=b.value;b.value=v;drawCompare();
  });
  document.getElementById("compare-reset").addEventListener("click",
    resetComparison);
  document.getElementById("compare-point-set").addEventListener("change",
    e=>setComparisonPointSet(e.target.value));
  const compareSlider=document.getElementById("compare-process-slider");
  let compareTimer=null;
  function applyCompareParameter(){
    if(compareTimer!==null)clearTimeout(compareTimer);
    compareTimer=null;
    setComparisonParameter(Number(compareSlider.value));
  }
  compareSlider.addEventListener("input",function(){
    detail("compare-parameter-count",compareSlider.value);
    if(compareTimer!==null)clearTimeout(compareTimer);
    compareTimer=setTimeout(applyCompareParameter,100);
  });
  compareSlider.addEventListener("change",applyCompareParameter);
  document.getElementById("compare-reshuffle").addEventListener("click",function(){
    setComparisonParameter(state.compareParameter,(state.compareSeed+1)>>>0);
  });
  attachExports();
  try{
    const response=await fetch("data/scenes.json",{cache:"no-store"});
    if(!response.ok)throw new Error("Generated data not found");
    const loaded=await response.json();
    if(loaded.format_version!==1||!loaded.voronoi||!loaded.alpha||!loaded.beta)
      throw new Error("Incomplete generated data");
    dataset=loaded;
    detail("source-status","The interactive figures are ready. Choose a point or adjust the controls to explore.");
  }catch(error){
    detail("source-status","Historical source data are temporarily unavailable. The other geometric examples remain interactive.");
  }
  setupPointEditors(dataset);
  document.getElementById("alpha-point-set").value=state.alphaPreset;
  document.getElementById("alpha-slider").value=String(state.alphaValue);
  syncPgDensityControls();
  syncComparisonControls();
  drawWater();replaceHabitatRealization();drawSensors();drawCompare();
}
if(typeof document!=="undefined")document.addEventListener("DOMContentLoaded",start);
if(typeof module!=="undefined" && module.exports){
  module.exports={circumcircle,delaunayTriangles,trianglesEdges,betaEdges,cells,
    fallbackAlpha,arcCircle,alphaValues,smileyAlphaValues,betaValues,
    waterPoints,betaPoints,habitatPoints,smileyPoints,pgWordmarkPoints,PG_MAX_INTERIOR,
    switchAlphaPreset,setPgInteriorCount,setSmileyInteriorCount,
    setProcessParameter,compareSourcePoints,setComparisonPointSet,
    setComparisonParameter,resetComparison};
}
