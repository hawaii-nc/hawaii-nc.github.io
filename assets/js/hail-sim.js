/* Hail Mary scenes, full-bleed and part of the page.
   Spacewalk: Grace on a tether above the ship's hull, Adrian filling the sky, a churning green and orange
   storm world. Flip the IR camera on and the whole site goes red and fills with drifting Astrophage.
   First contact: steer the Hail Mary and pulse its spin drive. The xenonite ship mirrors your moves and
   echoes your pulses. Build the tunnel and the engineer walks over for a fist bump.
   Everything is drawn in code from the novel's descriptions. Nothing is traced from the film. */
(function(){
"use strict";
const $=id=>document.getElementById(id),root=document.documentElement;
const REDUCE=matchMedia("(prefers-reduced-motion: reduce)").matches;
const hail=()=>root.dataset.skin==="hail";
const still=()=>REDUCE||!!(window.ncLite&&ncLite());
const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const mix=(a,b,t,al=1)=>`rgba(${Math.round(lerp(a[0],b[0],t))},${Math.round(lerp(a[1],b[1],t))},${Math.round(lerp(a[2],b[2],t))},${al})`;
const FONT="-apple-system,BlinkMacSystemFont,Inter,system-ui,sans-serif",MONO="'IBM Plex Mono',ui-monospace,Menlo,monospace";
let g=null,W=0,H=0,mob=false,T=0,raf=0,last=0,awake=0,IR=false,IRK=0;
const rr=(x,y,w,h,r)=>{g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h)};

/* ---------- the sky: one fragment shader. A storm-banded planet from domain-warped noise, stars,
   and an IR grade that turns everything red and hazy ---------- */
const VS="attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FS=`precision highp float;
uniform vec2 uRes,uC,uL;uniform float uR,uT,uIR,uSc;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
const mat2 M=mat2(.8,.6,-.6,.8);
float fbm(vec2 p){float a=0.,w=.5;for(int i=0;i<5;i++){a+=w*n(p);p=M*p*2.03;w*=.5;}return a;}
void main(){
  vec2 fc=gl_FragCoord.xy,d=(fc-uC)/uR;float r=length(d);
  vec2 cs=fc/uRes.y*380.;vec2 ci=floor(cs);float hs=h(ci);
  vec3 col=vec3(step(.986,hs)*smoothstep(.45,.0,length(fract(cs)-.5))*(.35+.65*h(ci+7.)));
  if(r<1.){
    float z=sqrt(1.-r*r);vec2 p=d/(.35+z)*uSc+vec2(uT*.004,0.);float t=uT*.035;
    vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t));
    vec2 s=vec2(fbm(p+3.6*q+vec2(1.7,9.2)+t*1.4),fbm(p+3.6*q+vec2(8.3,2.8)-t*.8));
    float f=fbm(p+3.2*s);
    vec3 c=mix(vec3(.03,.16,.02),vec3(.2,.66,.05),smoothstep(.12,.68,f));
    c=mix(c,vec3(.62,.98,.16),smoothstep(.4,.9,f*f*2.3)*.85);
    c=mix(c,vec3(.95,.97,.4),smoothstep(.85,1.25,length(s))*.3);
    float org=smoothstep(.44,.7,fbm(p*.42+vec2(3.1,7.4)))*smoothstep(.3,.68,s.y);
    c=mix(c,vec3(.9,.36,.05)*(.55+f*.9),org*.85);
    c+=vec3(.25,.45,.03)*pow(1.-abs(sin(f*24.+q.x*7.)),7.)*.3;
    vec3 nr=vec3(d,z);float lit=clamp(dot(nr,normalize(vec3(uL,.75)))*1.1+.3,0.,1.15);
    c*=lit*mix(.22,1.1,pow(z,.5))*1.35;c=pow(c,vec3(1.08));
    col=mix(col,c,smoothstep(1.,.994,r));
  }
  col+=vec3(.3,.75,.15)*exp(-max(r-1.,0.)*uR/uRes.y*30.)*smoothstep(.96,1.,r)*.55;
  float lum=dot(col,vec3(.3,.59,.11)),neb=fbm(fc/uRes.y*2.6+vec2(uT*.01,0.)),neb2=fbm(fc/uRes.y*7.+3.);
  vec3 ir=vec3(1.,.15,.2)*(lum*1.25+.04)+vec3(.5,.04,.08)*pow(neb,2.2)*1.6+vec3(.25,.02,.05)*neb2*.4;
  gl_FragColor=vec4(mix(col,ir,uIR),1.);
}`;
function sky(cv){
  try{
    const gl=cv.getContext("webgl",{antialias:false,alpha:false,depth:false,powerPreference:"high-performance"});if(!gl)return null;
    const sh=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);return o};
    const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
    const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    const U={};for(const k of["uRes","uC","uL","uR","uT","uIR","uSc"])U[k]=gl.getUniformLocation(pr,k);
    return{draw(s,c,r,l,sc){ // c,r in css px with y down
      gl.viewport(0,0,cv.width,cv.height);gl.uniform2f(U.uRes,cv.width,cv.height);gl.uniform2f(U.uC,c[0]*s,cv.height-c[1]*s);gl.uniform1f(U.uR,r*s);
      gl.uniform2f(U.uL,l[0],l[1]);gl.uniform1f(U.uT,T);gl.uniform1f(U.uIR,IRK);gl.uniform1f(U.uSc,sc);gl.drawArrays(gl.TRIANGLES,0,3)}};
  }catch(e){return null}
}

/* ---------- bokeh: Astrophage through a defocused IR lens ---------- */
let SOFT=null,DISC=null;
function sprites(){
  SOFT=document.createElement("canvas");SOFT.width=SOFT.height=64;let x=SOFT.getContext("2d"),gr=x.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,"rgba(255,240,240,1)");gr.addColorStop(.16,"rgba(255,150,165,.95)");gr.addColorStop(.42,"rgba(255,50,80,.3)");gr.addColorStop(1,"rgba(255,0,50,0)");x.fillStyle=gr;x.fillRect(0,0,64,64);
  DISC=document.createElement("canvas");DISC.width=DISC.height=64;x=DISC.getContext("2d");gr=x.createRadialGradient(32,32,0,32,32,31);
  gr.addColorStop(0,"rgba(255,140,150,.16)");gr.addColorStop(.78,"rgba(255,150,160,.22)");gr.addColorStop(.92,"rgba(255,200,205,.5)");gr.addColorStop(1,"rgba(255,160,170,0)");x.fillStyle=gr;x.fillRect(0,0,64,64);
}
function makeDots(n,seed){let s=seed;const R=()=>(s=(s*16807)%2147483647)/2147483647;
  return Array.from({length:n},()=>{const z=R(),big=z>.975,mid=z>.84;return{x:R(),y:R(),z,r:big?9+R()*16:mid?2.6+R()*4:.7+R()*1.6,big,ph:R()*TAU,f:.6+R()*3,vx:(R()-.5)*.006,vy:-.002-R()*.008}})}
function bokeh(list,k,dt,px,py,oy,front){
  g.save();g.globalCompositeOperation="lighter";
  for(const d of list){
    if(front!==undefined&&(d.z>.62)!==front)continue;
    d.x=(d.x+d.vx*dt+1)%1;d.y=(d.y+d.vy*dt+1)%1;
    const x=((d.x+px*d.z*.04)%1+1)%1*(W+80)-40,y=((d.y+py*d.z*.04+oy*d.z)%1+1)%1*(H+80)-40,fl=Math.sin(T*d.f+d.ph);
    const a=k*(d.big?.4:(.3+.7*fl*fl)*(.5+.5*d.z));if(a<.03)continue;
    g.globalAlpha=a;const r=d.big?d.r:d.r*(1+.25*fl);g.drawImage(d.big?DISC:SOFT,x-r,y-r,r*2,r*2);
  }
  g.restore();g.globalAlpha=1;
}

/* ---------- scene plumbing ---------- */
const scenes=[];
function scene(id,layout,draw){
  const sec=$(id);if(!sec)return null;
  const S={sec,id,glc:sec.querySelector(".scene-gl"),fx:sec.querySelector(".scene-fx"),W:0,H:0,dpr:1,vis:false,mob:false,px:.5,py:.5,layout,draw};
  S.ctx=S.fx.getContext("2d");S.sky=sky(S.glc);if(!S.sky)S.glc.style.background="radial-gradient(120% 90% at 55% -10%,#3f8a1c,#123a0c 55%,#000 80%)";
  new IntersectionObserver(es=>{S.vis=es[0].isIntersecting;if(S.id==="eva")root.classList.toggle("ir-here",S.vis);kick();if(S.vis&&still())paint(S,0)},{rootMargin:"60px"}).observe(sec);
  scenes.push(S);return S;
}
function size(S){
  const r=S.sec.getBoundingClientRect();if(!r.width||!r.height)return false;
  const res=window.ncPerf?ncPerf.res("hero"):1,d=Math.max(.75,Math.min(2,devicePixelRatio||1)*res),w=Math.round(r.width),h=Math.round(r.height);
  if(w===S.W&&h===S.H&&d===S.dpr)return true;
  S.W=w;S.H=h;S.dpr=d;S.mob=w<700||h>w;S.fx.width=Math.round(w*d);S.fx.height=Math.round(h*d);
  S.gs=Math.min(d,1.5)*(S.mob?.6:.55);S.glc.width=Math.round(w*S.gs);S.glc.height=Math.round(h*S.gs);
  W=w;H=h;mob=S.mob;S.layout(S);return true;
}
function paint(S,dt){
  if(!size(S))return;W=S.W;H=S.H;mob=S.mob;g=S.ctx;
  g.setTransform(S.dpr,0,0,S.dpr,0,0);g.globalCompositeOperation="source-over";g.globalAlpha=1;g.clearRect(0,0,W,H);
  const r=S.sec.getBoundingClientRect();S.sp=clamp((r.top+r.height/2-innerHeight/2)/innerHeight,-1.2,1.2);
  S.draw(S,dt);
}
function cap(el,t){if(el&&el.textContent!==t)el.textContent=t}

/* ---------- Grace from behind, rim-lit by the planet. Local units: 100 tall, origin at the waist ---------- */
function astroBack(x,y,s,ang,t,rim,dark){
  g.save();g.translate(x,y);g.rotate(ang);g.scale(s/100,s/100);g.lineCap="round";g.lineJoin="round";
  const a=Math.sin(t*.7),b=Math.sin(t*.55+1.2);
  const body=(col,ox,oy)=>{
    g.fillStyle=col;g.strokeStyle=col;g.save();g.translate(ox,oy);
    const L=(w,pts)=>{g.lineWidth=w;g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.stroke()};
    L(14,[-19,-44,-32+b*2,-26,-35+b*3,-9]);L(14,[19,-44,31-a*2,-29,37-a*3,-13]);
    L(17,[-8,-4,-12+a*3,14,-10+a*4,31]);L(17,[8,-4,11-b*2,13,15-b*3,28]);
    g.beginPath();g.ellipse(-10+a*4,35,9,5.5,0,0,TAU);g.fill();g.beginPath();g.ellipse(15-b*3,32,9,5.5,.3,0,TAU);g.fill();
    rr(-22,-52,44,46,13);g.fill();rr(-17,-12,34,14,6);g.fill();
    g.beginPath();g.arc(0,-62,13,0,TAU);g.fill();
    rr(-18,-58,36,42,6);g.fill();
    g.restore();
  };
  body(rim,0,0);body(dark,.9,1.7);
  g.fillStyle="rgba(255,255,255,.06)";rr(-14,-53,28,9,2);g.fill();rr(-14,-39,28,3,1);g.fill();rr(-14,-33,28,3,1);g.fill();
  g.fillStyle=(t%1.8)<.9?"#FFB340":"rgba(255,179,64,.25)";g.beginPath();g.arc(12,-49,1.6,0,TAU);g.fill();
  g.restore();
}
// the ship's hull from above and behind: ring frames receding toward the planet. Original design
function hullTop(cx,by,w,h,rim,dark,t){
  const R0=w/2,rf=R0*.6,ny=by+R0*.42,fy=by-h+rf,N=10,ring=i=>{const u=1-1/(1+i*.28),f=u/(1-1/(1+N*.28));return{y:lerp(ny,fy,f),r:lerp(R0,rf,f)}};
  g.save();
  // a boom and a tank out to the right, the ship's service truss
  const ty=by-h*.38;g.fillStyle=dark;g.fillRect(cx,ty-h*.025,W,h*.05);rr(cx+w*.6,ty-h*.14,W,h*.28,h*.14);g.fill();
  g.strokeStyle=rim;g.globalAlpha=.55;g.lineWidth=1.5;g.beginPath();g.moveTo(cx+w*.6+h*.14,ty-h*.14);g.lineTo(W,ty-h*.14);g.stroke();g.globalAlpha=1;
  // body: near ring, tangents, far ring
  g.beginPath();g.arc(cx,ny,R0,Math.PI,TAU);g.lineTo(cx+rf,fy);g.arc(cx,fy,rf,0,Math.PI,true);g.closePath();
  const gr=g.createLinearGradient(0,fy-rf,0,by);gr.addColorStop(0,rim.replace(/[\d.]+\)$/,".22)"));gr.addColorStop(.18,dark);gr.addColorStop(1,"#000");g.fillStyle=dark;g.fill();g.fillStyle=gr;g.fill();
  g.save();g.clip();g.strokeStyle=rim;
  for(let i=0;i<=N;i++){const{y,r}=ring(i);g.globalAlpha=(i%3?.07:.16)+.22*(i/N);g.lineWidth=i%3?1:2;g.beginPath();g.arc(cx,y,r,Math.PI*1.04,Math.PI*1.96);g.stroke()}
  g.globalAlpha=.07;g.lineWidth=1;for(let th=1.1;th<1.92;th+=.11){const c=Math.cos(th*Math.PI),s=Math.sin(th*Math.PI);g.beginPath();g.moveTo(cx+c*R0,ny+s*R0);g.lineTo(cx+c*rf,fy+s*rf);g.stroke()}
  // handrail along the spine
  g.globalAlpha=.7;g.strokeStyle="rgba(255,190,70,.8)";g.lineWidth=2;const r2=ring(2),r7=ring(7);g.beginPath();g.moveTo(cx-r2.r*.3,r2.y-r2.r*.95);g.lineTo(cx-r7.r*.3,r7.y-r7.r*.95);g.stroke();
  g.restore();
  g.strokeStyle=rim;g.globalAlpha=.95;g.lineWidth=2;g.beginPath();g.arc(cx,fy,rf,Math.PI*1.02,Math.PI*1.98);g.stroke();
  g.globalAlpha=.6;g.beginPath();g.moveTo(cx-R0,ny);g.lineTo(cx-rf,fy);g.moveTo(cx+R0,ny);g.lineTo(cx+rf,fy);g.stroke();g.globalAlpha=1;
  // dish antenna on a short mast, nav light
  const m=ring(6),mx=cx+m.r*.2,my=m.y-m.r*.98,mh=h*.32;
  g.strokeStyle=dark;g.lineWidth=5;g.beginPath();g.moveTo(mx,my);g.lineTo(mx,my-mh);g.stroke();g.strokeStyle=rim;g.globalAlpha=.6;g.lineWidth=1;g.beginPath();g.moveTo(mx-2.5,my);g.lineTo(mx-2.5,my-mh);g.stroke();g.globalAlpha=1;
  g.fillStyle=dark;g.beginPath();g.ellipse(mx+6,my-mh-6,h*.13,h*.055,-.5,0,TAU);g.fill();g.strokeStyle=rim;g.lineWidth=1.5;g.beginPath();g.ellipse(mx+6,my-mh-6,h*.13,h*.055,-.5,Math.PI,TAU);g.stroke();
  const n=ring(1);g.fillStyle=(t%1.4)<.25?"#5BFF8C":"rgba(91,255,140,.15)";g.beginPath();g.arc(cx-n.r*.8,n.y-n.r*.58,2.8,0,TAU);g.fill();
  g.restore();
  const q=ring(3);return{x:cx-q.r*.55,y:q.y-q.r*.83};
}

/* ---------- scene 1: spacewalk ---------- */
const evaCap=$("evaCap");
function evaLayout(S){
  const k=W>H*1.1?2.3:1.4;S.pc=[W*.62,-H*k];S.pr=H*(k+1.04);S.sc=mob?4.6:6;
  S.hull={cx:W*(mob?.6:.56),w:mob?W*1.05:Math.min(W*.5,H*.95),h:H*(mob?.34:.42)};S.s=H*(mob?.2:.27);
  if(!S.gx){S.gx=S.tx=W*(mob?.4:.38);S.gy=S.ty=H*(mob?.5:.46);S.vx=S.vy=0;S.ang=0;S.last=-9}
  if(!S.dots)S.dots=makeDots(Math.round((mob?1300:1800)*(window.ncPerf&&ncPerf.tier>1?.55:1)),17);
}
function evaDraw(S,dt){
  const sh=S.sp*H;
  if(S.sky)S.sky.draw(S.gs,[S.pc[0],S.pc[1]+sh*.25],S.pr,[.25,.35],S.sc);
  // Grace drifts on the tether toward you, or loafs around when nobody is steering
  if(T-S.last>4){const u=T*.1;S.tx=W*(mob?.42:.38)+Math.sin(u)*W*.12;S.ty=H*.45+Math.sin(u*1.7)*H*.08}
  const ax=(S.tx-S.gx)*1.6-S.vx*1.8,ay=(S.ty-S.gy)*1.6-S.vy*1.8;S.vx+=ax*dt;S.vy+=ay*dt;S.gx+=S.vx*dt;S.gy+=S.vy*dt;
  S.ang=lerp(S.ang,clamp(S.vx/W*1.3,-.4,.4)+Math.sin(T*.35)*.08,1-Math.exp(-dt*2));
  const k=IRK,rim=mix([170,255,90],[255,120,140],k,.95),dark=mix([8,14,8],[34,4,8],k),pxo=S.px-.5,pyo=S.py-.5;
  if(k>.01)bokeh(S.dots,k,dt,pxo,pyo,0,false);
  const hc=S.hull,a=hullTop(hc.cx-pxo*14,H+sh*.1+hc.h*.05,hc.w,hc.h,rim,dark,T);
  const bx=S.gx+S.s*.02,by=S.gy+S.s*.02,mx=(a.x+bx)/2+Math.sin(T*.5)*24,my=Math.max(a.y,by)+H*.05;
  g.strokeStyle=k>.5?"rgba(255,140,150,.5)":"rgba(170,230,120,.45)";g.lineWidth=1.6;g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo(mx,my,bx,by);g.stroke();
  astroBack(S.gx,S.gy,S.s,S.ang,T,rim,dark);
  if(k>.01)bokeh(S.dots,k,0,pxo,pyo,0,true);
  // a little camera chrome
  const pad=mob?14:22;g.font=`500 ${mob?10:11}px ${MONO}`;g.textBaseline="bottom";g.textAlign="right";
  g.fillStyle=k>.5?"rgba(255,130,150,.85)":"rgba(235,235,245,.55)";if(!mob)g.fillText(k>.5?"IR · 25.984 µm · PETROVA":"EVA CAM 2 · ADRIAN ORBIT",W-pad,H-pad-8);g.textAlign="left";
}

/* ---------- ships (original). Local units: length 100, nose at +50 ---------- */
function beam(len,w,k,cols){
  if(k<=.01)return;g.save();g.globalCompositeOperation="lighter";
  const gr=g.createLinearGradient(0,0,-len,0);gr.addColorStop(0,`rgba(255,255,255,${k})`);gr.addColorStop(.15,`rgba(${cols},${.8*k})`);gr.addColorStop(1,`rgba(${cols},0)`);
  g.fillStyle=gr;g.beginPath();g.moveTo(0,-w);g.lineTo(-len,-w*.25);g.lineTo(-len,w*.25);g.lineTo(0,w);g.closePath();g.fill();
  const rg=g.createRadialGradient(0,0,0,0,0,w*4);rg.addColorStop(0,`rgba(255,220,230,${.7*k})`);rg.addColorStop(1,"rgba(255,80,130,0)");g.fillStyle=rg;g.fillRect(-w*4,-w*4,w*8,w*8);
  g.restore();
}
function hailMary(x,y,L,ang,dir,flare){
  g.save();g.translate(x,y);g.rotate(ang);g.scale(dir*L/100,L/100);
  g.save();g.translate(-52,0);beam(60+190*flare,7,.25+.75*flare,"255,110,150");g.restore();
  let gr=g.createLinearGradient(0,-8,0,8);gr.addColorStop(0,"#8A5A3A");gr.addColorStop(.5,"#C98A55");gr.addColorStop(1,"#4A2E20");
  g.fillStyle=gr;g.beginPath();g.moveTo(-52,-8);g.lineTo(-43,-4.5);g.lineTo(-43,4.5);g.lineTo(-52,8);g.closePath();g.fill();
  g.fillStyle="#3B414D";g.fillRect(-43,-5.5,4,11);g.fillStyle="#7E8796";g.fillRect(-39,-1.3,54,2.6);
  for(let i=0;i<4;i++){const tx=-37+i*12.5;for(const ty of[-8.6,2.4]){gr=g.createLinearGradient(0,ty,0,ty+6.2);gr.addColorStop(0,"#E8C9A0");gr.addColorStop(1,"#9C7650");g.fillStyle=gr;rr(tx,ty,10.5,6.2,2.4);g.fill();
    g.fillStyle="rgba(60,40,25,.45)";g.fillRect(tx+3.4,ty,.7,6.2);g.fillRect(tx+7,ty,.7,6.2)}}
  g.fillStyle="#5E6675";g.fillRect(14,-9,2.2,18);
  gr=g.createLinearGradient(0,-7.5,0,7.5);gr.addColorStop(0,"#FFFFFF");gr.addColorStop(.6,"#D7DCE4");gr.addColorStop(1,"#8E97A6");
  g.fillStyle=gr;rr(16,-7.5,22,15,3);g.fill();g.fillStyle="#FFB340";for(let i=0;i<3;i++)g.fillRect(20+i*5.5,-1.6,2.4,2.4);
  g.fillStyle=gr;g.beginPath();g.moveTo(38,-7.5);g.lineTo(47,-4);g.quadraticCurveTo(52,0,47,4);g.lineTo(38,7.5);g.closePath();g.fill();
  g.fillStyle="#1D2533";g.fillRect(41,-2.4,4.5,1.6);
  g.strokeStyle="#AAB2C0";g.lineWidth=.8;g.beginPath();g.moveTo(26,-7.5);g.lineTo(26,-13);g.stroke();g.fillStyle="#D7DCE4";g.beginPath();g.ellipse(26,-14,3.4,1.4,0,0,TAU);g.fill();
  g.restore();
}
const FACETS=[[50,0,34,-10],[34,-10,10,-15],[10,-15,-20,-15],[-20,-15,-38,-11],[-38,-11,-48,-6],[-48,-6,-48,6],[-48,6,-38,11],[-38,11,-20,15],[-20,15,10,15],[10,15,34,10],[34,10,50,0]];
function blipA(x,y,L,ang,dir,flare){ // no windows: Eridians don't see
  g.save();g.translate(x,y);g.rotate(ang);g.scale(dir*L/100,L/100);
  for(const ey of[-8,0,8]){g.save();g.translate(-53,ey);beam(50+150*flare,3.2,.2+.8*flare,"255,120,160");g.restore()}
  g.fillStyle="#2E2620";for(const ey of[-8,0,8]){rr(-55,ey-2.6,8,5.2,1.5);g.fill()}
  FACETS.forEach(([x0,y0,x1,y1],i)=>{const up=(y0+y1)<0,l=up?.85-i*.05:.42+(i%3)*.06;
    g.fillStyle=`rgb(${Math.round(110*l+40)},${Math.round(97*l+34)},${Math.round(81*l+28)})`;g.beginPath();g.moveTo(0,0);g.lineTo(x0,y0);g.lineTo(x1,y1);g.closePath();g.fill()});
  g.strokeStyle="rgba(30,24,19,.9)";g.lineWidth=.8;g.beginPath();FACETS.forEach(([x0,y0],i)=>i?g.lineTo(x0,y0):g.moveTo(x0,y0));g.closePath();g.stroke();
  g.strokeStyle="rgba(200,184,160,.45)";g.lineWidth=.7;g.beginPath();g.moveTo(-46,0);g.lineTo(48,0);g.stroke();
  g.fillStyle="rgba(170,152,128,.35)";g.fillRect(-6,-15,6,30);
  g.fillStyle="rgba(30,24,19,.5)";for(const[a,b]of[[18,-6],[-12,-9],[-28,4],[6,8],[28,3],[-34,-4]]){g.beginPath();g.arc(a,b,1.2,0,TAU);g.fill()}
  g.restore();
}

/* ---------- scene 2: first contact ---------- */
const fcCap=$("fcCap"),pulseBtn=$("fcPulse"),dockBtn=$("fcDock");
const EC={hist:[],fl:0,bfl:0,pat:[],lastP:-9,echo:null,echoes:0,dock:false,dk:0,tun:0,mt:0,bumped:false};
const FC_IDLE="Something out there is watching you.";
function fcLayout(S){
  EC.L=mob?{pc:[W*.5,H*1.42],pr:H*.78,L:W*.42,box:[W*.1,W*.44,H*.3,H*.42],mir:H*.17,dockY:H*.62}
          :{pc:[W*.5,H*1.9],pr:H*1.25,L:Math.min(W*.24,H*.5),box:[W*.08,W*.36,H*.32,H*.6],mir:0,dockY:H*.6};
  if(!EC.x||EC.W!==W){EC.x=EC.tx=lerp(EC.L.box[0],EC.L.box[1],.55);EC.y=EC.ty=lerp(EC.L.box[2],EC.L.box[3],.5);EC.vx=EC.vy=EC.a=0;EC.W=W}
  if(!EC.art){EC.art=document.createElement("canvas");EC.art.width=96;EC.art.height=40;EC.ag=EC.art.getContext("2d");EC.ag.imageSmoothingEnabled=false}
}
function pulse(){if(EC.dock)return;EC.fl=1;if(T-EC.lastP>1.5||EC.echo){EC.pat=[];EC.echo=null}if(EC.pat.length<9)EC.pat.push(T);EC.lastP=T;wake(6)}
function sample(t){const h=EC.hist;let i=h.length-1;while(i>0&&h[i].t>t)i--;return h[i]||{x:EC.x,y:EC.y,a:0}}
function fcDraw(S,dt){
  const L=EC.L;
  if(S.sky)S.sky.draw(S.gs,[L.pc[0],L.pc[1]+S.sp*H*.15],L.pr,[.45,.8],mob?2.2:2.6);
  EC.dk=clamp(EC.dk+(EC.dock?dt:-dt)/1.4,0,1);const dk=ease(EC.dk);
  if(EC.dock&&EC.dk>=1)EC.tun=Math.min(1,EC.tun+dt/1.6);else if(!EC.dock)EC.tun=Math.max(0,EC.tun-dt/.8);
  EC.mt=EC.tun>=1?EC.mt+dt:0;
  const ax=(EC.tx-EC.x)*4-EC.vx*3.2,ay=(EC.ty-EC.y)*4-EC.vy*3.2;EC.vx+=ax*dt;EC.vy+=ay*dt;EC.x+=EC.vx*dt;EC.y+=EC.vy*dt;
  EC.a=lerp(EC.a,clamp(EC.vy/H*1.4,-.45,.45),1-Math.exp(-dt*4));
  EC.hist.push({t:T,x:EC.x,y:EC.y,a:EC.a});while(EC.hist.length>2&&EC.hist[1].t<T-2)EC.hist.shift();
  const old=sample(T-.85),Ls=lerp(1,mob?.6:.86,dk),Lh=L.L*Ls,Lb=L.L*1.3*Ls;
  const hm={x:lerp(EC.x,W*(mob?.27:.3),dk),y:lerp(EC.y,L.dockY,dk),a:lerp(EC.a,0,dk)};
  const bl={x:lerp(W-old.x,W*(mob?.71:.7),dk),y:lerp(old.y+L.mir,L.dockY,dk),a:lerp(-old.a,0,dk)};
  if(EC.pat.length&&!EC.echo&&T-EC.lastP>1.3)EC.echo={t0:T+.45,ts:EC.pat.map(p=>p-EC.pat[0]),i:0,done:false};
  if(EC.echo&&!EC.echo.done){const e=EC.echo;
    while(e.i<e.ts.length&&T>=e.t0+e.ts[e.i]){EC.bfl=1;e.i++;window.ncEri&&ncEri.say(["one","two","three","four","five","six","seven","eight","nine"][e.i-1])}
    if(e.i>=e.ts.length&&T>e.t0+e.ts[e.ts.length-1]+.6){e.done=true;EC.echoes++;const n=e.ts.length;
      cap(fcCap,n===1?"One flash out, one flash back. It's paying attention.":`${n} pulses out, ${n} back, same rhythm. Somebody's home. Try another rhythm, or build the tunnel.`)}}
  EC.fl=Math.max(0,EC.fl-dt*2.2);EC.bfl=Math.max(0,EC.bfl-dt*2.2);
  for(const[s,k]of[[hm,EC.fl],[bl,EC.bfl]])if(k>.02){g.save();g.globalCompositeOperation="lighter";const r=L.L*1.6,gr=g.createRadialGradient(s.x,s.y,0,s.x,s.y,r);gr.addColorStop(0,`rgba(255,120,160,${.22*k})`);gr.addColorStop(1,"rgba(255,80,130,0)");g.fillStyle=gr;g.fillRect(s.x-r,s.y-r,r*2,r*2);g.restore()}
  if(EC.tun>0){const n0=bl.x-Lb*.5,n1=hm.x+Lh*.5,x=lerp(n0,n1,ease(EC.tun)),th=Lh*.11;
    const gr=g.createLinearGradient(0,bl.y-th,0,bl.y+th);gr.addColorStop(0,"#9A8A74");gr.addColorStop(.5,"#6E6151");gr.addColorStop(1,"#3E352C");g.fillStyle=gr;g.fillRect(x,bl.y-th,n0-x,th*2);
    g.fillStyle="rgba(30,24,19,.6)";for(let r=n0-8;r>x;r-=14)g.fillRect(r,bl.y-th,2,th*2)}
  hailMary(hm.x,hm.y,Lh,hm.a,1,EC.fl);blipA(bl.x,bl.y,Lb,bl.a,-1,EC.bfl);
  // labels, with each ship's pulse readout under it
  const fs=mob?11:12;g.font=`600 ${fs}px ${FONT}`;g.textAlign="center";g.textBaseline="top";g.fillStyle="rgba(235,235,245,.75)";
  const ly1=hm.y+Lh*.16+8,ly2=bl.y+Lb*.17+8;g.fillText("Hail Mary",hm.x,ly1);g.fillText(EC.echoes||EC.dock?"Blip-A":"Unknown contact",bl.x,ly2);g.textAlign="left";
  if(!EC.dock){const n=EC.pat.length,lit=EC.echo?EC.echo.i:0;
    for(let i=0;i<n;i++){g.fillStyle="#FF8FA8";g.beginPath();g.arc(hm.x+(i-(n-1)/2)*12,ly1+fs+10,3.5,0,TAU);g.fill();
      g.fillStyle=i<lit?"#FFB340":"rgba(255,255,255,.18)";g.beginPath();g.arc(bl.x+(i-(n-1)/2)*12,ly2+fs+10,3.5,0,TAU);g.fill()}}
  if(EC.tun>=1)tunnelCam();
}
function tunnelCam(){
  const a=EC.ag,P=window.ncPx,mt=EC.mt;a.clearRect(0,0,96,40);
  a.fillStyle="#0E1622";a.fillRect(0,4,47,32);a.fillStyle="#2A1D12";a.fillRect(49,4,47,32);
  a.fillStyle="rgba(159,216,255,.25)";for(let x=4;x<44;x+=10)a.fillRect(x,6,5,1);
  a.fillStyle="rgba(255,180,90,.2)";for(let i=0;i<14;i++)a.fillRect(50+((i*37+(T*3|0))%45),6+((i*13)%28),1,1);
  a.fillStyle="#6E6151";a.fillRect(0,0,96,4);a.fillRect(0,36,96,4);a.fillStyle="#5A4D40";for(let x=0;x<96;x+=5){a.fillRect(x,3,2,1);a.fillRect(x+2,36,2,1)}
  a.fillStyle="#5A4D40";a.fillRect(47,4,2,32);a.fillStyle="rgba(159,216,255,.6)";a.fillRect(47,12,2,14);a.fillStyle="#9FD8FF";a.fillRect(46,11,4,1);a.fillRect(46,26,4,1);
  const gw=clamp(mt/2.2,0,1),rw=clamp((mt-.3)/2.4,0,1),gx=Math.round(lerp(-8,35,ease(gw))),rx=lerp(98,52,ease(rw)),bump=mt>3;
  if(P){const gy=19,walk=gw<1&&(T*6|0)%2;
    a.fillStyle="#5A3B22";a.fillRect(gx+2,gy,3,1);a.fillRect(gx+1,gy+1,5,1);a.fillStyle="#E6B48F";a.fillRect(gx+2,gy+2,4,3);a.fillRect(gx+3,gy+5,2,1);
    a.fillStyle="#3E6FA8";a.fillRect(gx+1,gy+6,5,5);a.fillStyle="#2B3242";a.fillRect(gx+2,gy+11,1,5-walk);a.fillRect(gx+4,gy+11,1,4+walk);a.fillStyle="#141922";a.fillRect(gx+1,gy+16-walk,2,1);a.fillRect(gx+4,gy+15+walk,2,1);
    a.fillStyle="#3E6FA8";if(bump){a.fillRect(gx+6,gy+7,5,2);a.fillStyle="#E6B48F";a.fillRect(gx+11,gy+7,2,2)}else{a.fillRect(gx,gy+7,1,3);a.fillRect(gx+6,gy+7,1,3)}
    P.eridian(a,rx,25,T,rw<1,bump?0:-1,-1.2)}
  if(mt>3&&mt<3.35){a.fillStyle="#FFFFFF";a.fillRect(46,25,4,4)}
  if(!EC.bumped&&mt>3){EC.bumped=true;window.ncEri&&ncEri.say("fist my bump");cap(fcCap,"Fist my bump. Rocky built the tunnel, the wall and the window in it, in about an hour. You brought the fist.")}
  const iw=mob?W*.92:Math.min(W*.5,600),ih=iw*40/96,ix=(W-iw)/2,iy=mob?Math.max(104,H*.14):Math.max(100,H*.13);
  g.save();g.fillStyle="rgba(0,0,0,.6)";rr(ix-6,iy-6,iw+12,ih+30,14);g.fill();g.strokeStyle="rgba(255,255,255,.18)";g.lineWidth=1;g.stroke();
  g.imageSmoothingEnabled=false;g.drawImage(EC.art,ix,iy,iw,ih);g.imageSmoothingEnabled=true;
  g.font=`500 ${mob?9:10}px ${MONO}`;g.textBaseline="top";g.fillStyle="rgba(159,216,255,.8)";g.fillText("AIR · 1 ATM · 21°C",ix+2,iy+ih+7);
  g.textAlign="right";g.fillStyle="rgba(255,190,120,.85)";g.fillText("AMMONIA · 29 ATM · 210°C",ix+iw-2,iy+ih+7);g.textAlign="left";
  if(mt>3.1&&mt<7.5){const k=Math.min(1,(mt-3.1)*4,(7.5-mt)*2),bx=ix+iw*.5,by=iy-2;g.globalAlpha=k;g.font=`600 ${mob?13:15}px ${FONT}`;g.textAlign="center";g.textBaseline="bottom";
    const tw=g.measureText("♪ Fist my bump ♪").width+24;g.fillStyle="rgba(255,179,64,.95)";rr(bx-tw/2,by-30,tw,26,13);g.fill();g.fillStyle="#1A1206";g.fillText("♪ Fist my bump ♪",bx,by-10);g.textAlign="left"}
  g.restore();
}

