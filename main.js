import {LEVELS} from './levels.js';
import {Engine} from './engine.js';

const $=s=>document.querySelector(s);
const canvas=$('#game'), home=$('#home'), panel=$('#levelPanel'), complete=$('#complete');
const progress=JSON.parse(localStorage.getItem('lumen-progress')||'{"unlocked":1,"done":{}}');
let current=Math.max(1,progress.unlocked)-1;
const engine=new Engine(canvas,({moves})=>finish(moves));
engine.render();

function save(){localStorage.setItem('lumen-progress',JSON.stringify(progress));}
function start(i=current){current=i;engine.setOriginal(LEVELS[current]);home.classList.remove('show');panel.classList.remove('show');complete.classList.remove('show');$('#levelLabel').textContent=`LEVEL ${String(current+1).padStart(3,'0')}`;}
function finish(moves){progress.done[current+1]={moves};progress.unlocked=Math.max(progress.unlocked,Math.min(100,current+2));save();$('#completeStats').textContent=`LEVEL ${current+1} • ${moves} MOVES`;complete.classList.add('show');}
function grid(){const g=$('#levelGrid');g.innerHTML='';for(let i=1;i<=100;i++){const b=document.createElement('button');b.textContent=i;b.className='levelBtn '+(i>progress.unlocked?'locked':'')+(progress.done[i]?' done':'');b.disabled=i>progress.unlocked;b.onclick=()=>start(i-1);g.appendChild(b);}}
$('#playBtn').onclick=()=>start(0);
$('#continueBtn').onclick=()=>start(Math.max(0,progress.unlocked-2));
$('#levelsBtn').onclick=()=>{grid();panel.classList.add('show');};
$('#homeBtn').onclick=()=>home.classList.add('show');
$('#closeLevels').onclick=()=>panel.classList.remove('show');
$('#undoBtn').onclick=()=>engine.undo();
$('#restartBtn').onclick=()=>start(current);
$('#nextBtn').onclick=()=>start((current+1)%100);
$('#replayBtn').onclick=()=>start(current);
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));
start(current);
