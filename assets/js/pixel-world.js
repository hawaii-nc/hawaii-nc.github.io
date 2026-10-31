/* Pixel worlds: every section after the hero ends in a living pixel-art strip of the current universe,
   and a few pixel critters perch on the section titles. Spider-Verse gets comic New York (rooftops, the
   bridge, a subway cross-section, night rooftops); Night City gets megablocks, the badlands highway, the
   undercity and a rainy rooftop. Art is drawn at 1/3 resolution and scaled up with crisp pixels.
   Only strips on screen animate; lite mode and reduced motion get one still frame. */
(function(){
"use strict";
const root=document.documentElement;
const skin=()=>root.dataset.skin==="cyber"?"cyber":"spider";
const REDUCE=matchMedia("(prefers-reduced-motion: reduce)").matches;
const still=()=>REDUCE||(window.ncLite&&window.ncLite());
const PX=3,PERCH_PX=4; // css px per art pixel (strips / perched critters)

/* ---------- helpers ---------- */
const rng=s=>()=>((s=(s*16807)%2147483647)/2147483647);
const make=(w,h)=>{const c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d");g.imageSmoothingEnabled=false;return{c,g}};
const box=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
function line(g,x0,y0,x1,y1,c){ // 1px pixel line
  x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);g.fillStyle=c;
  const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
  for(let i=0;i<600;i++){g.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}
}
function sprite(rows,pal){
  const h=rows.length,w=rows[0].length,{c,g}=make(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=rows[y][x];if(pal[k]){g.fillStyle=pal[k];g.fillRect(x,y,1,1)}}
  const f=make(w,h);f.g.translate(w,0);f.g.scale(-1,1);f.g.drawImage(c,0,0);c.flip=f.c;return c;
}
const put=(g,s,x,y,flip)=>g.drawImage(flip?s.flip:s,Math.round(x),Math.round(y));
function glow(g,x,y,r,col){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col);gr.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}

/* ---------- sprites ---------- */
const HERO={K:"#161616",R:"#E1262D",B:"#1E4FD8",W:"#FFFFFF"};
const S={
  swing:sprite([
    ".....R....","..KRRKR...",".KRRRRK...",".KWRRWK...",".KRRRRK...","..KRRK....",".BRRRRB...",
    "BBRRRRBB..","..RRRR....","..BBBB....","..B..BB...",".RR....RR."],HERO),
  crouch:sprite([
    "...KRRK...","..KWRRWK..","..KRRRRK..","...KRRK...","..BRRRRB..",".BBRRRRBB.","BRRBBBBRRB","RR......RR"],HERO),
  pigeon:[sprite(["KG....","GGG...",".GGGGD","..O.O."],{K:"#2a2a33",G:"#8C93A8",D:"#5B6178",O:"#E8833A"}),
          sprite(["......","KG....","GGGGGD","..O.O."],{K:"#2a2a33",G:"#8C93A8",D:"#5B6178",O:"#E8833A"})],
  pigeonFly:[sprite(["G....G","GG..GG",".GGGG.","..GG.."],{G:"#8C93A8"}),sprite(["......","GGGGGG",".GGGG.","..GG.."],{G:"#8C93A8"})],
  cab:sprite(["...KKKKKK.....","..KWWKWWWK....",".KYYYYYYYYYYK.","KYYYYYYYYYYYYL","KYKKYYYYYKKYYK","..KK.....KK..."],{K:"#161616",W:"#9FD3FF",Y:"#FFD338",L:"#FFF6C8"}),
  spider:sprite(["K.K.K.K","KKKKKKK",".KRRRK.","KKRRRKK","K.KKK.K"],{K:"#161616",R:"#E1262D"}),
  gull:[sprite(["W...W",".W.W.","..W.."],{W:"#EDF3FF"}),sprite([".....","WWWWW","..W.."],{W:"#EDF3FF"})],
  av:sprite(["....KKKKKK......","..KCCKCCCCK.....",".KMMMMMMMMMMMK..","KMMMMMMMMMMMMMR.",".KK..........KK."],{K:"#05060B",C:"#00F0FF",M:"#2B3245",R:"#FF2A3D"}),
  avY:sprite(["....KKKKKK......","..KCCKCCCCK.....",".KYYYYYYYYYYYK..","KYYYYYYYYYYYYYR.",".KK..........KK."],{K:"#05060B",C:"#00F0FF",Y:"#FCEE0A",R:"#FF2A3D"}),
  drone:sprite(["K.....K","KKKKKKK",".KCKCK.","..KRK.."],{K:"#0C111C",C:"#00F0FF",R:"#FF2A3D"}),
  cat:[sprite([".K....K.",".KK..KK.",".KEKKEK.",".KKKKKK.","..KKKK..",".KKKKKK.","KKKKKKKK"],{K:"#05060B",E:"#FF2E88"}),
       sprite([".K....K.",".KK..KK.",".KKKKKK.",".KKKKKK.","..KKKK..",".KKKKKK.","KKKKKKKK"],{K:"#05060B"})],
  catY:[sprite([".K....K.",".KK..KK.",".KEKKEK.",".KKKKKK.","..KKKK..",".KKKKKK.","KKKKKKKK"],{K:"#05060B",E:"#FCEE0A"}),
        sprite([".K....K.",".KK..KK.",".KKKKKK.",".KKKKKK.","..KKKK..",".KKKKKK.","KKKKKKKK"],{K:"#05060B"})],
  bike:sprite(["....KKC.....","..KKPPKK....","KKKKKKKKKKY.",".KK.....KK.."],{K:"#05060B",C:"#00F0FF",P:"#FF2E88",Y:"#FCEE0A"}),
  runner:sprite(["..C..","KKKKK","KCCCK","KKKKK","K...K"],{K:"#0C111C",C:"#00F0FF"}),
};
function walker(col){return[sprite([".C.",".K.","KKK",".K.","K.K"],{K:col,C:"#00F0FF"}),sprite([".C.",".K.","KKK",".K.",".K."],{K:col,C:"#00F0FF"})]}

/* ---------- scenes: build() paints the still layer once, frame() draws the moving parts ---------- */
const SPIDER={
  /* missions: comic rooftops, water towers, a street with cabs, pigeons, and a web-slinger now and then */
  rooftops:{h:56,build(W,H,R){
    const{c,g}=make(W,H),base=H-6,ledges=[];
    for(let x=-4;x<W;){const w=8+R()*14,h=14+R()*22;box(g,x,base-h,w,h+6,"rgba(8,18,70,.35)");x+=w+1}
    const facades=["#C8343B","#E8833A","#3C8C78","#4F5F86","#F2C14E","#8A5A3B"];
    for(let x=-6;x<W;){
      const w=14+R()*22|0,h=10+R()*20|0,top=base-h,col=facades[R()*facades.length|0];
      box(g,x,top,w,h+6,"#161616");box(g,x+1,top+1,w-2,h+5,col);
      for(let y=top+3;y<base-1;y+=4)for(let wx=x+3;wx<x+w-3;wx+=3)box(g,wx,y,1,2,R()<.3?"#FFE9A8":"rgba(20,30,70,.65)");
      if(R()<.4){const tx=x+3+R()*(w-9);box(g,tx,top-5,5,4,"#8A5A3B");box(g,tx-1,top-6,7,1,"#5C3B27");box(g,tx+1,top-1,1,1,"#161616");box(g,tx+3,top-1,1,1,"#161616")}
      else if(R()<.5)box(g,x+w*.6,top-6,1,6,"#161616");
      if(R()<.35)for(let y=top+3;y<base-2;y+=5){box(g,x+w-4,y,3,1,"#161616")}
      ledges.push({x:x+2+R()*(w-8),y:top});x+=w+(R()*3|0);
    }
    box(g,0,base,W,1,"#3A3A46");box(g,0,base+1,W,5,"#1B1B22");for(let x=0;x<W;x+=12)box(g,x,base+3,5,1,"#FFD338");
    const pig=[];for(let i=0;i<Math.min(6,ledges.length/4|0);i++){const l=ledges[(R()*ledges.length)|0];pig.push({x:l.x,y:l.y-4,ph:R()*6,fly:0})}
    return{bg:c,base,pig,cabs:Array.from({length:Math.max(2,W/90|0)},()=>({x:R()*W,v:(18+R()*20)*(R()<.5?-1:1)})),hero:null,next:2+R()*4};
  },frame(g,s,t,dt,W,H){
    g.drawImage(s.bg,0,0);
    for(const c of s.cabs){c.x+=c.v*dt;if(c.x>W+20)c.x=-20;if(c.x<-20)c.x=W+20;put(g,S.cab,c.x,s.base-5,c.v<0)}
    for(const p of s.pig){
      if(p.fly){p.fly+=dt;put(g,S.pigeonFly[(t*8|0)%2],p.x+p.fly*30,p.y-p.fly*18,false);if(p.fly>4)p.fly=0}
      else{put(g,S.pigeon[(Math.sin(t*3+p.ph)>.6)?1:0],p.x,p.y,p.ph>3);if(s.hero&&Math.abs(s.hero.x-p.x)<12)p.fly=.01}
    }
    s.next-=dt;
    if(!s.hero&&s.next<=0)s.hero={p:0,dir:Math.random()<.5?1:-1};
    if(s.hero){const h=s.hero;h.p+=dt/4.5;
      const k=h.dir>0?h.p:1-h.p,x=-14+(W+28)*k,n=Math.max(3,W/120|0),seg=(k*n)%1,ax=-14+(W+28)*((Math.floor(k*n)+.5)/n),y=4+Math.sin(seg*Math.PI)*(H-26);
      h.x=x;line(g,x+5,y,ax,-2,"rgba(255,255,255,.9)");put(g,S.swing,x,y,h.dir<0);
      if(h.p>=1){s.hero=null;s.next=7+Math.random()*7}}
  }},
  /* tracker: a suspension bridge over the river, boats, cars, gulls, twinkling stars */
  bridge:{h:56,build(W,H,R){
    const{c,g}=make(W,H),deck=H-20,water=H-13;
    const stars=[];for(let i=0;i<W/6;i++)stars.push({x:R()*W,y:R()*(H-26),ph:R()*6});
    for(let x=-4;x<W;){const w=6+R()*12,h=6+R()*16;box(g,x,water-h,w,h,"#1A2E73");for(let y=water-h+2;y<water-1;y+=3)if(R()<.5)box(g,x+1+R()*(w-2),y,1,1,"#FFD338");x+=w}
    box(g,0,water,W,H-water,"#0A2A6A");
    const t1=W*.22,t2=W*.68,top=deck-30;
    for(const tx of[t1,t2]){box(g,tx-3,top,7,H-top,"#5B6A8F");box(g,tx-3,top,7,1,"#8C9AC0");box(g,tx-2,top+6,2,6,"#0B1640");box(g,tx+1,top+6,2,6,"#0B1640");box(g,tx-2,top+16,2,6,"#0B1640");box(g,tx+1,top+16,2,6,"#0B1640")}
    const cab=(a,b,sag)=>{for(let x=Math.max(0,Math.min(a,b));x<=Math.min(W,Math.max(a,b));x++){const u=(x-a)/(b-a),y=top+1+sag*4*u*(1-u);box(g,x,y,1,1,"#C3CCE6");if((x|0)%4===0)box(g,x,y,1,deck-y,"rgba(195,204,230,.45)")}};
    cab(t1,t2,24);
    for(let x=0;x<=t1;x++){const u=x/t1,y=top+1+(deck-top-2)*(1-u)*(1-u);box(g,x,y,1,1,"#C3CCE6");if(x%4===0)box(g,x,y,1,deck-y,"rgba(195,204,230,.45)")}
    for(let x=t2;x<=W;x++){const u=(x-t2)/(W-t2),y=top+1+(deck-top-2)*u*u;box(g,x,y,1,1,"#C3CCE6");if((x|0)%4===0)box(g,x,y,1,deck-y,"rgba(195,204,230,.45)")}
    box(g,0,deck,W,3,"#2B2B3A");box(g,0,deck,W,1,"#8C9AC0");
    return{bg:c,deck,water,stars,cars:Array.from({length:Math.max(3,W/60|0)},()=>({x:R()*W,v:(14+R()*16)*(R()<.5?-1:1)})),
      boats:[{x:R()*W,v:6},{x:R()*W,v:-4}],gulls:[{x:R()*W,y:6+R()*10,v:10},{x:R()*W,y:4+R()*8,v:-8}]};
  },frame(g,s,t,dt,W,H){
    g.drawImage(s.bg,0,0);
    for(const st of s.stars)if(Math.sin(t*2+st.ph)>.3)box(g,st.x,st.y,1,1,"rgba(255,255,255,.8)");
    for(const c of s.cars){c.x+=c.v*dt;if(c.x>W+4)c.x=-4;if(c.x<-4)c.x=W+4;box(g,c.x,s.deck+1,2,1,c.v>0?"#FFF6C8":"#FF5A5A")}
    for(const b of s.boats){b.x+=b.v*dt;if(b.x>W+14)b.x=-14;if(b.x<-14)b.x=W+14;const y=s.water+3;box(g,b.x,y,10,2,"#E8E3D3");box(g,b.x+3,y-2,4,2,"#E1262D");box(g,b.x+(b.v>0?-4:10),y+1,4,1,"rgba(255,255,255,.5)")}
    for(let i=0;i<W/14;i++){const x=(i*14+t*8)%W;box(g,x,s.water+2+(i%4)*2,3,1,"rgba(160,200,255,.35)")}
    for(const q of s.gulls){q.x+=q.v*dt;if(q.x>W+6)q.x=-6;if(q.x<-6)q.x=W+6;put(g,S.gull[(t*5|0)%2],q.x,q.y+Math.sin(t*2+q.x)*1.5,q.v<0)}
  }},
  /* projects: the street, and under it the subway (a Terraria-style cross-section) */
  subway:{h:80,build(W,H,R){
    const{c,g}=make(W,H),street=32,tun=50,rail=72;
    const facades=["#C8343B","#E8833A","#3C8C78","#4F5F86","#F2C14E"];
    for(let x=-4;x<W;){const w=20+R()*26|0,col=facades[R()*facades.length|0];box(g,x,4,w,street-4,"#161616");box(g,x+1,5,w-2,street-5,col);
      for(let i=0;i<w-2;i+=2)box(g,x+1+i,14,2,3,i%4?"#FFFFFF":"#E1262D");box(g,x+3,18,w-6,8,"#FFE9A8");box(g,x+3,18,w-6,1,"#161616");x+=w}
    box(g,0,street,W,2,"#8C8C99");box(g,0,street+2,W,6,"#1B1B22");for(let x=0;x<W;x+=12)box(g,x,street+5,5,1,"#FFD338");
    box(g,0,street+8,W,H-street-8,"#5B4A3A");
    for(let i=0;i<W*3;i++)box(g,R()*W,street+9+R()*(H-street-9),1,1,R()<.5?"#4A3B2E":"#6E5A47");
    box(g,0,street+11,W,3,"#3C8C78");for(let x=8;x<W;x+=40)box(g,x,street+10,3,5,"#2A6E5E");
    box(g,0,tun,W,rail-tun+4,"#17171F");box(g,0,tun,W,1,"#3A3A46");box(g,0,rail,W,1,"#8C8C99");box(g,0,rail+2,W,1,"#8C8C99");
    for(let x=0;x<W;x+=4)box(g,x,rail+1,2,1,"#5B4A3A");
    const lamps=[];for(let x=20;x<W;x+=56){lamps.push(x);box(g,x,tun+1,3,1,"#FFE9A8")}
    const dark=make(W,H);dark.g.fillStyle="rgba(5,4,10,.55)";dark.g.fillRect(0,street+8,W,H);
    dark.g.globalCompositeOperation="destination-out";for(const x of lamps)glow(dark.g,x+1,tun+6,18,"rgba(0,0,0,.9)");
    g.drawImage(dark.c,0,0);for(const x of lamps)glow(g,x+1,tun+4,12,"rgba(255,220,140,.18)");
    return{bg:c,street,tun,rail,train:-1,next:1.5,cabs:[{x:R()*W,v:24},{x:R()*W,v:-20}],rats:[{x:R()*W,v:9}]};
  },frame(g,s,t,dt,W,H){
    g.drawImage(s.bg,0,0);
    for(const c of s.cabs){c.x+=c.v*dt;if(c.x>W+20)c.x=-20;if(c.x<-20)c.x=W+20;put(g,S.cab,c.x,s.street+1,c.v<0)}
    for(const r of s.rats){r.x+=r.v*dt;if(r.x>W+4)r.x=-4;box(g,r.x,s.street+10,3,1,"#2a2a33");box(g,r.x+3,s.street+10,1,1,"#C8A0A0")}
    s.next-=dt;if(s.train<0&&s.next<=0)s.train=-110;
    if(s.train>=-110&&s.train!==-1){s.train+=70*dt;
      for(let k=0;k<3;k++){const x=s.train+k*36,y=s.tun+6;box(g,x,y,34,s.rail-y,"#161616");box(g,x+1,y+1,32,s.rail-y-2,"#B8BFC8");box(g,x+1,y+4,32,1,"#E1262D");
        for(let wx=x+3;wx<x+31;wx+=5)box(g,wx,y+6,3,4,"#FFE9A8");box(g,x+3,s.rail-2,4,2,"#161616");box(g,x+27,s.rail-2,4,2,"#161616")}
      glow(g,s.train+108,s.tun+12,14,"rgba(255,240,180,.35)");
      if(s.train>W+10){s.train=-1;s.next=5+Math.random()*4}}
  }},
  /* contact: night rooftops in red, the moon, a blinking antenna, and our hero crouched on a ledge */
  night:{h:56,build(W,H,R){
    const{c,g}=make(W,H);
    for(let x=-4;x<W;){const w=10+R()*18,h=14+R()*26;box(g,x,H-h,w,h,"rgba(40,6,10,.45)");x+=w}
    for(let x=-4;x<W;){const w=16+R()*24|0,h=8+R()*20|0;box(g,x,H-h,w,h,"#1A0507");for(let y=H-h+3;y<H;y+=4)for(let wx=x+3;wx<x+w-2;wx+=3)if(R()<.2)box(g,wx,y,1,2,"#FFD338");x+=w}
    const mx=W*.12;box(g,mx-4,6,9,9,"#F5EFD8");box(g,mx-5,8,11,5,"#F5EFD8");box(g,mx+1,8,2,2,"#D8CFB0");
    const lx=W*.84;box(g,lx-14,H-24,40,24,"#120304");box(g,lx-16,H-25,44,2,"#3A0A0F");
    const ant=W*.4;box(g,ant,H-40,1,16,"#120304");box(g,ant-2,H-36,5,1,"#120304");
    return{bg:c,lx,ant,ledge:H-25,pig:[{x:lx+14,ph:1},{x:lx+20,ph:3}]};
  },frame(g,s,t,dt,W,H){
    g.drawImage(s.bg,0,0);
    if((t%1.6)<.8)box(g,s.ant,H-41,1,1,"#FF3B3B");
    line(g,s.lx+4,-2,s.lx+4,s.ledge-8+Math.sin(t*1.5)*.5,"rgba(255,255,255,.75)");
    put(g,S.crouch,s.lx,s.ledge-8,false);
    for(const p of s.pig)put(g,S.pigeon[(Math.sin(t*3+p.ph)>.6)?1:0],p.x,s.ledge-4,true);
  }},
};

const CYBER={
  /* gigs: megablocks, neon, flying AVs with light trails, rain */
  mega:{h:60,build(W,H,R){
    const{c,g}=make(W,H),signs=[],wins=[];
    for(let x=-4;x<W;){const w=10+R()*18,h=24+R()*30;box(g,x,H-h,w,h,"#0E3B43");x+=w+1}
    for(let x=-6;x<W;){const w=18+R()*26|0,h=16+R()*30|0,top=H-h;box(g,x,top,w,h,"#0C111C");box(g,x,top,w,1,"#1E2A3A");
      for(let y=top+3;y<H-2;y+=3)for(let wx=x+2;wx<x+w-2;wx+=3){const k=R();if(k<.1){box(g,wx,y,2,1,"#FCEE0A");wins.push({x:wx,y,ph:R()*6})}else if(k<.25)box(g,wx,y,2,1,"rgba(0,240,255,.45)")}
      if(R()<.5)signs.push({x:x+2,y:top+4+R()*Math.max(1,h-16),w:Math.min(w-4,16),col:["#FF2E88","#00F0FF","#FCEE0A","#FF2A3D"][R()*4|0],txt:["バー","ラーメン","NC77","ネオン","OPEN","ホテル"][R()*6|0],ph:R()*6});
      x+=w+(R()*3|0)}
    box(g,0,H-3,W,3,"#05060B");for(let x=0;x<W;x+=10)box(g,x,H-2,5,1,"#FCEE0A");
    const rain=Array.from({length:W/3|0},()=>({x:R()*W,y:R()*H,v:40+R()*30}));
    return{bg:c,signs,wins,rain,avs:[{x:R()*W,y:8,v:34,s:S.av},{x:R()*W,y:18,v:-26,s:S.avY},{x:R()*W,y:28,v:44,s:S.av}]};
  },frame(g,s,t,dt,W,H){
    g.drawImage(s.bg,0,0);
    for(const w of s.wins)if(Math.sin(t*.9+w.ph)>.95)box(g,w.x,w.y,2,1,"#05060B");
    g.font="7px monospace";g.textBaseline="top";
    for(const n of s.signs){const off=Math.sin(t*6+n.ph)>.96;box(g,n.x-1,n.y-1,n.w+2,9,"#05060B");box(g,n.x-1,n.y-1,n.w+2,1,off?"#222":n.col);box(g,n.x-1,n.y+7,n.w+2,1,off?"#222":n.col);
      if(!off){glow(g,n.x+n.w/2,n.y+4,10,n.col.replace(/^#(..)(..)(..)$/,(m,a,b,c2)=>`rgba(${parseInt(a,16)},${parseInt(b,16)},${parseInt(c2,16)},.25)`));g.fillStyle=n.col;g.fillText(n.txt,n.x,n.y,n.w)}}
    for(const a of s.avs){a.x+=a.v*dt;if(a.x>W+20)a.x=-20;if(a.x<-20)a.x=W+20;const back=a.v>0?-14:16;
      for(let i=0;i<14;i++)box(g,a.x+back+(a.v>0?-i:i),a.y+3,1,1,`rgba(255,42,61,${(.5-i*.035).toFixed(2)})`);put(g,a.s,a.x,a.y,a.v<0)}
    g.fillStyle="rgba(0,240,255,.35)";for(const r of s.rain){r.y+=r.v*dt;r.x-=r.v*dt*.25;if(r.y>H){r.y=-3;r.x=Math.random()*W}g.fillRect(r.x|0,r.y|0,1,2)}
  }},
  /* trace: badlands highway, wind turbines, a biker, the city glowing on the horizon */
  badlands:{h:56,build(W,H,R){
    const{c,g}=make(W,H),road=H-9;
    const stars=[];for(let i=0;i<W/7;i++)stars.push({x:R()*W,y:R()*(H-28),ph:R()*6});
    glow(g,W*.1,H-16,W*.25,"rgba(252,238,10,.16)");
    for(let x=0;x<W*.24;){const w=3+R()*5,h=10+R()*26;box(g,x,H-14-h,w,h,"#2A2A10");if(R()<.4)box(g,x+1,H-14-h+2,1,1,"#FCEE0A");x+=w+1}
    for(let x=W*.3;x<W;){const w=20+R()*40,h=4+R()*10;box(g,x,H-14-h,w,h,"#3A1A12");box(g,x+3,H-14-h-2,w-6,2,"#3A1A12");x+=w+R()*20}
    box(g,0,H-14,W,14,"#4A2214");for(let i=0;i<W;i++)if(R()<.3)box(g,i,H-14+R()*14,1,1,"#5E2C1A");
    box(g,0,road,W,4,"#0C0C10");for(let x=0;x<W;x+=10)box(g,x,road+2,5,1,"#FCEE0A");
    const bx=W*.55;box(g,bx,H-34,1,20,"#0C111C");box(g,bx+30,H-34,1,20,"#0C111C");box(g,bx-1,H-42,33,9,"#05060B");
    return{bg:c,road,stars,bb:{x:bx,y:H-42},turb:[W*.42,W*.74,W*.9].map(x=>({x,y:H-34,ph:R()*6})),bike:{x:W+10,v:-52},dust:[]};
  },frame(g,s,t,dt,W,H){
    g.drawImage(s.bg,0,0);
    for(const st of s.stars)if(Math.sin(t*1.5+st.ph)>.2)box(g,st.x,st.y,1,1,"rgba(232,241,242,.7)");
    for(const u of s.turb){box(g,u.x,u.y,1,20,"#8FA3AD");const a=t*1.8+u.ph;for(let k=0;k<3;k++){const b=a+k*2.094;line(g,u.x,u.y,u.x+Math.cos(b)*8,u.y+Math.sin(b)*8,"#8FA3AD")}if((t%1.4)<.7)box(g,u.x,u.y,1,1,"#FF2A3D")}
    const on=Math.sin(t*5)>-.85;g.font="7px monospace";g.textBaseline="top";g.fillStyle=on?"#FF2E88":"#3a1020";g.fillText("NC-77 ✦ ネオン",s.bb.x+1,s.bb.y+1,31);
    const b=s.bike;b.x+=b.v*dt;if(b.x<-30){b.x=W+30+Math.random()*80}
    glow(g,b.x-2,s.road,12,"rgba(252,238,10,.3)");put(g,S.bike,b.x,s.road-4,true);
    if(Math.random()<.6)s.dust.push({x:b.x+12,y:s.road-1,l:1});for(const d of s.dust){d.x+=6*dt;d.y-=3*dt;d.l-=dt*1.4;if(d.l>0)box(g,d.x,d.y,1,1,`rgba(160,110,80,${d.l.toFixed(2)})`)}s.dust=s.dust.filter(d=>d.l>0);
  }},
  /* builds: the street, and under it the undercity: data cables, the metro, a netrunner den */
  under:{h:80,build(W,H,R){
    const{c,g}=make(W,H),street=30,tun=50,rail=72,den=W-92;
    for(let x=-4;x<W;){const w=18+R()*24|0;box(g,x,2,w,street-2,"#0C111C");const col=["#FF2E88","#00F0FF","#FCEE0A"][R()*3|0];box(g,x+3,8,w-6,1,col);box(g,x+3,16,w-6,10,"rgba(0,240,255,.12)");box(g,x+3,16,w-6,1,col);x+=w+2}
    box(g,0,street,W,2,"#1E2A3A");box(g,0,street+2,W,4,"#05060B");for(let x=0;x<W;x+=10)box(g,x,street+3,5,1,"#FCEE0A");
    box(g,0,street+6,W,H,"#1A1D24");for(let i=0;i<W*2;i++)box(g,R()*W,street+7+R()*(H-street-7),1,1,R()<.5?"#14171D":"#232833");
    for(let k=0;k<3;k++)box(g,0,street+9+k*2,W,1,["#0E3B43","#3A1030","#3A3A10"][k]);
    box(g,0,tun,den-4,rail-tun+4,"#0A0C11");box(g,0,rail,den-4,1,"#8FA3AD");box(g,0,rail+2,den-4,1,"#8FA3AD");
    for(let x=14;x<den-10;x+=48)box(g,x,tun+1,4,1,"#00F0FF");
    box(g,den,tun-2,88,H-tun+2,"#0C111C");box(g,den,tun-2,88,1,"#FCEE0A");box(g,den+2,tun,84,H-tun-2,"#10161F");
    const leds=[];for(let r=0;r<4;r++){const rx=den+6+r*12;box(g,rx,tun+4,9,22,"#05060B");for(let y=tun+6;y<tun+25;y+=3)leds.push({x:rx+2+((R()*5)|0),y,ph:R()*6,col:R()<.5?"#00F0FF":"#FF2E88"})}
    box(g,den+56,tun+10,22,12,"#05060B");box(g,den+57,tun+11,20,10,"#0E3B43");
    const dark=make(W,H);dark.g.fillStyle="rgba(0,0,4,.5)";dark.g.fillRect(0,street+6,W,H);dark.g.globalCompositeOperation="destination-out";glow(dark.g,den+66,tun+16,26,"rgba(0,0,0,.9)");g.drawImage(dark.c,0,0);
    return{bg:c,street,tun,rail,den,leds,train:-1,next:1,packets:[0,1,2].map(k=>({x:R()*W,y:street+9+k*2,v:(60+R()*40)*(k%2?-1:1),col:["#00F0FF","#FF2E88","#FCEE0A"][k]})),
      peds:Array.from({length:Math.max(2,W/120|0)},()=>({x:R()*W,v:(5+R()*6)*(R()<.5?-1:1),s:walker(["#FF2E88","#FCEE0A","#8FA3AD"][R()*3|0])}))};
  },frame(g,s,t,dt,W,H){
    g.drawImage(s.bg,0,0);
    for(const p of s.peds){p.x+=p.v*dt;if(p.x>W+4)p.x=-4;if(p.x<-4)p.x=W+4;put(g,p.s[(t*4|0)%2],p.x,s.street-5,p.v<0)}
    for(const p of s.packets){p.x+=p.v*dt;if(p.x>W)p.x=0;if(p.x<0)p.x=W;box(g,p.x,p.y,4,1,p.col)}
    for(const l of s.leds)box(g,l.x,l.y,1,1,Math.sin(t*4+l.ph)>0?l.col:"#05060B");
    put(g,S.runner,s.den+64,s.tun+20,false);glow(g,s.den+66,s.tun+16,12,`rgba(0,240,255,${(.18+.08*Math.sin(t*3)).toFixed(2)})`);
    s.next-=dt;if(s.train===-1&&s.next<=0)s.train=-120;
    if(s.train!==-1){s.train+=80*dt;
      for(let k=0;k<3;k++){const x=s.train+k*38,y=s.tun+6;if(x>s.den-40)continue;box(g,x,y,36,s.rail-y,"#05060B");box(g,x+1,y+1,34,s.rail-y-2,"#FCEE0A");
        for(let i=0;i<34;i+=6)box(g,x+1+i,y+1,3,2,"#05060B");for(let wx=x+3;wx<x+33;wx+=5)box(g,wx,y+6,3,4,"#00F0FF")}
      if(s.train>s.den+20){s.train=-1;s.next=4+Math.random()*4}}
  }},
  /* contact: black rooftops on hazard yellow, neon OPEN sign, a cat, a drone, rain */
  roof:{h:56,build(W,H,R){
    const{c,g}=make(W,H);
    for(let x=-4;x<W;){const w=8+R()*16,h=16+R()*30;box(g,x,H-h,w,h,"rgba(0,0,0,.28)");x+=w+1}
    for(let x=-4;x<W;){const w=24+R()*30|0,h=8+R()*14|0;box(g,x,H-h,w,h,"#05060B");if(R()<.6){box(g,x+4,H-h-5,8,5,"#05060B");box(g,x+5,H-h-4,6,1,"#3a3a10")}if(R()<.4)box(g,x+w-6,H-h-10,1,10,"#05060B");x+=w}
    const sx=W*.7;box(g,sx,H-34,1,12,"#05060B");box(g,sx+22,H-34,1,12,"#05060B");
    const cx=W*.22;box(g,cx-2,H-22,14,8,"#05060B");
    return{bg:c,sign:{x:sx-2,y:H-44},cat:{x:cx,y:H-29},drone:{x:W*.45,y:10},rain:Array.from({length:W/4|0},()=>({x:R()*W,y:R()*H,v:50+R()*30}))};
  },frame(g,s,t,dt,W,H){
    g.drawImage(s.bg,0,0);
    const on=(t%3)<2.6||((t*10)|0)%2;box(g,s.sign.x,s.sign.y,27,10,"#05060B");g.font="8px monospace";g.textBaseline="top";g.fillStyle=on?"#FF2E88":"#40122A";g.fillText("OPEN",s.sign.x+3,s.sign.y+1,22);
    if(on)glow(g,s.sign.x+13,s.sign.y+5,16,"rgba(255,46,136,.25)");
    put(g,S.cat[(t%4)<3.85?0:1],s.cat.x,s.cat.y,false);box(g,s.cat.x-2+((Math.sin(t*2)>0)?0:1),s.cat.y+5,2,1,"#05060B");
    const dx=s.drone.x+Math.sin(t*.7)*W*.18,dy=s.drone.y+Math.sin(t*2.1)*2;put(g,S.drone,dx,dy,false);if((t%1)<.5)box(g,dx+3,dy+3,1,1,"#FF2A3D");
    g.fillStyle="rgba(0,0,0,.35)";for(const r of s.rain){r.y+=r.v*dt;r.x-=r.v*dt*.2;if(r.y>H){r.y=-3;r.x=Math.random()*W}g.fillRect(r.x|0,r.y|0,1,2)}
  }},
};

const PLAN={
  spider:{missions:"rooftops",tracker:"bridge",projects:"subway",contact:"night"},
  cyber:{missions:"mega",tracker:"badlands",projects:"under",contact:"roof"},
};

/* ---------- perched critters on titles ---------- */
const PERCH={
  spider:{missions:"pigeon",projects:"spider",contact:"hero"},
  cyber:{missions:"drone",tracker:"drone",projects:"cat",contact:"catY"},
};
function perchFrame(kind,g,t,w,h){
  g.clearRect(0,0,w,h);
  if(kind==="pigeon")put(g,S.pigeon[(Math.sin(t*3)>.5)?1:0],5,h-4,true);
  else if(kind==="spider"){const y=4+Math.round((Math.sin(t*1.3)*.5+.5)*(h-10));line(g,w/2,0,w/2,y,"rgba(160,160,170,.9)");put(g,S.spider,w/2-3,y,false)}
  else if(kind==="hero")put(g,S.crouch,3,h-8,false);
  else if(kind==="drone"){const y=2+Math.round(Math.sin(t*2)*1.5+1.5);put(g,S.drone,4,y,false);if((t%1)<.5)box(g,7,y+3,1,1,"#FF2A3D");g.fillStyle=`rgba(0,240,255,${(.15+.1*Math.sin(t*6)).toFixed(2)})`;g.beginPath();g.moveTo(7,y+4);g.lineTo(1,h);g.lineTo(13,h);g.fill()}
  else if(kind==="cat"||kind==="catY"){const sp=S[kind];put(g,sp[(t%4)<3.8?0:1],3,h-7,false);box(g,11,h-2-((Math.sin(t*2.4)>0)?1:0),2,1,"#05060B")}
}

/* ---------- wiring ---------- */
const strips=[],perches=[];let raf=0,last=0;
function setup(){
  for(const s of strips)s.el.remove();for(const p of perches)p.el.remove();strips.length=0;perches.length=0;
  const k=skin();
  for(const[id,name]of Object.entries(PLAN[k])){
    const sec=document.getElementById(id);if(!sec)continue;
    const sc=(k==="cyber"?CYBER:SPIDER)[name],el=document.createElement("canvas");
    el.className="pw-strip";el.setAttribute("aria-hidden","true");el.style.height=sc.h*PX+"px";sec.classList.add("pw-on");sec.appendChild(el);
    strips.push({el,sec,sc,seed:id.length*97+name.length*13,s:null,vis:false,W:0});
  }
  for(const[id,kind]of Object.entries(PERCH[k])){
    const sec=document.getElementById(id);if(!sec)continue;
    const host=id==="contact"?sec.querySelector(".bubble"):sec.querySelector(".section-title");if(!host)continue;
    const w=kind==="spider"?11:16,h=kind==="spider"?26:12,el=document.createElement("canvas");
    el.width=w;el.height=h;el.className="pw-perch pw-"+kind;el.setAttribute("aria-hidden","true");el.style.width=w*PERCH_PX+"px";el.style.height=h*PERCH_PX+"px";
    host.classList.add("pw-host");host.appendChild(el);perches.push({el,g:el.getContext("2d"),kind,w,h,vis:false});
  }
  size();for(const x of[...strips,...perches])io.observe(x.el);kick();
}
// skies are transparent so the section colour shows through: clear before every frame
function draw(st,t,dt){st.g.clearRect(0,0,st.W,st.sc.h);st.sc.frame(st.g,st.s,t,dt,st.W,st.sc.h)}
function size(){
  for(const st of strips){const W=Math.max(40,Math.ceil(st.el.clientWidth/PX)),H=st.sc.h;
    if(W===st.W&&st.s)continue;st.W=W;st.el.width=W;st.el.height=H;st.g=st.el.getContext("2d");st.g.imageSmoothingEnabled=false;
    st.s=st.sc.build(W,H,rng(st.seed));draw(st,3,0)}
  for(const p of perches)perchFrame(p.kind,p.g,3,p.w,p.h);
}
const io=new IntersectionObserver(es=>{for(const e of es){const x=strips.find(s=>s.el===e.target)||perches.find(p=>p.el===e.target);if(x)x.vis=e.isIntersecting}kick()},{rootMargin:"80px"});
function loop(now){
  raf=0;const dt=Math.min(.1,(now-last)/1000||0);
  if(dt>=1/30){last=now;const t=now/1000;
    for(const st of strips)if(st.vis&&st.s)draw(st,t,dt);
    for(const p of perches)if(p.vis)perchFrame(p.kind,p.g,t,p.w,p.h);}
  if(!still()&&!document.hidden&&(strips.some(s=>s.vis)||perches.some(p=>p.vis)))raf=requestAnimationFrame(loop);
}
function kick(){if(!raf&&!still()){last=performance.now();raf=requestAnimationFrame(loop)}}
let rt=0;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(size,200)});
document.addEventListener("skinchange",()=>setTimeout(setup,60));
document.addEventListener("litechange",kick);
document.addEventListener("visibilitychange",kick);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup);else setup();
})();
