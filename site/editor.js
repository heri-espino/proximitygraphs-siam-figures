"use strict";

/**
 * Point editing for the SIAM outreach companion.
 *
 * Defaults are exported by the pinned ProximityGraphs Python library.
 * After the first edit, the browser computes a fresh illustration locally
 * with explicitly independent JavaScript algorithms; this must never be
 * represented as a new library-generated output.
 */
const EDIT_MAX = 80;
const EDIT_CAPS = Object.freeze({water:80,habitat:1100,sensors:80});
const EDIT_SEPARATION = 0.008;
const EDIT_SCENES = Object.freeze({
  water: {plot:"water-plot",draw:"drawWater",name:"water stations"},
  habitat: {plot:"habitat-plot",draw:"drawHabitat",name:"alpha point cloud"},
  sensors: {plot:"sensors-plot",draw:"drawSensors",name:"sensors"}
});
const pointEditors = {};

/**
 * A deterministic incremental Delaunay triangulator for 2D demonstrations.
 * Each returned object stores vertices and circumradius, like the original
 * app's exhaustive empty-circumcircle implementation, but is faster to drag.
 * Collinear/duplicate-degenerate inputs yield no triangles.
 */
function triangulate(points) {
  if (points.length < 3) return [];
  const n=points.length;
  const all=points.concat([[-12,-10],[12,-10],[0,14]]);
  let triangles=[[n,n+1,n+2]];
  function triangleCircle(t) {
    const [i,j,k]=t;
    return circumcircle(all[i],all[j],all[k]);
  }
  for(let point=0;point<n;point++){
    const boundary=new Map(), survivors=[];
    for(const t of triangles){
      const cc=triangleCircle(t);
      const inside=cc && dist(all[point],cc.center) <= cc.r+1e-10;
      if(!inside){survivors.push(t);continue;}
      for(const [i,j] of [[t[0],t[1]],[t[1],t[2]],[t[2],t[0]]]){
        const key=edgeKey(i,j), previous=boundary.get(key);
        boundary.set(key,previous?{pair:previous.pair,count:previous.count+1}:{pair:[i,j],count:1});
      }
    }
    for(const item of boundary.values()){
      if(item.count!==1)continue;
      const [i,j]=item.pair;
      const a=all[i],b=all[j],p=all[point];
      const area=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
      if(Math.abs(area)>1e-12)survivors.push([i,j,point]);
    }
    triangles=survivors;
  }
  return triangles.filter(t=>t.every(i=>i<n)).map(t=>{
    const circle=triangleCircle(t);
    return {vertices:t,r:circle.r};
  });
}

