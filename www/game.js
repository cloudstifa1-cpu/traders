'use strict';
/* ===== Barter Hollow — data ===== */
const GOODS=['grain','wood','wool','salt','iron'];
const G={grain:{n:'Grain',i:'🌾',v:1},wood:{n:'Wood',i:'🪵',v:1},wool:{n:'Wool',i:'🧶',v:2},salt:{n:'Salt',i:'🧂',v:2},iron:{n:'Iron',i:'⛏️',v:3}};
const ROWS={poor:{n:'Poor Row',c:'#a0522d'},shanty:{n:'Shanty Row',c:'#1b9aaa'},village:{n:'Village Row',c:'#e07a1f'},high:{n:'High Row',c:'#c1121f'}};
const SPACES=[
 {t:'harvest',n:'Harvest',i:'🌻'},
 {t:'prop',n:'Mud Hut',i:'🛖',row:'poor',prod:'grain',cost:{grain:2,wood:1}},
 {t:'fortune',n:'Fortune',i:'🍀'},
 {t:'prop',n:"Hermit's Shack",i:'🏚️',row:'poor',prod:'wood',cost:{grain:1,wood:2}},
 {t:'toll',n:'Toll Bridge',i:'🌉'},
 {t:'post',n:'Trading Post',i:'⚖️'},
 {t:'prop',n:'Shanty Lane',i:'🏘️',row:'shanty',prod:'wool',cost:{wood:2,grain:1,wool:1}},
 {t:'hardship',n:'Hardship',i:'⚡'},
 {t:'prop',n:'Fishing Hut',i:'🎣',row:'shanty',prod:'salt',cost:{wood:2,salt:1,grain:1}},
 {t:'camp',n:'Campfire',i:'🔥'},
 {t:'stocks',n:'The Stocks',i:'⛓️'},
 {t:'prop',n:'Old Mill',i:'⚙️',row:'village',prod:'grain',cost:{wood:2,iron:1,grain:1}},
 {t:'prop',n:'Village Well',i:'🪣',row:'village',prod:'salt',cost:{wood:2,salt:1,iron:1}},
 {t:'fortune',n:'Fortune',i:'🍀'},
 {t:'prop',n:"Tanner's Shed",i:'🐑',row:'village',prod:'wool',cost:{wood:2,wool:1,iron:1}},
 {t:'post',n:'Trading Post',i:'⚖️'},
 {t:'prop',n:'Crossroads Inn',i:'🍺',row:'high',prod:'iron',cost:{wood:2,salt:2,iron:1}},
 {t:'hardship',n:'Hardship',i:'⚡'},
 {t:'prop',n:'Old Chapel',i:'⛪',row:'high',prod:'iron',cost:{wood:2,wool:2,iron:1}},
 {t:'bandit',n:'Bandit Road',i:'🗡️'}
];
const LVL=['','Shanty','Cottage','Homestead'];
const UPG={2:{wood:2,iron:1},3:{wood:2,iron:2,salt:1}};
const COLORS=['#ff4d4d','#3fa9ff','#5ce65c','#c77dff'];
const START={grain:3,wood:3,wool:2,salt:2,iron:1};
const FORTUNE=[
 {t:'Good Harvest',i:'🌾',d:'+2 Grain',f:p=>gain(p,{grain:2})},
 {t:'Traveling Merchant',i:'🐫',d:'+1 Iron',f:p=>gain(p,{iron:1})},
 {t:'Found Timber',i:'🌲',d:'+2 Wood',f:p=>gain(p,{wood:2})},
 {t:'Wool Fair',i:'🐑',d:'+2 Wool',f:p=>gain(p,{wool:2})},
 {t:'Salt Cart',i:'🛒',d:'+2 Salt',f:p=>gain(p,{salt:2})},
 {t:"Neighbors' Help",i:'🤝',d:'Each player gives you 1 Grain',f:p=>others(p).forEach(o=>{if(o.goods.grain>0){o.goods.grain--;p.goods.grain++;}})},
 {t:'Shortcut',i:'🧭',d:'Move to Harvest and collect',f:p=>{p.pos=0;harvest(p);}},
 {t:'Lucky Find',i:'💰',d:'+1 of every good',f:p=>gain(p,{grain:1,wood:1,wool:1,salt:1,iron:1})}
];
const HARDSHIP=[
 {t:'Famine',i:'🥀',d:'Lose 2 Grain',f:p=>lose(p,{grain:2})},
 {t:'Spoiled Cellar',i:'🪰',d:'Lose 1 Salt',f:p=>lose(p,{salt:1})},
 {t:'Storm',i:'⛈️',d:'Lose 2 Wood',f:p=>lose(p,{wood:2})},
 {t:'Moths',i:'🦋',d:'Lose 1 Wool',f:p=>lose(p,{wool:1})},
 {t:'Caught Poaching',i:'⛓️',d:'Go to The Stocks — skip your next turn',f:p=>{p.pos=10;p.stocks=1;}},
 {t:'Broken Plow',i:'🔨',d:'Lose 1 Iron',f:p=>lose(p,{iron:1})},
 {t:'Tithe',i:'⛪',d:'Give 1 good to each player',f:p=>others(p).forEach(o=>{const g=cheapest(p);if(g){p.goods[g]--;o.goods[g]++;}})},
 {t:'Bandits',i:'🗡️',d:'Lose 2 random goods',f:p=>{loseRandom(p);loseRandom(p);}}
];