/* ---------- the page-wide IR camera ---------- */
const pc=$("irDots"),pg=pc&&pc.getContext("2d");let PD=null,pdW=0,pdH=0;
// soft blurry dots don't need sharp pixels: drawn at 3/4 resolution, ~30 fps, and skipped while the
// spacewalk scene (which has its own, denser field) is on screen
let pdT=0,pdHere=false;
function pageDots(dt){
  if(!pg)return;const here=eva&&eva.vis;pdT+=dt;
  if(here){if(!pdHere){pg.clearRect(0,0,pc.width,pc.height);pdHere=true}return}pdHere=false;
  if(pdT<.03)return;const st=pdT;pdT=0;
  const d=.75,w=innerWidth,h=innerHeight;
  if(w!==pdW||h!==pdH){pdW=w;pdH=h;pc.width=Math.round(w*d);pc.height=Math.round(h*d)}
  if(!PD)PD=makeDots(Math.round((w<700?150:260)*(window.ncPerf&&ncPerf.tier>1?.6:1)),5);
  g=pg;W=w;H=h;g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
  if(IRK>.01)bokeh(PD,IRK*.9,st,0,0,-(scrollY/h)*.35);
}
function setIR(on){
  IR=on&&hail();root.classList.toggle("ir",IR);
  document.querySelectorAll(".ir-toggle").forEach(b=>b.setAttribute("aria-pressed",IR));
  cap(evaCap,IR?"That's Astrophage. Every red dot is a cell soaking up starlight at 25.984 microns. The whole site is looking through the IR camera now.":"Visible light. Space looks empty out here. It isn't.");
  if(!IR&&pg)pg.clearRect(0,0,pc.width,pc.height);wake(2);
}
document.querySelectorAll(".ir-toggle").forEach(b=>b.addEventListener("click",()=>setIR(!IR)));