function editablePoints(name, original) {
  const editor=pointEditors[name];
  return editor ? editor.points : original;
}
function edited(name) {
  return !!pointEditors[name] && pointEditors[name].dirty;
}
function recomputeNotice(name) {
  const editor=pointEditors[name], element=document.getElementById(name+"-edit-source");
  if(!editor || !element)return;
  element.textContent=editor.dirty ?
    (name==="water" && typeof dataset!=="undefined" && dataset?.voronoi?.historical ?
      "Edited pump positions are hypothetical; historical death marks remain fixed. Geometry recomputed in JavaScript." :
      "Edited points · recalculated locally in JavaScript (not a new ProximityGraphs export).") :
    (typeof dataset!=="undefined" && dataset ?
      (name==="water" && dataset?.voronoi?.historical ?
        "Digitized historical John Snow pump sites · graph geometry exported by ProximityGraphs." :
        "Original points · geometry exported by the ProximityGraphs Python library.") :
      "Browser preview · authoritative Python scene data were not loaded.");
}
function setEditorMode(name,mode) {
  const editor=pointEditors[name];
  if(!editor || !["move","add","delete","inspect"].includes(mode) || (mode==="inspect" && name!=="sensors"))return;
  editor.mode=mode;
  if(name==="sensors" && mode!=="inspect" && typeof state!=="undefined")
    state.betaInspectFirst=null;
  editor.svg.dataset.mode=mode;
  for(const btn of document.querySelectorAll('[data-editor-scene="'+name+'"][data-mode]')){
    btn.setAttribute("aria-pressed",String(btn.dataset.mode===mode));
  }
  const help=document.getElementById(name+"-edit-help");
  help.textContent=({
    move:"Drag any point to move it. Click an edge or arc to inspect it.",
    add:"Click a blank spot inside the square to add a point.",
    delete:"Click a point to remove it. Reset restores the original layout.",
    inspect:"Click two distinct sensors to test their candidate edge and identify any blockers."
  })[mode];
}
function sceneCoords(svg,event) {
  // SVG user coordinates via the current screen transform (responsive/mobile).
  const transform=svg.getScreenCTM();
  if(!transform)return null;
  const p=svg.createSVGPoint();
  p.x=event.clientX;p.y=event.clientY;
  const v=p.matrixTransform(transform.inverse());
  return [(v.x-frame.x)/frame.w,1-(v.y-frame.y)/frame.h];
}
function validPoint(points,p,exclude=-1) {
  return p && p.every(Number.isFinite) &&
    p[0]>=0 && p[0]<=1 && p[1]>=0 && p[1]<=1 &&
    points.every((q,i)=>i===exclude || dist(p,q)>=EDIT_SEPARATION);
}
function refreshEditor(name) {
  const editor=pointEditors[name];
  editor.dirty=true;
  recomputeNotice(name);
  if(name==="water") state.waterSite=Math.min(state.waterSite,Math.max(0,editor.points.length-1));
  if(name==="habitat")state.alphaArc=0;
  if(name==="sensors")state.betaEdge=null;
  editor.render();
  if(name==="sensors" && typeof drawCompare==="function")drawCompare();
}
function resetEditor(name) {
  // Each habitat preset restores its own parameters and deterministic seed.
  if(name==="habitat"&&typeof resetHabitatPointSet==="function"){
    resetHabitatPointSet();
    return;
  }
  const editor=pointEditors[name];
  editor.points=editor.original.map(p=>p.slice());
  editor.dirty=false;
  editor.active=null;
  editor.generation=(editor.generation||0)+1;
  if(name==="water")state.waterSite=(typeof dataset!=="undefined" && dataset?.voronoi?.historical ?
    dataset.voronoi.historical.broad_street_index : 6);

  if(name==="sensors"){state.betaEdge=null;state.betaPair=null;state.betaInspectFirst=null;}
  recomputeNotice(name);
  editor.render();
  if(name==="sensors" && typeof drawCompare==="function")drawCompare();
}
function replaceEditorPointSet(name,sourcePoints) {
  // Replacing a teaching preset establishes a new clean baseline.
  // The old preset remains in the authoritative source data, not in this editor.
  const editor=pointEditors[name];
  if(!editor || !Array.isArray(sourcePoints))return;
  editor.original=sourcePoints.map(p=>p.slice());
  editor.points=editor.original.map(p=>p.slice());
  editor.active=null;
  editor.pending=false;
  editor.dirty=false;
  editor.generation=(editor.generation||0)+1;
  if(name==="habitat")state.alphaArc=0;
  recomputeNotice(name);
  editor.render();
}
function setupPointEditors(sceneData) {
  const defaults={
    water:sceneData?.voronoi?.points || waterPoints,
    habitat:sceneData?.alpha?.points || habitatPoints,
    sensors:sceneData?.beta?.points || betaPoints
  };
  for(const [name,config] of Object.entries(EDIT_SCENES)){
    const svg=document.getElementById(config.plot);
    const original=defaults[name].map(p=>p.slice());
    const editor={
      original,points:original.map(p=>p.slice()),dirty:false,
      mode:"move",svg,active:null,generation:0,render:()=>{}
    };
    // Functions defined by top-level declarations in app.js are available to
    // script-loaded siblings as globals in browsers.
    editor.render=()=>({water:drawWater,habitat:drawHabitat,sensors:drawSensors}[name])();
    pointEditors[name]=editor;
    setEditorMode(name,"move");
    recomputeNotice(name);
    svg.addEventListener("keydown",function(event){
      const node=event.target.closest("[data-point-index]");
      if(!node)return;
      const index=Number(node.getAttribute("data-point-index"));
      if(name==="sensors" && editor.mode==="inspect" &&
          (event.key==="Enter"||event.key===" ")){
        event.preventDefault();inspectBetaPoint(index);return;
      }
      if(editor.mode==="delete" && (event.key==="Enter" || event.key==="Delete" || event.key==="Backspace")){
        event.preventDefault();
        editor.points.splice(index,1);
        if(name==="sensors")state.betaPair=null;
        refreshEditor(name);
      } else if(editor.mode==="move" && event.key.startsWith("Arrow")){
        const steps={ArrowLeft:[-.012,0],ArrowRight:[.012,0],
          ArrowUp:[0,.012],ArrowDown:[0,-.012]};
        const delta=steps[event.key];
        if(!delta)return;
        event.preventDefault();
        const p=editor.points[index].map((v,i)=>Math.max(0,Math.min(1,v+delta[i])));
        if(validPoint(editor.points,p,index)){editor.points[index]=p;refreshEditor(name);}
      }
    });
    svg.addEventListener("pointerdown",function(event){
      if(event.button!==undefined && event.button!==0)return;
      const coord=sceneCoords(svg,event);
      if(!coord || coord.some(x=>x<0 || x>1))return;
      const point=event.target.closest("[data-point-index]");
      const index=point ? Number(point.getAttribute("data-point-index")) : -1;
      if(editor.mode==="inspect"){
        event.preventDefault();
        if(index>=0 && name==="sensors")inspectBetaPoint(index);
        return;
      }
      if(editor.mode==="add"){
        if(index>=0)return;
        if(editor.points.length>=EDIT_CAPS[name]){
          document.getElementById(name+"-edit-help").textContent=EDIT_CAPS[name]+"-point interactive limit reached. Delete points or reset."
          return;
        }
        if(!validPoint(editor.points,coord))return;
        editor.points.push(coord);
        if(name==="water")state.waterSite=editor.points.length-1;
        event.preventDefault();
        refreshEditor(name);
        return;
      }
      if(editor.mode==="delete"){
        if(index<0)return;
        editor.points.splice(index,1);
        if(name==="sensors")state.betaPair=null;
        event.preventDefault();
        refreshEditor(name);
        return;
      }
      if(index<0)return;
      // Avoid a redraw at pointerdown: the SVG circle must remain present to
      // initiate pointer capture. The SVG itself retains capture during redraws.
      event.preventDefault();
      if(name==="water")state.waterSite=index;
      editor.active={id:event.pointerId,index,moved:false,start:coord};
      svg.setPointerCapture?.(event.pointerId);
    });
    svg.addEventListener("pointermove",function(event){
      const drag=editor.active;
      if(!drag || drag.id!==event.pointerId)return;
      const coord=sceneCoords(svg,event);
      if(!coord)return;
      const p=[Math.max(0,Math.min(1,coord[0])),Math.max(0,Math.min(1,coord[1]))];
      if(!validPoint(editor.points,p,drag.index))return;
      if(dist(editor.points[drag.index],p)<0.0005)return;
      drag.moved=true;
      editor.points[drag.index]=p;
      if(!editor.pending){
        editor.pending=true;
        const generation=editor.generation;
        requestAnimationFrame(function(){
          editor.pending=false;
          if(editor.generation===generation)refreshEditor(name);
        });
      }
    });
    function release(event){
      if(!editor.active || editor.active.id!==event.pointerId)return;
      const wasMoved=editor.active.moved;
      editor.active=null;
      if(svg.hasPointerCapture?.(event.pointerId))svg.releasePointerCapture(event.pointerId);
      if(!wasMoved)editor.render();
    }
    svg.addEventListener("pointerup",release);
    svg.addEventListener("pointercancel",release);
  }
  document.querySelectorAll("[data-editor-scene][data-mode]").forEach(function(button){
    button.addEventListener("click",function(){
      setEditorMode(button.dataset.editorScene,button.dataset.mode);
    });
  });
  document.querySelectorAll("[data-editor-reset]").forEach(function(button){
    button.addEventListener("click",function(){
      resetEditor(button.dataset.editorReset);
    });
  });
}

if(typeof module!=="undefined" && module.exports){
  module.exports={triangulate,validPoint};
}