/* ===== state ===== */
let S=null;
const $=s=>document.querySelector(s);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const cur=()=>S.players[S.turn];
const active=()=>S.players.filter(p=>!p.out);
const others=p=>active().filter(o=>o!==p);
const total=p=>GOODS.reduce((s,g)=>s+p.goods[g],0);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const fmt=c=>GOODS.filter(g=>c[g]).map(g=>`${c[g]} ${G[g].i}`).join(' ')||'nothing';
const costVal=c=>GOODS.reduce((s,g)=>s+(c[g]||0)*G[g].v,0);
const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));

function gain(p,c){GOODS.forEach(g=>p.goods[g]+=c[g]||0);}
function lose(p,c){GOODS.forEach(g=>p.goods[g]=Math.max(0,p.goods[g]-(c[g]||0)));}
function loseRandom(p){const have=GOODS.filter(g=>p.goods[g]>0);if(have.length){const g=have[Math.floor(Math.random()*have.length)];p.goods[g]--;return g;}return null;}
function cheapest(p,ex){return GOODS.filter(g=>g!==ex&&p.goods[g]>0).sort((a,b)=>G[a].v-G[b].v||p.goods[b]-p.goods[a])[0];}
function has(p,c){return GOODS.every(g=>p.goods[g]>=(c[g]||0));}
function spend(p,c){GOODS.forEach(g=>p.goods[g]-=c[g]||0);}
function log(m){S.log.unshift(m);S.log=S.log.slice(0,6);}
function save(){try{localStorage.setItem('bh_save',JSON.stringify(S));}catch(e){}}
function loadSave(){try{return JSON.parse(localStorage.getItem('bh_save'));}catch(e){return null;}}
function clearSave(){try{localStorage.removeItem('bh_save');}catch(e){}}

function propsOf(p){return Object.keys(S.props).map(Number).filter(i=>S.props[i].owner===S.players.indexOf(p));}
function rowIdx(r){return SPACES.map((s,i)=>s.row===r?i:-1).filter(i=>i>=0);}
function ownsRow(p,r){const pi=S.players.indexOf(p);return rowIdx(r).every(i=>S.props[i]&&S.props[i].owner===pi);}
function rowsDone(p){return Object.keys(ROWS).filter(r=>ownsRow(p,r)).length;}
function propVal(i){const lv=S.props[i]?S.props[i].level:1;let v=costVal(SPACES[i].cost);if(lv>=2)v+=costVal(UPG[2]);if(lv>=3)v+=costVal(UPG[3]);return v;}
function worth(p){return costVal(p.goods)+propsOf(p).reduce((s,i)=>s+propVal(i),0);}
function rentOf(i){const pr=S.props[i];return pr.level+(ownsRow(S.players[pr.owner],SPACES[i].row)?1:0);}

/* pay n of a good; missing units cost 2 of the cheapest other goods each */
function canPay(p,good,n){const h=Math.min(p.goods[good],n);return total(p)-p.goods[good]>=2*(n-h);}
function pay(p,good,n,to){
 const paid={};const mv=(g)=>{p.goods[g]--;paid[g]=(paid[g]||0)+1;if(to)to.goods[g]++;};
 for(let k=0;k<n;k++){if(p.goods[good]>0)mv(good);else{mv(cheapest(p,good));mv(cheapest(p,good));}}
 return paid;
}
function bankrupt(p,to){
 if(to)gain(to,p.goods);GOODS.forEach(g=>p.goods[g]=0);
 propsOf(p).forEach(i=>delete S.props[i]);p.out=true;
 log(`💀 ${p.name} could not pay and is out!`);
}
function harvest(p){
 const got={};propsOf(p).forEach(i=>{const g=SPACES[i].prod;got[g]=(got[g]||0)+S.props[i].level;});
 gain(p,got);if(Object.keys(got).length)log(`🌻 ${p.name} harvests ${fmt(got)}`);else log(`🌻 ${p.name} passes Harvest (no land yet)`);
}

