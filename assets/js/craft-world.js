/* Overworld hero: the floating voxel world from the Minecraft-style portfolio, alive.
   Art is procedural (tools/craft/art.py -> assets/img/craft). The island drifts like a title-screen panorama,
   voxel clouds pass over it with shadows, the two RAAR aircraft fly in and the drone docks under the mothership
   (magnets!), Nathan waves from the workshop, XP orbs float up, and clicking the world breaks a block.
   Paced by ncPerf like the other heroes; one still frame for reduced motion. */
(function(){
"use strict";
const root=document.documentElement,hero=document.getElementById("hero"),cvs=document.getElementById("mcWorld");
const ctx=cvs&&cvs.getContext&&cvs.getContext("2d");if(!ctx)return;
const REDUCE=matchMedia("(prefers-reduced-motion: reduce)").matches;
const skin=()=>root.dataset.skin||"spider";
const SRC="assets/img/craft/",IMG={};
const NAMES=["hero-world.webp","plane-mother.png","plane-drone.png","cloud0.png","cloud1.png","cloud2.png","avatar.png","avatar-wave.png"];
let loaded=null;
function load(){
  if(loaded)return loaded;
  loaded=Promise.all(NAMES.map(n=>new Promise(res=>{const i=new Image();i.decoding="async";i.onload=()=>{IMG[n]=i;res()};i.onerror=res;i.src=SRC+n})));
  return loaded;
}
// world-image pixel spots: the workshop door, where Nathan stands
const HOME={x:1119,y:540},WORLD_W=1800,WORLD_H=900,Z=.75; // world image is drawn at 3/4 block size; sprites match it with Z
let W=0,H=0,dpr=1,s=1,on=false,vis=true,raf=0,last=0,t=0,mx=0,px=0;
let clouds=[],orbs=[],bits=[],flight=null,nextFlight=2.5,waveT=0;
const rnd=(a,b)=>a+Math.random()*(b-a);

function resize(){
  const r=hero.getBoundingClientRect();if(!r.width||!r.height)return;
  W=r.width;H=r.height;dpr=Math.max(.6,Math.min(1.5,devicePixelRatio||1)*(window.ncPerf?ncPerf.res("hero"):1));
  cvs.width=Math.round(W*dpr);cvs.height=Math.round(H*dpr);
  s=Math.max(W*1.14/WORLD_W,H*1.06/WORLD_H); // cover the hero with room to pan
  if(!clouds.length)for(let i=0;i<6;i++)clouds.push({x:rnd(-.2,1),y:rnd(.05,.75),k:i%3,v:rnd(6,12),d:rnd(.6,1.15)});
  if(!REDUCE)paint(performance.now(),0);
}
// screen position of a world-image pixel at the current pan
function view(){const panW=WORLD_W*s-W,panH=WORLD_H*s-H;return{ox:-panW*(.5+.5*Math.sin(t/38))-px*18,oy:-panH*.5+Math.sin(t/23)*panH*.25}}

function startFlight(){flight={p:0,dur:11,docked:false,spark:0}}
function drawPlanes(g,v){
  const f=flight;if(!f)return;
  const m=IMG["plane-mother.png"],dr=IMG["plane-drone.png"];if(!m||!dr)return;
  const k=s*1.25*Z,p=f.p,dx=-W-m.width*k*2,dy=dx*.5; // fly up-left along the isometric x axis
  const mx0=W+m.width*k,my0=H*.62,mxp=mx0+dx*p,myp=my0+dy*p;
  // the drone closes in from behind and below, then rides docked under the mothership
  const close=Math.min(1,p/.5),e=1-Math.pow(1-close,3);
  const ox=(150-110*e)*k/1.5,oy=(110-82*e)*k/1.5;
  if(!f.docked&&close>=1){f.docked=true;f.spark=1;for(let i=0;i<22;i++)bits.push({x:mxp+ox+dr.width*k*.4,y:myp+oy+dr.height*k*.2,vx:rnd(-80,80),vy:rnd(-90,30),l:rnd(.5,1),c:Math.random()<.5?"#FF55FF":"#55FFFF",sz:3})}
  for(const[im,x,y]of[[m,mxp,myp],[dr,mxp+ox,myp+oy]]){ // soft shadows on the ground first
    g.globalAlpha=.18;g.drawImage(im,x+30*k,y+150*k,im.width*k,im.height*k*.5);g.globalAlpha=1}
  g.drawImage(m,mxp,myp,m.width*k,m.height*k);g.drawImage(dr,mxp+ox,myp+oy,dr.width*k,dr.height*k);
  if(f.docked&&Math.sin(t*14)>0){g.fillStyle="#FF55FF";g.fillRect(mxp+ox+dr.width*k*.45,myp+oy-3*k,4*k,4*k)}
}
function paint(now,dt){
  const g=ctx;g.setTransform(dpr,0,0,dpr,0,0);g.imageSmoothingEnabled=false;
  g.fillStyle="#7DB1F2";g.fillRect(0,0,W,H);
  const v=view(),world=IMG["hero-world.webp"];
  if(world)g.drawImage(world,v.ox,v.oy,WORLD_W*s,WORLD_H*s);
  // Nathan at the workshop door; waves every few seconds
  const av=IMG[(waveT>0&&Math.sin(t*9)>-.3)?"avatar-wave.png":"avatar.png"];
  if(av){const k=s*1.5*Z,x=v.ox+HOME.x*s-8*k,y=v.oy+HOME.y*s-32*k+Math.sin(t*2)*.6;g.fillStyle="rgba(0,0,0,.25)";g.fillRect(x+2*k,y+31*k,12*k,2*k);g.drawImage(av,x,y,16*k,32*k)}
  // XP orbs drifting up around the workshop
  for(const o of orbs){const a=Math.max(0,Math.min(1,o.l*2));g.fillStyle=`rgba(${Math.round(150+80*Math.sin(t*6+o.ph))},255,40,${a.toFixed(2)})`;
    const x=v.ox+o.x*s,y=v.oy+o.y*s;g.fillRect(x-3,y-3,6,6);g.fillStyle=`rgba(40,90,0,${(a*.8).toFixed(2)})`;g.fillRect(x-3,y+3,6,2)}
  drawPlanes(g,v);
  // clouds: shadow on the ground, then the voxel cloud
  for(const c of clouds){const im=IMG[`cloud${c.k}.png`];if(!im)continue;const k=s*1.1*Z*c.d,x=c.x*W,y=c.y*H;
    g.globalAlpha=.16;g.drawImage(im,x+60*k,y+120*k,im.width*k,im.height*k);g.globalAlpha=.93;g.drawImage(im,x,y,im.width*k,im.height*k);g.globalAlpha=1}
  for(const b of bits){g.fillStyle=b.c;g.globalAlpha=Math.max(0,Math.min(1,b.l*2));g.fillRect(b.x,b.y,b.sz||5,b.sz||5)}g.globalAlpha=1;
}
function step(dt){
  t+=dt;px+=(mx-px)*Math.min(1,dt*2.5);
  for(const c of clouds){c.x+=c.v*dt/W*c.d;c.y+=c.v*.5*dt/H*c.d;if(c.x>1.15||c.y>1.05){c.x=rnd(-.45,-.15);c.y=rnd(-.15,.55)}}
  if(Math.random()<dt*1.6&&orbs.length<14)orbs.push({x:HOME.x+rnd(-70,70),y:HOME.y+rnd(-10,30),l:rnd(1.4,2.4),ph:rnd(0,6)});
  for(const o of orbs){o.y-=dt*14;o.x+=Math.sin(t*2+o.ph)*dt*6;o.l-=dt}orbs=orbs.filter(o=>o.l>0);
  for(const b of bits){b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=420*dt;b.l-=dt}bits=bits.filter(b=>b.l>0);
  if(waveT>0)waveT-=dt;else if(Math.random()<dt*.18)waveT=1.6;
  if(!flight&&t>nextFlight)startFlight();
  if(flight){flight.p+=dt/flight.dur;if(flight.p>=1){flight=null;nextFlight=t+rnd(8,14)}}
}
function frame(now){
  raf=0;
  if(now-last<(window.ncPerf?ncPerf.minDt("hero"):16)){if(on&&vis&&!document.hidden)raf=requestAnimationFrame(frame);return}
  const dt=Math.min(.05,(now-last)/1000);last=now;step(dt);paint(now,dt);
  if(on&&vis&&!document.hidden)raf=requestAnimationFrame(frame);
}
function sync(){
  on=skin()==="craft";
  if(!on){if(raf){cancelAnimationFrame(raf);raf=0}return}
  load().then(()=>{
    if(!on)return;if(!W)resize();
    if(REDUCE){t=30;paint(0,0);return}
    if(vis&&!document.hidden&&!raf){last=performance.now();raf=requestAnimationFrame(frame)}
  });
}
// break a block where you click the world (not on buttons or text)
hero.addEventListener("pointerdown",e=>{
  if(!on||REDUCE||e.target.closest("a,button,.photo,h1,p,li,.bubble"))return;
  const r=hero.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,cols=["#5E9C3A","#74B34C","#8A5F3C","#6B4729","#7F7F7F"];
  for(let i=0;i<16;i++)bits.push({x,y,vx:rnd(-150,150),vy:rnd(-260,-60),l:rnd(.5,.9),c:cols[i%cols.length]});
  orbs.push({x:(x-view().ox)/s,y:(y-view().oy)/s,l:1.6,ph:0});
});
hero.addEventListener("pointermove",e=>{const r=hero.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5},{passive:true});
new ResizeObserver(()=>{if(on){resize()}else W=0}).observe(hero);
new IntersectionObserver(([e])=>{vis=e.isIntersecting;sync()},{rootMargin:"-84px 0px 0px 0px"}).observe(hero);
document.addEventListener("visibilitychange",sync);
document.addEventListener("skinchange",sync);
document.addEventListener("qualitychange",()=>{if(on&&W)resize()});
sync();
})();
