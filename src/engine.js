export class Engine {
  constructor(canvas, onComplete){
    this.c=canvas; this.ctx=canvas.getContext('2d'); this.onComplete=onComplete;
    this.dpr=Math.min(devicePixelRatio||1,2); this.level=null; this.history=[]; this.moves=0; this.selected=null; this.pointer=null;
    this.resize(); addEventListener('resize',()=>this.resize());
    canvas.addEventListener('pointerdown',e=>this.down(e)); canvas.addEventListener('pointermove',e=>this.move(e)); addEventListener('pointerup',()=>this.up());
  }
  resize(){ const r=this.c.getBoundingClientRect(); this.w=r.width; this.h=r.height; this.c.width=this.w*this.dpr; this.c.height=this.h*this.dpr; this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0); }
  load(level){ this.level=structuredClone(level); this.history=[]; this.moves=0; this.completed=false; }
  world(o){return {x:o.x*this.w,y:o.y*this.h};}
  hit(p,o,r=.06){const q=this.world(o);return Math.hypot(p.x-q.x,p.y-q.y)<r*Math.min(this.w,this.h)}
  point(e){const r=this.c.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  down(e){if(!this.level||this.completed)return; const p=this.point(e); for(const m of this.level.mirrors){if((m.movable||m.rotatable)&&this.hit(p,m)){this.selected=m;this.pointer=p;this.snapshot();this.c.setPointerCapture(e.pointerId);break;}}}
  move(e){if(!this.selected)return;const p=this.point(e), q=this.world(this.selected);const dx=p.x-q.x,dy=p.y-q.y;
    if(e.shiftKey || Math.hypot(dx,dy)<45){this.selected.angle=Math.atan2(dy,dx);this.mode='ROTATE';}
    else if(this.selected.movable){this.selected.x=Math.max(.05,Math.min(.95,p.x/this.w));this.selected.y=Math.max(.07,Math.min(.93,p.y/this.h));this.mode='DRAG';}
  }
  up(){if(this.selected){this.moves++;this.selected=null;}}
  snapshot(){this.history.push(structuredClone(this.level)); if(this.history.length>50)this.history.shift();}
  undo(){if(this.history.length){this.level=this.history.pop();this.moves=Math.max(0,this.moves-1);}}
  restart(){this.load(this.original);}
  setOriginal(level){this.original=structuredClone(level);this.load(level);}
  raySeg(px,py,dx,dy,ax,ay,bx,by){const sx=bx-ax,sy=by-ay,den=dx*sy-dy*sx;if(Math.abs(den)<1e-7)return null;const qx=ax-px,qy=ay-py,t=(qx*sy-qy*sx)/den,u=(qx*dy-qy*dx)/den;return t>1e-4&&u>=0&&u<=1?{t,x:px+dx*t,y:py+dy*t}:null;}
  trace(x,y,angle,depth=0,intensity=1){if(depth>12||intensity<.04)return[];const dx=Math.cos(angle),dy=Math.sin(angle),M=Math.max(this.w,this.h)*2;let best={t:M,type:'edge'};
    const edges=[[0,0,this.w,0],[this.w,0,this.w,this.h],[this.w,this.h,0,this.h],[0,this.h,0,0]];
    for(const e of edges){const h=this.raySeg(x,y,dx,dy,...e);if(h&&h.t<best.t)best={...h,type:'edge'};}
    for(const w of this.level.walls){const X=w.x*this.w,Y=w.y*this.h,W=w.w*this.w,H=w.h*this.h;for(const e of [[X,Y,X+W,Y],[X+W,Y,X+W,Y+H],[X+W,Y+H,X,Y+H],[X,Y+H,X,Y]]){const h=this.raySeg(x,y,dx,dy,...e);if(h&&h.t<best.t)best={...h,type:'wall'};}}
    for(const m of this.level.mirrors){const q=this.world(m),l=m.len*Math.min(this.w,this.h),ux=Math.cos(m.angle)*l/2,uy=Math.sin(m.angle)*l/2;const h=this.raySeg(x,y,dx,dy,q.x-ux,q.y-uy,q.x+ux,q.y+uy);if(h&&h.t<best.t)best={...h,type:'mirror',obj:m};}
    const seg=[{x1:x,y1:y,x2:best.x??x+dx*M,y2:best.y??y+dy*M,intensity}];
    if(best.type==='mirror'){const a=best.obj.angle,nx=-Math.sin(a),ny=Math.cos(a),dot=dx*nx+dy*ny,rx=dx-2*dot*nx,ry=dy-2*dot*ny;return seg.concat(this.trace(best.x+rx*.8,best.y+ry*.8,Math.atan2(ry,rx),depth+1,intensity*.88));}
    return seg;
  }
  targetHit(seg,t){const q=this.world(t);const ax=seg.x1-q.x,ay=seg.y1-q.y,bx=seg.x2-seg.x1,by=seg.y2-seg.y1;const u=Math.max(0,Math.min(1,-(ax*bx+ay*by)/(bx*bx+by*by)));return Math.hypot(ax+u*bx,ay+u*by)<t.r*Math.min(this.w,this.h);}
  render(){requestAnimationFrame(()=>this.render()); if(!this.level)return;const c=this.ctx; c.clearRect(0,0,this.w,this.h);c.fillStyle='#07111c';c.fillRect(0,0,this.w,this.h);
    const all=[];for(const e of this.level.emitters){const q=this.world(e);all.push(...this.trace(q.x,q.y,e.angle));}
    c.save();c.globalCompositeOperation='lighter';for(const s of all){c.strokeStyle=`rgba(78,220,255,${.14*s.intensity})`;c.lineWidth=18;c.shadowBlur=26;c.shadowColor='#53dcff';c.beginPath();c.moveTo(s.x1,s.y1);c.lineTo(s.x2,s.y2);c.stroke();c.strokeStyle='#baf8ff';c.lineWidth=2.5;c.shadowBlur=8;c.beginPath();c.moveTo(s.x1,s.y1);c.lineTo(s.x2,s.y2);c.stroke();}c.restore();
    for(const w of this.level.walls){c.fillStyle='#263847';c.fillRect(w.x*this.w,w.y*this.h,w.w*this.w,w.h*this.h);c.strokeStyle='#547085';c.strokeRect(w.x*this.w,w.y*this.h,w.w*this.w,w.h*this.h);}
    for(const m of this.level.mirrors){const q=this.world(m),l=m.len*Math.min(this.w,this.h);c.save();c.translate(q.x,q.y);c.rotate(m.angle);c.strokeStyle='#c9f9ff';c.lineWidth=7;c.shadowBlur=15;c.shadowColor='#6eeaff';c.beginPath();c.moveTo(-l/2,0);c.lineTo(l/2,0);c.stroke();c.restore();}
    let hits=0;for(const t of this.level.targets){const q=this.world(t),r=t.r*Math.min(this.w,this.h),active=all.some(s=>this.targetHit(s,t));if(active)hits++;c.beginPath();c.arc(q.x,q.y,r,0,Math.PI*2);c.fillStyle=active?'#78ffd2':'#173c39';c.shadowBlur=active?28:5;c.shadowColor='#63ffd3';c.fill();}
    for(const e of this.level.emitters){const q=this.world(e);c.save();c.translate(q.x,q.y);c.rotate(e.angle);c.fillStyle='#45bfff';c.beginPath();c.arc(0,0,18,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(6,-6);c.lineTo(32,0);c.lineTo(6,6);c.fill();c.restore();}
    if(hits===this.level.targets.length&&!this.completed){this.completed=true;setTimeout(()=>this.onComplete?.({moves:this.moves}),300);}
  }
}