/* ===== screens ===== */
function title(){
 const sv=loadSave();
 $('#app').innerHTML=`<h1>Barter Hollow</h1><div class="sub">A humble game of goods &amp; trade</div>
 <div class="stack"><button id="bNew">New Game</button>
 ${sv&&!sv.winner?'<button class="alt" id="bCont">Continue</button>':''}
 <button class="alt" id="bRules">How to Play</button></div>`;
 $('#bNew').onclick=setup;
 if($('#bCont'))$('#bCont').onclick=()=>{S=sv;S.busy=false;renderGame();if(S.phase==='end'&&!cur().ai)render();else{S.phase='roll';startTurn(true);}};
 $('#bRules').onclick=rules;
}
function rules(){
 modal('How to Play',`<p>There is no money. You buy, rent and build with <b>goods</b>.</p>
 <p>🌾 Grain 1 · 🪵 Wood 1 · 🧶 Wool 2 · 🧂 Salt 2 · ⛏️ Iron 3 (trade values)</p>
 <p><b>Your turn:</b> roll, move, then deal with the space you land on.</p>
 <p><b>Buy</b> an empty property by paying its goods. <b>Rent:</b> landing on someone's land, you pay them its good. No good? Pay 2 of your cheapest goods instead for each one owed.</p>
 <p><b>Harvest:</b> each time you pass 🌻, every property you own makes its good (more after upgrades).</p>
 <p><b>Upgrade</b> once you own a whole row: Shanty → Cottage → Homestead. More rent, more harvest.</p>
 <p><b>Trading Post</b> ⚖️: swap 2 goods for 1 of your choice. You can also <b>Trade</b> with players on your turn.</p>
 <p><b>Win:</b> own 2 full rows, or be the last one standing, or have the most worth when the round limit ends.</p>`,[{t:'Got it'}]);
}
function setup(){
 const seats=[{k:'human',n:'Raven'},{k:'ai',n:'Old Tom'},{k:'off',n:'Widow Bea'},{k:'off',n:'Jeb'}];
 let limit=30;
 const draw=()=>{
  $('#app').innerHTML=`<h2>New Game</h2><div class="stack">${seats.map((s,i)=>`<div class="card row">
   <span class="dot" style="background:${COLORS[i]}"></span>
   <input type="text" maxlength="12" data-i="${i}" value="${esc(s.n)}" ${s.k==='off'?'disabled':''}>
   <button class="sm ${s.k==='off'?'alt':''}" data-k="${i}">${s.k==='human'?'👤 Human':s.k==='ai'?'🤖 Computer':'— Off'}</button></div>`).join('')}
   <div class="card row">Round limit: <button class="sm" id="bLim">${limit?limit+' rounds':'None'}</button></div>
   <button id="bStart">Start Game</button><button class="alt" id="bBack">Back</button></div>`;
  document.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const s=seats[b.dataset.k];
   s.k=s.k==='human'?'ai':s.k==='ai'?(b.dataset.k>1?'off':'human'):'human';draw();});
  document.querySelectorAll('input[data-i]').forEach(inp=>inp.oninput=()=>seats[inp.dataset.i].n=inp.value);
  $('#bLim').onclick=()=>{limit={20:30,30:40,40:0,0:20}[limit];draw();};
  $('#bBack').onclick=title;
  $('#bStart').onclick=()=>{
   const ps=seats.map((s,i)=>({...s,i})).filter(s=>s.k!=='off');
   S={players:ps.map(s=>({name:(s.n.trim()||'Player '+(s.i+1)).slice(0,12),color:COLORS[s.i],ai:s.k==='ai',goods:{...START},pos:0,out:false,stocks:0})),
    props:{},turn:0,round:1,limit,die:null,phase:'roll',log:['The hollow awakens. Good trading!'],
    fortune:shuffle([...FORTUNE.keys()]),hardship:shuffle([...HARDSHIP.keys()]),winner:null,busy:false};
   renderGame();startTurn();
  };
 };
 draw();
}