/* ---------- loop + wiring ---------- */
function loop(now){
  raf=0;if(!hail()||document.hidden)return;
  const dt=Math.min(.06,(now-last)/1000||0);
  if(now-last>=(window.ncPerf?ncPerf.minDt("hero"):16)){last=now;T+=dt;
    IRK=REDUCE?(IR?1:0):lerp(IRK,IR?1:0,1-Math.exp(-dt*4));if(Math.abs(IRK-(IR?1:0))<.002)IRK=IR?1:0;
    for(const S of scenes)if(S.vis)paint(S,dt);
    if(IR||IRK>0)pageDots(dt);}
  const live=scenes.some(S=>S.vis)||IR||IRK>0;
  if(live&&(!still()||T<awake))raf=requestAnimationFrame(loop);
}
function kick(){if(!raf&&hail()){last=performance.now();raf=requestAnimationFrame(loop)}}
function wake(s){awake=Math.max(awake,T+s);kick()}
if(!SOFT)sprites();
const eva=scene("eva",evaLayout,evaDraw),fc=scene("first-contact",fcLayout,fcDraw);
function pointer(S,steer){
  if(!S)return;let down=null;const at=e=>{const r=S.fx.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top,r]};
  S.fx.addEventListener("pointermove",e=>{const[x,y,r]=at(e);S.px=x/r.width;S.py=y/r.height;if(e.pointerType==="mouse"||down){if(down&&Math.hypot(x-down.x,y-down.y)>8)down.moved=true;steer(x,y)}});
  S.fx.addEventListener("pointerdown",e=>{const[x,y]=at(e);down={x,y,t:performance.now(),moved:false};steer(x,y,true)});
  S.fx.addEventListener("pointerup",()=>{if(down&&!down.moved&&performance.now()-down.t<350&&S===fc)pulse();down=null});
  S.fx.addEventListener("pointercancel",()=>{down=null});
}
pointer(eva,(x,y)=>{eva.tx=clamp(x,eva.W*.08,eva.W*.92);eva.ty=clamp(y,eva.H*.22,eva.H*.72);eva.last=T;wake(4)});
pointer(fc,(x,y,tap)=>{if(EC.dock||tap)return;const b=EC.L.box;EC.tx=clamp(x,b[0],b[1]);EC.ty=clamp(y,b[2],b[3]);wake(4)});
pulseBtn&&pulseBtn.addEventListener("click",pulse);
dockBtn&&dockBtn.addEventListener("click",()=>{EC.dock=!EC.dock;EC.bumped=false;EC.mt=0;dockBtn.setAttribute("aria-pressed",EC.dock);dockBtn.textContent=EC.dock?"Undock":"Build tunnel";
  pulseBtn.disabled=EC.dock;fc&&fc.sec.classList.toggle("docked",EC.dock);
  if(EC.dock){EC.pat=[];EC.echo=null;cap(fcCap,"Building a tunnel out of xenonite. Your new friend is a very fast engineer.")}else cap(fcCap,FC_IDLE);wake(12)});
let rt=0;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{for(const S of scenes)S.W=0;wake(.5)},180)});
document.addEventListener("skinchange",()=>setTimeout(()=>{if(!hail())setIR(false);for(const S of scenes)S.W=0;kick()},80));
document.addEventListener("litechange",kick);document.addEventListener("qualitychange",()=>{for(const S of scenes)S.W=0;kick()});document.addEventListener("visibilitychange",kick);
})();
