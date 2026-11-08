"use strict";

// Browser preview is self-contained. When available, generated JSON from the
// authoritative ProximityGraphs Python pipeline replaces ALL graph results.
const NS = "http://www.w3.org/2000/svg";
const WIDTH = 640, HEIGHT = 600;
const frame = { x: 65, y: 43, w: 510, h: 510 };
const teal = "#34383c", orange = "#6d6c75", dark = "#30302e";
const alphaValues = [8, 10, 11.8, 14]; // Pg preset values
const smileyAlphaValues = [4, 8, 10, 12];
const betaValues = [1, 1.25, 1.5, 1.75, 2];
const state = {
  waterSite:6, waterTriangleIndex:0,
  alphaPreset:"pg",alphaIndex:2,alphaArc:0,
  betaIndex:2,betaPair:null,betaInspectFirst:null
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

// Browser-only fallback agrees with the deterministic Python Pg generator.
// A few lattice sites are omitted to maintain two enclosed counters at -11.8.
const pgPoints=(function(){
  const excluded=new Set([3,7,9,19,20,23,25,30,36,46,64,74,88]);
  const points=[];let candidate=0;
  for(let ix=0;ix<15;ix++){
    const x=.13+.055*ix;
    for(let iy=0;iy<13;iy++){
      const y=.18+.055*iy;
      const p=(x>=.13&&x<=.225&&y>=.18&&y<=.83)||
        (x>=.205&&x<=.485&&y>=.55&&y<=.83&&
          !(x>=.282&&x<=.404&&y>=.634&&y<=.749));
      const g=(x>=.57&&x<=.91&&y>=.43&&y<=.73&&
          !(x>=.669&&x<=.813&&y>=.52&&y<=.64))||
        (x>=.812&&x<=.91&&y>=.23&&y<=.52)||
        (x>=.707&&x<=.91&&y>=.19&&y<=.27);
      if(p||g){
        if(!excluded.has(candidate)){
          points.push([
            x+.0022*Math.sin((ix+1)*18.7+(iy+1)*4.3),
            y+.0024*Math.cos((ix+1)*11.2-(iy+1)*13.1)
          ]);
        }
        candidate++;
      }
    }
  }
  return points;
})();
const habitatPoints = pgPoints;
function alphaScene() {
  const presets=dataset?.alpha?.presets;
  if(presets) return presets[state.alphaPreset];
  if(dataset?.alpha && state.alphaPreset==="pg") return dataset.alpha;
  return {
    points:state.alphaPreset==="pg"?pgPoints:smileyPoints,
    alpha_values:state.alphaPreset==="pg"?alphaValues:smileyAlphaValues,
    default_alpha_index:state.alphaPreset==="pg"?2:1,
    options:null,triangles:null
  };
}
function selectedAlphaValues(){
  return alphaScene()?.alpha_values ||
    (state.alphaPreset==="pg"?alphaValues:smileyAlphaValues);
}
function selectAlphaPreset(preset){
  if(preset!=="pg" && preset!=="smiley")return;
  state.alphaPreset=preset;state.alphaArc=0;
  const active=alphaScene();
  state.alphaIndex=active?.default_alpha_index ?? (preset==="pg"?2:1);
  const slider=document.getElementById("alpha-slider");
  slider.value=String(state.alphaIndex);
  const editor=pointEditors.habitat;
  if(editor){
    editor.original=active.points.map(p=>p.slice());
    editor.points=active.points.map(p=>p.slice());
    editor.dirty=false;editor.active=null;
    editor.generation=(editor.generation||0)+1;
    recomputeNotice("habitat");
  }
  drawHabitat();
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
    historic?"Digitized 1854 Soho map · proportionally normalized":
    "Synthetic teaching coordinates · normalized Euclidean plane");
}
function site(svg,p,i,selected,handler,displayName) {
  const v=xy(p);
  const c=el("circle",{cx:v[0],cy:v[1],r:selected?8:6.2,fill:selected?orange:teal,stroke:"#fff","stroke-width":2.4,class:"selectable editable-site",role:"button",tabindex:0,"data-point-index":i,"aria-label":"Select or drag site "+(i+1)},svg);
  el("title",{},c,(displayName||"Site "+(i+1))+" · select to inspect");
  // A larger transparent hit area keeps small scientific markers usable on touch screens.
  const hit=el("circle",{cx:v[0],cy:v[1],r:18,fill:"transparent",
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
function curveBetween(p,q,r,orientation){
  const d=dist(p,q);if(d>2*r||d===0)return [p,q];
  const m=[(p[0]+q[0])/2,(p[1]+q[1])/2],h=Math.sqrt(Math.max(0,r*r-d*d/4));
  const normal=[-(q[1]-p[1])/d,(q[0]-p[0])/d];
  // Library chooses the exterior center with smaller side for positive cycle orientation.
  const c=[m[0]-(orientation>0?1:-1)*h*normal[0],m[1]-(orientation>0?1:-1)*h*normal[1]];
  let a=Math.atan2(p[1]-c[1],p[0]-c[0]);
  let delta=Math.atan2(q[1]-c[1],q[0]-c[0])-a;
  while(delta>Math.PI)delta-=2*Math.PI;while(delta< -Math.PI)delta+=2*Math.PI;
  return Array.from({length:32},function(_,k){const t=a+delta*k/31;return [c[0]+r*Math.cos(t),c[1]+r*Math.sin(t)];});
}
function fallbackAlpha(points,alpha){
  const tris=delaunayTriangles(points).filter(function(t){return t.r<=1/Math.abs(alpha)+1e-9;});
  const counts=new Map(), pairs=new Map();
  tris.forEach(function(t){
    [[0,1],[1,2],[2,0]].forEach(function(ab){
      const i=t.vertices[ab[0]],j=t.vertices[ab[1]],key=edgeKey(i,j);
      counts.set(key,(counts.get(key)||0)+1);
      pairs.set(key,[Math.min(i,j),Math.max(i,j)]);
    });
  });
  const boundaries=Array.from(counts.keys()).filter(function(k){return counts.get(k)===1;}).map(function(k){return pairs.get(k);});
  if(!boundaries.length)return {arcs:[],segments:[]};
  const neighbors=new Map();
  boundaries.forEach(function(edge){edge.forEach(function(i,t){if(!neighbors.has(i))neighbors.set(i,[]);neighbors.get(i).push(edge[1-t]);});});
  const visited=new Set(),arcs=[];
  boundaries.forEach(function(edge){
    if(visited.has(edgeKey(edge[0],edge[1])))return;
    const cycle=[edge[0]],start=edge[0];let previous=-1,current=start;
    for(let tries=0;tries<=boundaries.length+1;tries++){
      const next=(neighbors.get(current)||[]).find(function(q){return q!==previous&&!visited.has(edgeKey(current,q));});
      if(next==null)break;
      visited.add(edgeKey(current,next));previous=current;current=next;
      if(current===start)break;cycle.push(current);
    }
    if(cycle.length<3||current!==start)return;
    const area=signedArea(cycle.map(function(i){return points[i];}));
    for(let k=0;k<cycle.length;k++){
      const i=cycle[k],j=cycle[(k+1)%cycle.length];
      arcs.push(curveBetween(points[i],points[j],1/Math.abs(alpha),area));
    }
  });
  return {arcs:arcs,segments:boundaries};
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
  background(svg,"01 / nearest-site & empty-circle constructions");
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
  detail("water-stat",points.length+" pumps · "+edges.length+" Delaunay edges"+
    (source?.death_marks?" · "+source.death_marks.length+" death marks":""));
  if(points.length){
    const degree=edges.filter(e=>e.includes(state.waterSite)).length;
    const p=points[state.waterSite];
    const cc=chosen?circumcircle(...chosen.vertices.map(i=>points[i])):null;
    detail("water-details","Pump "+(state.waterSite+1)+
      (original && source.labels?.[state.waterSite]?
       " · "+source.labels[state.waterSite]:" · edited site")+" at ("+
      p[0].toFixed(3)+", "+p[1].toFixed(3)+"). "+
      polygons[state.waterSite].length+" clipped cell vertices; "+
      degree+" Delaunay neighbors."+
      (chosen&&cc?" Witness triangle "+chosen.vertices.map(i=>i+1).join("–")+
      " has circumradius "+cc.r.toFixed(3)+".":""));
    detail("water-note","The station's cell is the intersection of "+(points.length-1)+
      " nearest-site half-planes. Historical death marks are background observations, not graph vertices. A Delaunay witness triangle has no pump strictly inside its circumcircle.");
  } else {
    detail("water-details","No stations remain. Use Add to place a site.");
    detail("water-note","At least two sites are needed to create a graph edge.");
  }
}
function drawHabitat(){
  const svg=document.getElementById("habitat-plot"),source=alphaScene();
  const points=editablePoints("habitat",source.points);
  const alpha=selectedAlphaValues()[state.alphaIndex],a=-alpha;
  const original=!!source.options&&!edited("habitat");
  const shape=original?source.options[String(alpha)]:fallbackAlpha(points,a);
  const arcs=shape?.arcs || [];
  const triangles=original&&source.triangles?source.triangles:delaunayTriangles(points);
  const filtered=alphaSimplices(points,a,triangles);
  const boundary=original&&shape.shape_edges?shape.shape_edges:filtered.boundary;
  const kept=original&&shape.kept_triangles?
    shape.kept_triangles:filtered.kept.map(x=>x.vertices);
  background(svg,"02 / alpha boundary and circular construction");
  detail("alpha-value","α = −"+alpha+" · R = "+(1/alpha).toFixed(3));
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
        fill:"#c0bdba","fill-opacity":.18,stroke:"#aaa7a2",
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
  points.forEach(function(p,i){site(svg,p,i,false);});
  const topo=shape?.topology || alphaComplexTopology(filtered.kept);
  detail("habitat-stat",(state.alphaPreset==="pg"?"Pg":"Smiley")+" · "+points.length+
    " sites · "+boundary.length+" edges · "+topo.holes+
    " enclosed hole"+(topo.holes===1?"":"s"));
  const c=chosenCircle;
  detail("habitat-details",(state.alphaPreset==="pg"?"Pg wordmark":"Original smiley")+". "+
    "α = −"+alpha+" gives radius R = "+(1/alpha).toFixed(3)+
    ". "+kept.length+" of "+triangles.length+" Delaunay triangles satisfy the radius cutoff. "+
    boundary.length+" straight boundary edges, "+arcs.length+" sampled circular arcs. "+
    topo.holes+" bounded holes in "+topo.components+" component(s)."+
    (c?" Arc "+(state.alphaArc+1)+" center: ("+
      c.center[0].toFixed(3)+", "+c.center[1].toFixed(3)+").":""));
  detail("habitat-note",(state.alphaPreset==="pg" && topo.holes===2?
    "Both enclosed counters are present: one in P and one in g. ":"")+
    "A retained triangle has circumradius ≤ R. Boundary edges have one retained incident triangle; circular hull arcs connect their endpoints.");
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
    detail("sensors-note","First endpoint: sensor "+(index+1)+". Choose a second sensor to inspect the candidate.");
    drawSensors();
    return;
  }
  if(state.betaInspectFirst===index){
    detail("sensors-note","Choose a different sensor for the second endpoint.");
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
  background(svg,"03 / empty lune · accepted and blocked pairs");
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
      "No third site lies strictly inside both disks. This is a geometric edge.":
      "Highlighted blocker"+(names.length===1?"":"s")+
      " lie inside both disks; the selected line is a rejected candidate, not an edge.");
  } else {
    detail("sensors-details","Add two or more points to test a candidate edge.");
    detail("sensors-note","β-skeletons use an open empty lune for β ≥ 1.");
  }
  if(tooMany && shouldShowInvalid)detail("sensors-note",
    "Showing all rejected candidates is suppressed above 45 points to keep the editor responsive. Inspect any pair by selecting two sensors.");
}
function drawCompare(){
  const source=dataset?.compare,editedPoints=edited("sensors");
  const points=editablePoints("sensors",dataset?.beta?.points||betaPoints);
  const catalog={
    delaunay:"Delaunay triangulation",gabriel:"Gabriel graph",
    rng:"Relative neighborhood graph",beta:"β-skeleton (β = 1.5)",
    "alpha-shape":"Alpha-shape boundary (α = −4)"
  };
  const counts=[];
  for(const side of ["left","right"]){
    const graph=document.getElementById("compare-"+side).value;
    const original=source&&!editedPoints&&
      source.options&&source.options[graph];
    const edges=original?source.options[graph]:compareGraphEdges(points,graph);
    const svg=document.getElementById("compare-"+side+"-plot");
    background(svg,"04 / "+graph.replace("-"," "));
    edges.forEach(function(e){
      segment(svg,points[e[0]],points[e[1]],
        side==="left"?"#303338":"#89818a",2.2,.8);
    });
    points.forEach(function(p){
      const v=xy(p);
      el("circle",{cx:v[0],cy:v[1],r:5.4,fill:"#303136",
        stroke:"#fff","stroke-width":1.7},svg);
    });
    detail("compare-"+side+"-label",catalog[graph]);
    detail("compare-"+side+"-count",edges.length+" edges");
    counts.push(edges.length);
  }
  detail("compare-details",points.length+
    " identical sites. Left: "+counts[0]+" edges; right: "+counts[1]+
    " edges. Their difference comes from the neighborhood rule, not different coordinates.");
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
      both:{"alpha-hull":true,"alpha-shape":true,"alpha-triangulation":false,"alpha-kept":false,
        "alpha-circle":true,"alpha-all-circles":false,"alpha-centers":false}
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
  document.getElementById("alpha-preset").addEventListener("change",function(e){
    selectAlphaPreset(e.target.value);
  });
  document.getElementById("alpha-slider").addEventListener("input",function(e){
    state.alphaIndex=Number(e.target.value);state.alphaArc=0;drawHabitat();
  });
  document.getElementById("beta-slider").addEventListener("input",function(e){
    state.betaIndex=Number(e.target.value);drawSensors();
  });
  document.getElementById("beta-show-blocked").addEventListener("click",function(){
    const points=editablePoints("sensors",dataset?.beta?.points||betaPoints);
    const beta=betaValues[state.betaIndex];
    const blocked=findBlockedBetaPair(points,beta,state.betaPair);
    if(blocked)selectBetaPair(blocked);
    else detail("sensors-note","Every candidate pair is valid at the current parameter and point configuration.");
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
  document.getElementById("compare-reset").addEventListener("click",function(){
    document.getElementById("compare-left").value="gabriel";
    document.getElementById("compare-right").value="rng";
    drawCompare();
  });
  attachExports();
  try{
    const response=await fetch("data/scenes.json",{cache:"no-store"});
    if(!response.ok)throw new Error("Generated data not found");
    const loaded=await response.json();
    if(loaded.format_version!==1||!loaded.voronoi||!loaded.alpha||!loaded.beta)
      throw new Error("Incomplete generated data");
    dataset=loaded;
    detail("source-status","Authoritative default geometries: ProximityGraphs "+
      (loaded.metadata?.library_version||"version not reported")+
      ". Edits are recomputed independently in the browser.");
  }catch(error){
    detail("source-status","Python-generated data unavailable; the independent browser preview is active.");
  }
  state.alphaPreset=dataset?.alpha?.default_preset || "pg";
  const defaultAlpha=alphaScene();
  state.alphaIndex=defaultAlpha?.default_alpha_index ?? 2;
  document.getElementById("alpha-preset").value=state.alphaPreset;
  document.getElementById("alpha-slider").value=String(state.alphaIndex);
  setupPointEditors(dataset);
  drawWater();drawHabitat();drawSensors();drawCompare();
}
if(typeof document!=="undefined")document.addEventListener("DOMContentLoaded",start);
if(typeof module!=="undefined" && module.exports){
  module.exports={circumcircle,delaunayTriangles,trianglesEdges,betaEdges,cells,
    fallbackAlpha,arcCircle,alphaValues,smileyAlphaValues,betaValues,waterPoints,betaPoints,habitatPoints,pgPoints,smileyPoints};
}