/* ===== board render ===== */
function cell(i){if(i<=5)return[0,i];if(i<=10)return[i-5,5];if(i<=15)return[5,5-(i-10)];return[5-(i-15),0];}
function renderGame(){
 let h='<div id="board">';
 SPACES.forEach((s,i)=>{const[r,c]=cell(i);h+=`<div class="tile ${i%5===0?'corner':s.t!=='prop'?'special':''}" id="t${i}" data-t="${i}" style="grid-row:${r+1};grid-column:${c+1}"></div>`;});
 h+=`<div class="center"><div class="rnd" id="rnd"></div><div class="die" id="die">🎲</div>
  <div class="chart">🌾1 🪵1 🧶2<br>🧂2 ⛏️3</div></div></div>
  <div class="panel card"><div class="who" id="who"></div><div class="goods" id="goods"></div><div class="actions" id="acts"></div></div>
  <div class="plist" id="plist"></div><div class="log" id="log"></div>`;
 $('#app').innerHTML=h;
 document.querySelectorAll('[data-t]').forEach(t=>t.onclick=()=>tileInfo(+t.dataset.t));
 render();
}
function render(){
 if(!S||!$('#board'))return;
 SPACES.forEach((s,i)=>{
  const pr=S.props[i];const own=pr?S.players[pr.owner]:null;
  const toks=S.players.filter(p=>!p.out&&p.pos===i).map(p=>`<span class="tok" style="background:${p.color}"></span>`).join('');
  const el=$('#t'+i);
  el.style.borderColor=own?own.color:'transparent';
  el.innerHTML=`${s.row?`<div class="bar" style="background:${ROWS[s.row].c}"></div>`:''}<div class="ic">${s.i}</div><div class="nm">${esc(s.n)}</div>
   ${pr?`<div class="lvl">${'★'.repeat(pr.level)}</div>`:''}<div class="toks">${toks}</div>`;
 });
 const p=cur();
 $('#rnd').textContent=`Round ${S.limit?Math.min(S.round,S.limit):S.round}${S.limit?' of '+S.limit:''}`;
 $('#die').textContent=S.die?['⚀','⚁','⚂','⚃','⚄','⚅'][S.die-1]:'🎲';
 $('#who').innerHTML=`<span style="color:${p.color}">${esc(p.name)}</span>${p.ai?' 🤖':''}`;
 const showGoods=!(S.hideGoods);
 $('#goods').innerHTML=GOODS.map(g=>`<div class="gd">${G[g].i} ${showGoods?p.goods[g]:'?'}<small>${G[g].n}</small></div>`).join('');
 let a='';
 if(S.winner)a='<button id="aNew">New Game</button>';
 else if(!p.ai&&!S.busy){
  if(S.phase==='roll')a='<button id="aRoll">🎲 Roll</button>';
  else if(S.phase==='end')a='<button class="alt" id="aTrade">🤝 Trade</button><button class="alt" id="aUp">🏠 Build</button><button id="aEnd">End Turn ➜</button>';
 }else a='<div style="padding:10px 0">'+(p.ai?esc(p.name)+' is thinking…':'…')+'</div>';
 $('#acts').innerHTML=a;
 if($('#aRoll'))$('#aRoll').onclick=()=>doRoll();
 if($('#aEnd'))$('#aEnd').onclick=()=>nextTurn();
 if($('#aTrade'))$('#aTrade').onclick=()=>tradeUI(p);
 if($('#aUp'))$('#aUp').onclick=()=>upgradeUI(p);
 if($('#aNew'))$('#aNew').onclick=()=>{clearSave();title();};
 $('#plist').innerHTML=S.players.map((q,i)=>`<div class="pl ${i===S.turn?'cur':''} ${q.out?'out':''}">
  <span><span class="dot" style="background:${q.color}"></span> ${esc(q.name)}${q.ai?' 🤖':''}${q.stocks?' ⛓️':''}</span>
  <span>🏠 ${propsOf(q).length} · Rows ${rowsDone(q)} · Worth ${worth(q)}</span></div>`).join('');
 $('#log').innerHTML=S.log.map(esc).join('<br>');
}
function tileInfo(i){
 const s=SPACES[i];const pr=S.props[i];
 let b='';
 if(s.t==='prop'){
  b=`<p><b>${ROWS[s.row].n}</b> · Produces ${G[s.prod].i} ${G[s.prod].n}</p><p>Cost: ${fmt(s.cost)}</p>`;
  b+=pr?`<p>Owner: <b style="color:${S.players[pr.owner].color}">${esc(S.players[pr.owner].name)}</b> · ${LVL[pr.level]} · Rent ${rentOf(i)} ${G[s.prod].i}</p>`:'<p>Unowned</p>';
 }else b={harvest:'<p>Passing or landing here: each property you own makes its good.</p>',fortune:'<p>Draw a Fortune card.</p>',hardship:'<p>Draw a Hardship card.</p>',
  toll:'<p>Pay 1 Grain or 1 Wood to cross.</p>',post:'<p>Swap 2 of any goods for 1 of your choice. Repeat as you like.</p>',camp:'<p>Rest. Nothing happens.</p>',
  stocks:'<p>Just visiting — unless a card locks you here (skip a turn).</p>',bandit:'<p>Bandits take 1 random good.</p>'}[s.t];
 modal(`${s.i} ${s.n}`,b,[{t:'Close'}]);
}

