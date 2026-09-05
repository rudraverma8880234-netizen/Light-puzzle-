// 100 deterministic puzzle definitions. Coordinates are normalized (0..1).
// Difficulty rises by introducing more mirrors, splitters, colors and tighter geometry.
const base = (id, mirrors, walls, targets, emitters, splitters=[], filters=[]) => ({id, mirrors, walls, targets, emitters, splitters, filters});

const L = [];
for(let i=1;i<=100;i++){
  const tier=Math.ceil(i/10);
  const mirrors=[];
  const walls=[];
  const targets=[];
  const emitters=[];
  const splitters=[];
  const filters=[];
  // Deterministic generated layouts. Every level remains data-driven and can be hand-tuned.
  emitters.push({x:.10,y:.12+((i*37)%70)/100,angle:((i*29)%360)*Math.PI/180,color:tier>=6?'#dfffff':'#9befff',movable:true});
  targets.push({x:.88,y:.15+((i*53)%70)/100,r:.028,color:tier>=6?(i%3===0?'#ff5b74':i%3===1?'#5cff8b':'#66aaff'):'#8bffdf'});
  const mirrorCount=Math.min(2+tier,9);
  for(let m=0;m<mirrorCount;m++){
    const x=.20+((m*19+i*7)%62)/100, y=.12+((m*31+i*11)%76)/100;
    mirrors.push({x,y,angle:((m*47+i*23)%180)*Math.PI/180,movable:m%3!==0,rotatable:true,len:.11});
  }
  for(let w=0;w<Math.min(tier,7);w++){
    walls.push({x:.22+((w*17+i*3)%58)/100,y:.10+((w*29+i*13)%76)/100,w:.025+((w+i)%3)*.01,h:.12+((w*7+i)%20)/100});
  }
  if(tier>=5) splitters.push({x:.52,y:.50,angle:(i%4)*Math.PI/4});
  if(tier>=7) filters.push({x:.68,y:.32+((i%5)*.09),color:i%3===0?'#ff5b74':i%3===1?'#5cff8b':'#66aaff',angle:Math.PI/2});
  if(tier>=8) targets.push({x:.82,y:.72,r:.025,color:'#8bffdf'});
  L.push(base(i,mirrors,walls,targets,emitters,splitters,filters));
}
export const LEVELS=L;
