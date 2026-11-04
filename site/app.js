"use strict";

// Browser preview is self-contained. When available, generated JSON from the
// authoritative ProximityGraphs Python pipeline replaces ALL graph results.
const NS = "http://www.w3.org/2000/svg";
const WIDTH = 920, HEIGHT = 600;
const frame = { x: 205, y: 43, w: 510, h: 510 };
const teal = "#166b75", orange = "#be6c41", dark = "#243642";
const alphaValues = [2, 3, 4, 5];
const betaValues = [1, 1.25, 1.5, 1.75, 2];
const state = { waterSite: 0, alphaIndex: 1, alphaArc: 0, betaIndex: 2, betaEdge: null };
let dataset = null;

const waterPoints = [
  [.13,.22],[.31,.16],[.53,.22],[.80,.15],[.17,.48],[.42,.45],
  [.68,.43],[.87,.64],[.29,.78],[.59,.82],[.10,.82],[.76,.89]
];
const betaPoints = [
  [.09,.13],[.25,.12],[.39,.18],[.58,.12],[.80,.16],
  [.14,.33],[.32,.37],[.52,.35],[.76,.34],[.90,.42],
  [.08,.58],[.27,.59],[.47,.56],[.68,.60],[.86,.70],
  [.17,.81],[.38,.82],[.61,.85],[.80,.89]
];
const habitatPoints = Array.from({length:36}, function(_, i) {
  const t = 2 * Math.PI * i / 36;
  const r = .285 + .07 * Math.cos(4*t) + .032 * Math.sin(3*t);
  return [ .5 + 1.05*r*Math.cos(t), .50 + 1.05*r*Math.sin(t) ];
});

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
  el("rect", {width:WIDTH,height:HEIGHT,fill:"#f8fafb"},svg);
  for (let k=0;k<=10;k++) {
    const x=frame.x+frame.w*k/10, y=frame.y+frame.h*k/10;
    el("line",{x1:x,y1:frame.y,x2:x,y2:frame.y+frame.h,stroke:"#e7eef0","stroke-width":1},svg);
    el("line",{x1:frame.x,y1:y,x2:frame.x+frame.w,y2:y,stroke:"#e7eef0","stroke-width":1},svg);
  }
  el("rect",{x:frame.x,y:frame.y,width:frame.w,height:frame.h,fill:"none",stroke:"#cedce0","stroke-width":1.5},svg);
  el("text",{x:frame.x,y:28,fill:"#7a8e99","font-size":12,"letter-spacing":1},svg,tag.toUpperCase());
  el("text",{x:frame.x,y:HEIGHT-18,fill:"#7a8e99","font-size":11},svg,"Synthetic coordinates · normalized Euclidean plane");
}
function site(svg,p,i,selected,handler) {
  const v=xy(p);
  const c=el("circle",{cx:v[0],cy:v[1],r:selected?8:6.2,fill:selected?orange:teal,stroke:"#fff","stroke-width":2.4,class:"selectable",role:"button",tabindex:0,"aria-label":"Select site "+(i+1)},svg);
  el("title",{},c,"Site "+(i+1)+" · select to inspect");
  if(handler){
    c.addEventListener("click",function(){ handler(i); });
    c.addEventListener("keydown",function(e){if(e.key==="Enter" || e.key===" "){e.preventDefault();handler(i);}});
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
  const tris=[];
  for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)for(let k=j+1;k<points.length;k++){
    const circle=circumcircle(points[i],points[j],points[k]);
    if(!circle)continue;
    const empty=points.every(function(p,l){return l===i||l===j||l===k||dist(p,circle.center)>=circle.r-1e-8;});
    if(empty)tris.push({vertices:[i,j,k],r:circle.r});
  }
  return tris;
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
function drawWater(){
  const svg=document.getElementById("water-plot"),source=dataset&&dataset.voronoi;
  const points=source?source.points:waterPoints;
  const poly=source?source.cells:cells(points);
  const edges=source?source.delaunay:trianglesEdges(delaunayTriangles(points));
  background(svg,"01 / nearest-site partition");
  if(document.getElementById("water-cells").checked){
    const palette=["#e0edf0","#e7e8de","#d8e7e0","#eae2d7","#deedf2","#f2e9df","#e1e9d7","#e6e6ed","#f3e7e4","#deede8","#e7eaf1","#f3eadf"];
    poly.forEach(function(p,i){if(p.length>=3){
      el("polygon",{points:pointsAttr(p),fill:i===state.waterSite?"#b3dce0":palette[i%palette.length],
        "fill-opacity":i===state.waterSite?.98:.77,stroke:"#fff","stroke-width":2},svg);
    }});
  }
  if(document.getElementById("water-dual").checked)
    edges.forEach(function(e){segment(svg,points[e[0]],points[e[1]],"#a66b47",2.1,.72);});
  points.forEach(function(p,i){site(svg,p,i,i===state.waterSite,function(v){state.waterSite=v;drawWater();});});
  document.getElementById("water-stat").textContent=points.length+" sites · "+edges.length+" Delaunay edges";
  document.getElementById("water-note").textContent="Selected: station "+(state.waterSite+1)+". Its cell contains positions closer to this station than to any other (Euclidean distance).";
}
function drawHabitat(){
  const svg=document.getElementById("habitat-plot"),source=dataset&&dataset.alpha;
  const points=source?source.points:habitatPoints;
  const alpha=alphaValues[state.alphaIndex],shape=source?source.options[String(alpha)]:fallbackAlpha(points,-alpha);
  const arcs=shape&&shape.arcs?shape.arcs:[];
  background(svg,"02 / circular-arc alpha-hull");
  document.getElementById("alpha-value").textContent="α = −"+alpha+" · R = "+(1/alpha).toFixed(3);
  if(arcs.length){
    if(state.alphaArc>=arcs.length)state.alphaArc=0;
    const selected=arcCircle(arcs[state.alphaArc]);
    if(document.getElementById("alpha-circle").checked && selected){
      const c=xy(selected.center);
      el("circle",{cx:c[0],cy:c[1],r:selected.r*frame.w,fill:"#d7e9ed","fill-opacity":.22,stroke:"#8bb2bf","stroke-width":2,"stroke-dasharray":"8 5"},svg);
      el("circle",{cx:c[0],cy:c[1],r:5,fill:"#507989"},svg);
    }
    arcs.forEach(function(arc,i){
      const line=el("polyline",{points:pointsAttr(arc),fill:"none",stroke:i===state.alphaArc?orange:teal,
        "stroke-width":i===state.alphaArc?5:3.5,"stroke-linecap":"round",class:"selectable",role:"button",tabindex:0,"aria-label":"Select boundary arc "+(i+1)},svg);
      line.addEventListener("click",function(){state.alphaArc=i;drawHabitat();});
      line.addEventListener("keydown",function(e){if(e.key==="Enter"){state.alphaArc=i;drawHabitat();}});
      el("title",{},line,"Boundary arc "+(i+1));
    });
  }
  points.forEach(function(p,i){const v=xy(p);el("circle",{cx:v[0],cy:v[1],r:4.4,fill:dark,stroke:"#fff","stroke-width":1.5},svg);});
  document.getElementById("habitat-stat").textContent=arcs.length+" arcs · "+points.length+" observations";
  document.getElementById("habitat-note").textContent=arcs.length?"Highlighted arc "+(state.alphaArc+1)+" of "+arcs.length+" · circle radius "+(1/alpha).toFixed(3)+" normalized units.":"No closed boundary at this scale; adjust α.";
}
function drawSensors(){
  const svg=document.getElementById("sensors-plot"),source=dataset&&dataset.beta;
  const points=source?source.points:betaPoints,beta=betaValues[state.betaIndex];
  const edges=source?source.options[String(beta)]:betaEdges(points,beta);
  background(svg,"03 / empty-lune proximity");
  document.getElementById("beta-value").textContent="β = "+beta;
  if(!state.betaEdge || !edges.some(function(e){return edgeKey(e[0],e[1])===edgeKey(state.betaEdge[0],state.betaEdge[1]);}))
    state.betaEdge=edges.length?edges[Math.floor(edges.length/2)]:null;
  const selected=state.betaEdge;
  if(selected&&document.getElementById("beta-lune").checked){
    const p=points[selected[0]],q=points[selected[1]],h=beta/2,r=h*dist(p,q);
    const c1=[h*p[0]+(1-h)*q[0],h*p[1]+(1-h)*q[1]],
          c2=[h*q[0]+(1-h)*p[0],h*q[1]+(1-h)*p[1]];
    const a=xy(c1),b=xy(c2);
    const defs=el("defs",{},svg),cp=el("clipPath",{id:"selected-lune-clip"},defs);
    el("circle",{cx:a[0],cy:a[1],r:r*frame.w},cp);
    const grp=el("g",{"clip-path":"url(#selected-lune-clip)"},svg);
    el("circle",{cx:b[0],cy:b[1],r:r*frame.w,fill:"#dfb08e","fill-opacity":.42},grp);
    [a,b].forEach(function(c){el("circle",{cx:c[0],cy:c[1],r:r*frame.w,fill:"none",stroke:"#c48e65","stroke-width":1.5,"stroke-dasharray":"7 6"},svg);});
  }
  edges.forEach(function(edge,i){
    const on=selected&&edgeKey(edge[0],edge[1])===edgeKey(selected[0],selected[1]);
    segment(svg,points[edge[0]],points[edge[1]],on?orange:teal,on?5:2.2,on?1:.58);
    const a=xy(points[edge[0]]),b=xy(points[edge[1]]);
    const hit=el("line",{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:"transparent",
       "stroke-width":16,class:"selectable",role:"button",tabindex:0,"aria-label":"Inspect edge "+(edge[0]+1)+" to "+(edge[1]+1)},svg);
    hit.addEventListener("click",function(){state.betaEdge=edge;drawSensors();});
    hit.addEventListener("keydown",function(e){if(e.key==="Enter"){state.betaEdge=edge;drawSensors();}});
    el("title",{},hit,"Inspect link "+(edge[0]+1)+" – "+(edge[1]+1));
  });
  points.forEach(function(p,i){site(svg,p,i,selected&&(i===selected[0]||i===selected[1]));});
  document.getElementById("sensors-stat").textContent=edges.length+" geometric edges · "+points.length+" sensors";
  document.getElementById("sensors-note").textContent=selected?"Highlighted link "+(selected[0]+1)+"–"+(selected[1]+1)+": its β-dependent lens is empty of other sites.":"No eligible links.";
}
function saveBlob(blob,name){
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url);},3000);
}
function svgText(id){
  const clone=document.getElementById(id).cloneNode(true);
  clone.setAttribute("xmlns",NS);clone.setAttribute("width","1840");clone.setAttribute("height","1200");
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
        const canvas=document.createElement("canvas");canvas.width=1840;canvas.height=1200;
        const context=canvas.getContext("2d");context.drawImage(img,0,0,canvas.width,canvas.height);
        canvas.toBlob(function(blob){if(blob)saveBlob(blob,id+".png");URL.revokeObjectURL(url);},"image/png");
      };
      img.onerror=function(){URL.revokeObjectURL(url);alert("PNG export failed; SVG export remains available.");};
      img.src=url;
    });
  });
}
async function start(){
  document.getElementById("water-dual").addEventListener("change",drawWater);
  document.getElementById("water-cells").addEventListener("change",drawWater);
  document.getElementById("alpha-slider").addEventListener("input",function(e){state.alphaIndex=Number(e.target.value);state.alphaArc=0;drawHabitat();});
  document.getElementById("alpha-circle").addEventListener("change",drawHabitat);
  document.getElementById("beta-slider").addEventListener("input",function(e){state.betaIndex=Number(e.target.value);state.betaEdge=null;drawSensors();});
  document.getElementById("beta-lune").addEventListener("change",drawSensors);
  attachExports();
  try{
    const response=await fetch("data/scenes.json",{cache:"no-store"});
    if(!response.ok)throw new Error("Generated data not found");
    const loaded=await response.json();
    if(loaded.format_version!==1 || !loaded.voronoi||!loaded.alpha||!loaded.beta)throw new Error("Incomplete generated data");
    dataset=loaded;
    document.getElementById("source-status").textContent="Graph geometry: exported by ProximityGraphs · "+(loaded.metadata&&loaded.metadata.library_version||"version not reported")+". Changes select precomputed library outputs.";
  }catch(error){
    document.getElementById("source-status").textContent="Browser preview (independent geometry implementation). Run the documented Python generator to replace this with ProximityGraphs exports.";
  }
  drawWater();drawHabitat();drawSensors();
}
document.addEventListener("DOMContentLoaded",start);