/* ===== modal & toast ===== */
function modal(t,body,btns,onOpen){
 return new Promise(res=>{
  $('#modalBox').innerHTML=`<h3>${t}</h3>${body}<div class="mbtns">${btns.map((b,i)=>`<button data-m="${i}" class="${b.c||''}" ${b.off?'disabled':''}>${b.t}</button>`).join('')}</div>`;
  $('#modal').classList.remove('hidden');
  document.querySelectorAll('[data-m]').forEach(el=>el.onclick=()=>{$('#modal').classList.add('hidden');res(btns[+el.dataset.m].v);});
  if(onOpen)onOpen();
 });
}
let toastT;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.add('hidden'),1800);}
const humans=()=>active().filter(p=>!p.ai).length;

/* ===== turn flow ===== */
async function startTurn(resumed){
 if(checkWin())return;
 const p=cur();S.die=null;S.phase='roll';
 if(!p.ai&&humans()>1&&!resumed){S.hideGoods=true;render();await modal('Pass the Phone',`<p>Hand the phone to <b style="color:${p.color}">${esc(p.name)}</b>.</p>`,[{t:`I'm ${esc(p.name)}`}]);S.hideGoods=false;}
 if(p.stocks>0){
  p.stocks--;log(`⛓️ ${p.name} sits in The Stocks this turn.`);render();
  if(p.ai){await sleep(900);}else await modal('The Stocks','<p>You are locked in The Stocks. You skip this turn.</p>',[{t:'OK'}]);
  return nextTurn();
 }
 render();
 if(p.ai){S.busy=true;render();await sleep(700);await doRoll();}
}
async function doRoll(){
 const p=cur();S.busy=true;S.phase='moving';
 for(let k=0;k<6;k++){S.die=1+Math.floor(Math.random()*6);render();await sleep(70);}
 const d=S.die;log(`🎲 ${p.name} rolls ${d}.`);
 for(let k=0;k<d;k++){p.pos=(p.pos+1)%20;if(p.pos===0)harvest(p);render();await sleep(200);}
 await resolve(p);
 if(checkWin())return;
 if(p.out)return nextTurn();
 if(p.ai){await aiAfter(p);if(checkWin())return;await sleep(500);return nextTurn();}
 S.busy=false;S.phase='end';render();save();
}
function nextTurn(){
 if(checkWin())return;
 let n=S.turn;
 do{n=(n+1)%S.players.length;if(n===0)S.round++;}while(S.players[n].out);
 S.turn=n;S.busy=false;
 if(checkWin())return;
 save();render();startTurn();
}
function checkWin(){
 if(S.winner){render();return true;}
 const a=active();let w=null,why='';
 if(a.length===1){w=a[0];why='is the last trader standing!';}
 else{const r=a.find(p=>rowsDone(p)>=2);if(r){w=r;why='owns two full rows!';}
  else if(S.limit&&S.round>S.limit){w=a.slice().sort((x,y)=>worth(y)-worth(x))[0];why=`has the most worth (${worth(w)}) after ${S.limit} rounds!`;}}
 if(!w)return false;
 S.winner=w.name;S.busy=false;log(`🏆 ${w.name} wins!`);clearSave();render();
 modal('🏆 Winner!',`<div class="cardart">👑</div><p style="text-align:center"><b style="color:${w.color}">${esc(w.name)}</b> ${why}</p>`,[{t:'Play Again',v:'new'},{t:'View Board',c:'alt'}]).then(v=>{if(v==='new')setup();});
 return true;
}

/* ===== landing ===== */
async function resolve(p){
 const i=p.pos,s=SPACES[i];
 if(s.t==='prop'){
  const pr=S.props[i];
  if(!pr){
   const ok=has(p,s.cost);
   let buy;
   if(p.ai)buy=ok&&aiWantsBuy(p,i);
   else buy=await modal(`${s.i} ${s.n}`,`<p><b>${ROWS[s.row].n}</b> · makes ${G[s.prod].i} ${G[s.prod].n}</p><p>Cost: <b>${fmt(s.cost)}</b></p>${ok?'':'<p style="color:var(--bad)"><b>You don\'t have enough goods.</b></p>'}`,
    [{t:'Buy',v:true,off:!ok},{t:'Pass',v:false,c:'alt'}]);
   if(buy){spend(p,s.cost);S.props[i]={owner:S.players.indexOf(p),level:1};log(`🏠 ${p.name} buys ${s.n}.`);if(p.ai)toast(`${p.name} buys ${s.n}`);}
  }else if(S.players[pr.owner]!==p){
   const o=S.players[pr.owner],n=rentOf(i);
   if(!canPay(p,s.prod,n)){bankrupt(p,o);render();if(!p.ai)await modal('Ruined!','<p>You cannot pay the rent. You are out of the game.</p>',[{t:'OK'}]);return;}
   const paid=pay(p,s.prod,n,o);log(`💸 ${p.name} pays ${o.name} ${fmt(paid)} rent.`);
   if(!p.ai)await modal('Rent Due',`<p>${s.n} belongs to <b style="color:${o.color}">${esc(o.name)}</b>.</p><p>You paid <b>${fmt(paid)}</b>.</p>`,[{t:'OK'}]);else toast(`${p.name} pays rent`);
  }
 }else if(s.t==='fortune'||s.t==='hardship'){
  const deck=s.t==='fortune'?'fortune':'hardship';const list=s.t==='fortune'?FORTUNE:HARDSHIP;
  if(!S[deck].length)S[deck]=shuffle([...list.keys()]);
  const c=list[S[deck].pop()];
  const before=p.pos;c.f(p);log(`${s.i} ${p.name}: ${c.t} — ${c.d}`);render();
  if(p.ai){toast(`${p.name}: ${c.t}`);await sleep(900);}
  else await modal(s.n,`<div class="cardart">${c.i}</div><p style="text-align:center"><b>${c.t}</b></p><p style="text-align:center">${c.d}</p>`,[{t:'OK'}]);
  if(p.pos!==before)render();
 }else if(s.t==='toll'){
  const g=p.goods.grain>0?'grain':p.goods.wood>0?'wood':null;
  if(g){p.goods[g]--;log(`🌉 ${p.name} pays 1 ${G[g].n} at the bridge.`);}
  else if(canPay(p,'grain',1)){const pd=pay(p,'grain',1,null);log(`🌉 ${p.name} pays ${fmt(pd)} at the bridge.`);}
  else{bankrupt(p,null);}
  if(!p.ai&&!p.out)await modal('Toll Bridge',`<p>You paid the toll.</p>`,[{t:'OK'}]);
 }else if(s.t==='post'){
  if(p.ai)aiPost(p);else await postUI(p);
 }else if(s.t==='bandit'){
  const g=loseRandom(p);log(`🗡️ Bandits rob ${p.name}${g?' of 1 '+G[g].n:' — but find nothing'}.`);
  if(!p.ai)await modal('Bandit Road',`<div class="cardart">🗡️</div><p>${g?`Bandits took 1 ${G[g].i} ${G[g].n}.`:'Bandits found nothing to steal.'}</p>`,[{t:'OK'}]);
 }
 render();
}

/* ===== trading post ===== */
function postUI(p){
 return new Promise(res=>{
  let give=[],get=null;
  const draw=()=>{
   const body=`<p>Pick <b>2 goods to give</b> (tap twice for 2 of the same) and <b>1 to get</b>.</p>
   <p><b>Give:</b> ${give.map(g=>G[g].i).join(' ')||'—'}</p>
   <div class="pick">${GOODS.map(g=>`<button data-g="${g}" ${p.goods[g]-give.filter(x=>x===g).length<=0?'disabled':''}>${G[g].i}<small>${p.goods[g]}</small></button>`).join('')}</div>
   <p><b>Get:</b></p><div class="pick">${GOODS.map(g=>`<button data-r="${g}" class="${get===g?'on':''}">${G[g].i}<small>${G[g].n}</small></button>`).join('')}</div>`;
   modal('⚖️ Trading Post',body,[{t:'Swap',v:'swap',off:!(give.length===2&&get)},{t:'Clear',v:'clear',c:'alt'},{t:'Done',v:'done',c:'alt'}],()=>{
    document.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{if(give.length<2){give.push(b.dataset.g);draw();}});
    document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{get=b.dataset.r;draw();});
   }).then(v=>{
    if(v==='swap'){give.forEach(g=>p.goods[g]--);p.goods[get]++;log(`⚖️ ${p.name} swaps ${give.map(g=>G[g].i).join('')} for ${G[get].i}`);give=[];get=null;render();draw();}
    else if(v==='clear'){give=[];get=null;draw();}
    else res();
   });
  };
  draw();
 });
}

/* ===== building ===== */
function upgradeUI(p){
 const list=propsOf(p).filter(i=>ownsRow(p,SPACES[i].row));
 if(!list.length){modal('🏠 Build','<p>You can only build once you own a <b>whole row</b> (all the same color bar).</p>',[{t:'OK'}]);return;}
 const body=list.map(i=>{const lv=S.props[i].level;const c=UPG[lv+1];
  return `<div class="step"><span>${SPACES[i].i} ${esc(SPACES[i].n)}<br><small>${LVL[lv]}${c?' → '+LVL[lv+1]+': '+fmt(c):' (max)'}</small></span>
  ${c?`<button class="sm" data-u="${i}" ${has(p,c)?'':'disabled'}>Build</button>`:''}</div>`;}).join('');
 modal('🏠 Build',`<p>Better buildings earn more rent and harvest.</p>${body}`,[{t:'Close',c:'alt'}],()=>{
  document.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{const i=+b.dataset.u;const lv=S.props[i].level;spend(p,UPG[lv+1]);S.props[i].level++;
   log(`🔨 ${p.name} builds a ${LVL[lv+1]} at ${SPACES[i].n}.`);$('#modal').classList.add('hidden');render();save();upgradeUI(p);});
 });
}

/* ===== player trading ===== */
function tradeUI(p){
 const os=others(p);
 if(!os.length)return;
 modal('🤝 Trade — with whom?','',[...os.map(o=>({t:esc(o.name)+(o.ai?' 🤖':''),v:o})),{t:'Cancel',c:'alt'}]).then(o=>{if(o)tradeBuild(p,o);});
}
function tradeBuild(p,o){
 const T={give:{},get:{},gp:[],rp:[]};GOODS.forEach(g=>{T.give[g]=0;T.get[g]=0;});
 const side=(who,key,pk,label)=>`<h3 style="font-size:18px">${label}</h3>${GOODS.map(g=>`<div class="step"><span>${G[g].i} ${G[g].n} <small>(has ${who.goods[g]})</small></span>
   <span class="ctl"><button class="sm alt" data-d="${key}:${g}:-1">−</button><b>${T[key][g]}</b><button class="sm alt" data-d="${key}:${g}:1">+</button></span></div>`).join('')}
   <div class="chips">${propsOf(who).map(i=>`<button class="chip ${T[pk].includes(i)?'on':''}" data-p="${pk}:${i}">${SPACES[i].i} ${esc(SPACES[i].n)}</button>`).join('')||'<small>No properties</small>'}</div>`;
 const draw=()=>{
  const body=`<div class="tcols"><div>${side(p,'give','gp','You give')}</div><div>${side(o,'get','rp',esc(o.name)+' gives')}</div></div>`;
  const empty=!GOODS.some(g=>T.give[g]||T.get[g])&&!T.gp.length&&!T.rp.length;
  modal('🤝 Trade',body,[{t:'Offer',v:'offer',off:empty},{t:'Cancel',v:'x',c:'alt'}],()=>{
   document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const[k,g,d]=b.dataset.d.split(':');const who=k==='give'?p:o;
    T[k][g]=Math.max(0,Math.min(who.goods[g],T[k][g]+(+d)));draw();});
   document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{const[k,i]=b.dataset.p.split(':');const a=T[k];const n=+i;
    const at=a.indexOf(n);if(at>=0)a.splice(at,1);else a.push(n);draw();});
  }).then(async v=>{
   if(v!=='offer')return;
   const valGive=costVal(T.give)+T.gp.reduce((s,i)=>s+propVal(i),0);
   const valGet=costVal(T.get)+T.rp.reduce((s,i)=>s+propVal(i),0);
   let yes;
   if(o.ai){
    const breaksRow=T.rp.some(i=>ownsRow(o,SPACES[i].row));
    yes=valGive>valGet+(breaksRow?4:0);
    await modal(yes?'Deal!':'No Deal',`<p><b>${esc(o.name)}</b> ${yes?'accepts your offer.':'turns it down. Offer more value.'}</p>`,[{t:'OK'}]);
   }else{
    await modal('Pass the Phone',`<p>Hand the phone to <b style="color:${o.color}">${esc(o.name)}</b> to answer the offer.</p>`,[{t:`I'm ${esc(o.name)}`}]);
    yes=await modal('Trade Offer',`<p><b style="color:${p.color}">${esc(p.name)}</b> offers:</p><p>${fmt(T.give)} ${T.gp.map(i=>SPACES[i].i+' '+esc(SPACES[i].n)).join(', ')}</p>
     <p>For your:</p><p>${fmt(T.get)} ${T.rp.map(i=>SPACES[i].i+' '+esc(SPACES[i].n)).join(', ')}</p>`,[{t:'Accept',v:true},{t:'Decline',v:false,c:'red'}]);
    await modal('Pass the Phone',`<p>Hand the phone back to <b style="color:${p.color}">${esc(p.name)}</b>. ${yes?'Deal accepted!':'Deal declined.'}</p>`,[{t:`I'm ${esc(p.name)}`}]);
   }
   if(yes){
    const pi=S.players.indexOf(p),oi=S.players.indexOf(o);
    GOODS.forEach(g=>{p.goods[g]+=T.get[g]-T.give[g];o.goods[g]+=T.give[g]-T.get[g];});
    T.gp.forEach(i=>S.props[i].owner=oi);T.rp.forEach(i=>S.props[i].owner=pi);
    log(`🤝 ${p.name} and ${o.name} make a trade.`);save();
   }
   render();checkWin();
  });
 };
 draw();
}

/* ===== computer players ===== */
function aiWantsBuy(p,i){
 const s=SPACES[i];const left=total(p)-Object.values(s.cost).reduce((a,b)=>a+b,0);
 const r=s.row;const mine=rowIdx(r).filter(j=>S.props[j]&&S.props[j].owner===S.players.indexOf(p)).length;
 return left>=3||(mine>0&&left>=1);
}
function aiPost(p){
 for(let k=0;k<3;k++){
  const want=p.goods.iron<2?'iron':GOODS.slice().sort((a,b)=>p.goods[a]-p.goods[b])[0];
  const extra=GOODS.filter(g=>g!==want).sort((a,b)=>p.goods[b]-p.goods[a]||G[a].v-G[b].v)[0];
  if(p.goods[extra]<4)break;
  p.goods[extra]-=2;p.goods[want]++;log(`⚖️ ${p.name} swaps 2 ${G[extra].i} for ${G[want].i}`);
 }
}
async function aiTrade(p){
 const pi=S.players.indexOf(p);
 for(const r of Object.keys(ROWS)){
  const idx=rowIdx(r);const mine=idx.filter(j=>S.props[j]&&S.props[j].owner===pi);
  const miss=idx.filter(j=>!(S.props[j]&&S.props[j].owner===pi));
  if(mine.length===0||miss.length!==1||!S.props[miss[0]])continue;
  const i=miss[0],o=S.players[S.props[i].owner];
  if(o.out||ownsRow(o,r))continue;
  const need=propVal(i)+2;const offer={};let v=0;
  for(const g of GOODS.slice().sort((a,b)=>p.goods[b]-p.goods[a])){while(v<need&&p.goods[g]-(offer[g]||0)>1){offer[g]=(offer[g]||0)+1;v+=G[g].v;}}
  if(v<need)continue;
  let yes;
  if(o.ai)yes=true;
  else{
   await modal('Pass the Phone',`<p>Hand the phone to <b style="color:${o.color}">${esc(o.name)}</b>.</p>`,[{t:`I'm ${esc(o.name)}`}]);
   yes=await modal('Trade Offer',`<p><b style="color:${p.color}">${esc(p.name)}</b> 🤖 offers <b>${fmt(offer)}</b> for your <b>${SPACES[i].i} ${esc(SPACES[i].n)}</b>.</p><p>(That would give them the whole ${ROWS[r].n}.)</p>`,[{t:'Accept',v:true},{t:'Decline',v:false,c:'red'}]);
  }
  if(yes){spend(p,offer);gain(o,offer);S.props[i].owner=pi;log(`🤝 ${p.name} buys ${SPACES[i].n} from ${o.name} for ${fmt(offer)}.`);render();await sleep(500);}
  else log(`🙅 ${o.name} refuses ${p.name}'s offer.`);
  return;
 }
}
async function aiAfter(p){
 if(Math.random()<0.5)await aiTrade(p);
 if(checkWin())return;
 let built=true;
 while(built){built=false;
  for(const i of propsOf(p)){
   if(!ownsRow(p,SPACES[i].row))continue;const lv=S.props[i].level;const c=UPG[lv+1];
   if(c&&has(p,c)&&total(p)-Object.values(c).reduce((a,b)=>a+b,0)>=2){spend(p,c);S.props[i].level++;log(`🔨 ${p.name} builds a ${LVL[lv+1]} at ${SPACES[i].n}.`);built=true;render();await sleep(400);}
  }
 }
 save();
}

title();
