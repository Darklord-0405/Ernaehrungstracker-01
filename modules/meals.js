/* ---------- meal slots ---------- */
const DEF_MEALS={fruh:true,snacks:true,spaet:true,midnight:false};
const SLOTDEF=[
 {k:"fruh",label:"Frühstück",from:5,w:1,cat:"fruh",opt:"fruh",rem:[9,30],title:"Zeit fürs Frühstück"},
 {k:"snack1",label:"Vormittags-Snack",from:10,w:.5,cat:"snack",opt:"snacks",rem:null,title:"Zeit für einen Snack"},
 {k:"mittag",label:"Mittagessen",from:12,w:1,cat:"mittag",rem:[12,30],title:"Zeit fürs Mittagessen"},
 {k:"snack2",label:"Nachmittags-Snack",from:14.5,w:.5,cat:"snack",opt:"snacks",rem:[15,30],title:"Zeit für einen Snack"},
 {k:"abend",label:"Abendessen",from:17.5,w:1,cat:"abend",rem:[18,30],title:"Zeit fürs Abendessen"},
 {k:"spaet",label:"Später Snack",from:21,w:.5,cat:"snack",night:true,opt:"spaet",rem:[21,15],title:"Zeit für einen späten Snack"},
 {k:"midnight",label:"Midnight Snack",from:22.5,w:.5,cat:"snack",night:true,opt:"midnight",rem:[23,15],title:"Zeit für deinen Midnight Snack"}
];
function mealCfg(){return {...DEF_MEALS,...(profile.meals||{})}}
function activeSlots(){const M=mealCfg();return SLOTDEF.filter(s=>!s.opt||M[s.opt])}
function slotNow(h=new Date().getHours()+new Date().getMinutes()/60){
  const hh=h<5?h+24:h, act=activeSlots();
  let idx=-1;act.forEach((s,i)=>{if(s.from<=hh)idx=i});
  const rest=idx<0?act:act.slice(idx), cur=rest[0];
  const sumW=rest.reduce((a,s)=>a+s.w,0)||1;
  return [cur.k,cur.label,rest.length,cur,cur.w/sumW];
}
function mealPlan(){return activeSlots().filter(s=>s.rem)}
function planFrac(slot){const act=activeSlots(),tot=act.reduce((a,s)=>a+s.w,0)||1;let before=0;for(const s of act){if(s===slot)break;before+=s.w}return (before+slot.w*.5)/tot}
function slotPool(slot){const p=genPool(slot.cat);return slot.night?p.filter(r=>r.night):p}
function ideaFor(slot,seed){const p=slotPool(slot);return p[Math.abs(seed*7919)%p.length].name}
function mealShares(){const T=targets(),act=activeSlots(),tot=act.reduce((a,s)=>a+s.w,0)||1;return act.map(s=>[s.label,Math.round(T.kcal*s.w/tot/10)*10])}

/* ---------- meal suggestions ---------- */
let aiSugs=null, sugPtr={};
try{sugPtr=JSON.parse(localStorage.getItem("zl-sugptr")||"{}")||{}}catch(e){}
function saveSugPtr(){try{localStorage.setItem("zl-sugptr",JSON.stringify(sugPtr))}catch(e){}}
const sugOrder={};
function orderFor(slot){
  if(sugOrder[slot.k])return sugOrder[slot.k];
  const pool=slotPool(slot), idx=pool.map((_,i)=>i);
  let seed=0;for(const c of slot.k)seed=seed*31+c.charCodeAt(0);
  shuffle(idx,seed+7);
  return sugOrder[slot.k]={pool,idx};
}
function scaleRecipe(r,f){
  const s={...r,baseName:r.name,factor:f,base:r};
  FDK.forEach(k=>s[k]=Math.round(r[k]*f*10)/10);
  s.micros={};NK.forEach(k=>s.micros[k]=(+r.micros[k]||0)*f);
  return s;
}
function ingItem(k,g){
  const d=FD[k],f=g/100,o={name:d[0],portion:`${Math.round(g)} ${fdUnit(k)==="ml"?"ml":"g"}`,source:"rezeptidee",nova:d[2]};
  FDK.forEach((key,i)=>o[key]=Math.round(d[3+i]*f*10)/10);
  o.micros={};NK.forEach((key,i)=>o.micros[key]=Math.round(d[11+i]*f*100)/100);
  o.score=localScore(o);return o;
}
function qtyFor(k,g){const u=fdUnit(k);if(Array.isArray(u)){const n=Math.max(.5,Math.round(g/u[0]*2)/2);return `${n===.5?"½":ffmt(n)} ${n<=1?u[1]:u[2]}`}return `${Math.round(g)} ${u==="ml"?"ml":"g"}`}
function pickSuggestions(slot,target,remP,count){
  const {pool,idx}=orderFor(slot), n=idx.length;
  const eaten=new Set((days[today()]?.entries||[]).map(e=>String(e.name).replace(/\s*\([\d,]+×\)$/,"")));
  const main=slot.cat==="mittag"||slot.cat==="abend";
  const need=remP>30?(main?6:5):0;
  let p=(sugPtr[slot.k]||0)%n;const out=[];let tries=0;
  while(out.length<count&&tries<n){
    const r=pool[idx[p]];p=(p+1)%n;tries++;
    if(eaten.has(r.name))continue;
    if(need&&r.protein/Math.max(r.kcal,1)*100<need&&tries<n*.6)continue;
    let f=Math.round(target/r.kcal*2)/2;f=Math.max(.5,Math.min(f,2));
    out.push(scaleRecipe(r,f));
  }
  return {list:out,next:p,total:n};
}
let sugNext=0;
function recipeHTML(s,idx){
  let ingList=null,steps=s.steps,time=s.time||"";
  const f=s.factor||1;
  if(s.ings)ingList=s.ings.map(x=>x.k?ingText(x.k,x.g*f):x.t);
  else if(s.ingredients)ingList=String(s.ingredients).split(/,\s*/).filter(Boolean);
  else if(RECIPES[s.name]){const r=RECIPES[s.name];time=r[0];ingList=r[1].split(", ");steps=r[2]}
  if(!(steps&&steps.length)&&!ingList)return "";
  return `<details class="prep"><summary>Zubereitung${time?" · "+esc(time):""}</summary><div class="recipe">${ingList?`<p class="ing"><b>Zutaten${f!==1?` für ${fmt(f,1)}× Portion`:""}:</b> ${esc(ingList.join(", "))}</p>`:""}${steps&&steps.length?`<ol>${steps.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`:""}${idx!=null?`<button class="btn ghost shopbtn" data-shopsug="${idx}">Zutaten auf die Einkaufsliste</button>`:""}</div></details>`;
}
function renderSuggestions(){
  const T=targets(), t=dayTotals(days[today()]?.entries||[]);
  const [,label,left,slot,share]=slotNow();
  const rem=T.kcal-t.kcal, remP=T.protein-t.protein;
  $("#slotName").textContent=label+" · "+new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
  if(rem<=150){
    $("#sugIntro").textContent="Dein Kalorienziel für heute ist erreicht. Wenn du noch Hunger hast: ein Glas Vollmilch oder ein Stück Obst passt immer.";
    $("#sugs").innerHTML="";$("#sugMore").hidden=true;$("#sugAI").hidden=true;$("#sugCount").textContent="";return;
  }
  $("#sugMore").hidden=false;$("#sugAI").hidden=!sample;
  const target=Math.max(slot.w<1?200:350,rem*share);
  $("#sugIntro").innerHTML=`Noch <b class="num">${fmt(rem)} kcal</b> und <b class="num">${fmt(Math.max(remP,0))} g Protein</b> offen. Für diese Mahlzeit passen etwa <b class="num">${fmt(Math.round(target/10)*10)} kcal</b>${left>1?`, der Rest verteilt sich auf ${left-1} weitere ${left-1===1?"Mahlzeit":"Mahlzeiten"}`:""}.`;
  let list;
  if(aiSugs){list=aiSugs;$("#sugCount").textContent="Ideen der KI"}
  else{const r=pickSuggestions(slot,target,remP,3);list=r.list;sugNext=r.next;
    const pos=(sugPtr[slot.k]||0)%r.total;$("#sugCount").textContent=`${fmt(r.total)} Rezepte für ${label.replace("Vormittags-","").replace("Nachmittags-","")} · Vorschlag ${pos+1}–${Math.min(pos+3,r.total)}`}
  window.__sugs=list;
  $("#sugs").innerHTML=list.map((s,i)=>`<div class="sug"><span class="chip ${scls(s.score)}">${s.score}</span>
    <div style="min-width:0"><div class="nm">${esc(s.name)}${s.factor&&s.factor!==1?` <span class="muted" style="font-weight:500">(${fmt(s.factor,1)}× Portion)</span>`:""}</div>
    <div class="mm">${fmt(s.kcal)} kcal · P ${fmt(s.protein)} · K ${fmt(s.carbs)} · F ${fmt(s.fat)}</div>
    ${s.why?`<div class="why">${esc(s.why)}</div>`:""}
    ${recipeHTML(s,i)}</div>
    <button class="add" data-sug="${i}">Eintragen</button></div>`).join("");
}
async function saveKiRecipe(s,items){
  const name=s.baseName||s.name;
  let rec=recipes.find(r=>r.folder==="ki"&&r.name===name);
  if(!rec){
    rec={id:uid(),name,servings:1,folder:"ki",items:items.map(stripItem),steps:s.steps||[],time:s.time||"",why:s.why||"",
      extras:(s.ings||[]).filter(x=>!x.k).map(x=>({name:x.name,qty:x.qty||"",cat:x.cat})),
      ingredientsText:s.ingredients||"",uses:0,created:today()};
    recipes.unshift(rec);
  }
  rec.uses=(rec.uses||0)+1;rec.lastUsed=today();
  await saveRecipes();
}
function sugItems(s,f){
  if(s.ings)return s.ings.filter(x=>x.k).map(x=>ingItem(x.k,x.g*(f||1)));
  return [normItem({name:s.name,portion:"1 Portion",kcal:s.kcal,protein:s.protein,carbs:s.carbs,fat:s.fat,fiber:s.fiber,sugar:s.sugar,satFat:s.satFat,salt:s.salt,micros:s.micros,score:s.score})];
}
function sugShopItems(s){
  const f=s.factor||1;
  if(s.ings)return s.ings.map(x=>x.k?{name:FD[x.k][0],qty:qtyFor(x.k,x.g*f),cat:FD[x.k][1]}:{name:x.name,qty:x.qty||"",cat:x.cat});
  if(s.ingredients)return String(s.ingredients).split(/,\s*/).filter(Boolean).map(parseIngLine);
  if(RECIPES[s.name])return RECIPES[s.name][1].split(", ").map(parseIngLine);
  return [];
}
$("#sugs").addEventListener("click",async ev=>{
  const sh=ev.target.closest("[data-shopsug]");
  if(sh){const s=window.__sugs[+sh.dataset.shopsug];const n=addShop(sugShopItems(s),s.baseName||s.name);sh.textContent=`${n} Zutaten auf der Einkaufsliste`;sh.disabled=true;return}
  const b=ev.target.closest("[data-sug]");if(!b)return;const s=window.__sugs[+b.dataset.sug];
  const f=s.factor||1, items=sugItems(s,f);
  const e={name:(s.baseName||s.name)+(f!==1?` (${fmt(f,1)}×)`:""),portion:f!==1?`${fmt(f,1)} Portionen`:"1 Portion",kcal:s.kcal,protein:s.protein,carbs:s.carbs,fat:s.fat,fiber:s.fiber,sugar:s.sugar,satFat:s.satFat,salt:s.salt,micros:s.micros,score:s.score,nova:s.nova,pros:s.why?[s.why]:[],source:"vorschlag"};
  if(s.ings)e.items=items.map(stripItem);
  if(!aiSugs){const slot=slotNow()[3];sugPtr[slot.k]=sugNext;saveSugPtr()}
  aiSugs=null;
  await addEntry(e);
  await saveKiRecipe(s,s.ings?sugItems(s,1):items);
});
$("#sugMore").onclick=()=>{
  if(!aiSugs){const slot=slotNow()[3];sugPtr[slot.k]=sugNext;saveSugPtr()}
  aiSugs=null;renderSuggestions();
};
const CUISINES=["italienischen","türkischen","indischen","japanischen","mexikanischen","griechischen","süddeutschen","koreanischen","libanesischen","thailändischen","spanischen","vietnamesischen","marokkanischen","skandinavischen","persischen","peruanischen"];
let aiSeen=[];
try{aiSeen=JSON.parse(localStorage.getItem("zl-aiseen")||"[]")||[]}catch(e){}
$("#sugAI").onclick=async()=>{
  if(!sample)return;
  const T=targets(), t=dayTotals(days[today()]?.entries||[]), [,label,,slot,share]=slotNow();
  const eaten=(days[today()]?.entries||[]).map(e=>e.name).join(", ")||"noch nichts";
  const c1=CUISINES[Math.floor(Math.random()*CUISINES.length)];let c2=CUISINES[Math.floor(Math.random()*CUISINES.length)];if(c2===c1)c2=CUISINES[(CUISINES.indexOf(c1)+5)%CUISINES.length];
  const target=Math.round(Math.max(200,(T.kcal-t.kcal)*share)/10)*10;
  const b=$("#sugAI");b.disabled=true;$("#sugStatus").textContent="Claude sucht passende Gerichte …";$("#sugStatus").classList.remove("err");
  try{
    const r=await sample.json(`Ein ${profile.age}-jähriger Mann (${fmt(profile.weight,1)} kg, ${profile.height} cm) will gesund Muskeln und Gewicht aufbauen. Es ist ${new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})} Uhr (${label}). Heute gegessen: ${eaten}. Es fehlen noch ${Math.round(T.kcal-t.kcal)} kcal und ${Math.round(Math.max(T.protein-t.protein,0))} g Protein. Für diese Mahlzeit sind etwa ${target} kcal passend.
Schlage 3 verschiedene, gesunde, in deutschen Supermärkten erhältliche Gerichte oder Snacks vor, die zur Uhrzeit passen. Lass dich diesmal von der ${c1} und der ${c2} Küche inspirieren und sorge für echte Abwechslung.${aiSeen.length?` Schlage keines dieser schon gezeigten Gerichte vor: ${aiSeen.slice(-25).join("; ")}.`:""}
Bewerte jedes nach wissenschaftlichen Kriterien (Nährstoffdichte, Protein, Ballaststoffe, NOVA-Verarbeitungsgrad, Zucker, gesättigte Fette, Salz) mit einem Score 1–10; viele Kalorien aus guten Quellen sind kein Minuspunkt.
Antworte nur mit einem JSON-Array: [{"name":"Name des Gerichts","kcal":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0,"satFat":0,"salt":0,"score":8,"why":"ein kurzer Satz","time":"z. B. 20 Min.","ingredients":"Zutaten mit Mengen, kommagetrennt, z. B. 80 g Reis, 150 g Hähnchenbrust","steps":["3 bis 6 kurze Zubereitungsschritte"],"micros":${MICRO_JSON}}]
"micros" = geschätzte Mikronährstoffe der Portion: ${MICRO_UNITS}.`,{cache:false});
    if(!Array.isArray(r)||!r.length)throw{code:"invalid_json"};
    aiSugs=r.slice(0,3).map(x=>({name:String(x.name||"Vorschlag"),kcal:+x.kcal||0,protein:+x.protein||0,carbs:+x.carbs||0,fat:+x.fat||0,fiber:+x.fiber||0,sugar:+x.sugar||0,satFat:+x.satFat||0,salt:+x.salt||0,micros:x.micros&&typeof x.micros==="object"?x.micros:undefined,score:Math.max(1,Math.min(10,Math.round(+x.score||6))),why:String(x.why||""),time:String(x.time||""),ingredients:String(x.ingredients||""),steps:Array.isArray(x.steps)?x.steps.slice(0,8).map(String):[]}));
    aiSeen=[...aiSeen,...aiSugs.map(x=>x.name)].slice(-40);try{localStorage.setItem("zl-aiseen",JSON.stringify(aiSeen))}catch(e){}
    $("#sugStatus").textContent="";renderSuggestions();
  }catch(e){
    $("#sugStatus").textContent={not_granted:"Ohne Erlaubnis für Claude gibt es nur die eingebauten Vorschläge.",rate_limited:"Gerade zu viele Anfragen. Versuch es später noch einmal."}[e?.code]||"Das hat nicht geklappt. Tippe noch einmal auf „Ideen von Claude“.";
    $("#sugStatus").classList.add("err");
  }finally{b.disabled=false}
};

/* ---------- meal settings ---------- */
function renderMealSettings(){
  const M=mealCfg();
  $("#mlFruh").checked=M.fruh;$("#mlSnacks").checked=M.snacks;$("#mlSpaet").checked=M.spaet;$("#mlMid").checked=M.midnight;
  $("#mlInfo").textContent="Verteilung deines Tagesziels: "+mealShares().map(([l,k])=>`${l} ${fmt(k)} kcal`).join(" · ");
}
["mlFruh","mlSnacks","mlSpaet","mlMid"].forEach(id=>$("#"+id).addEventListener("change",async()=>{
  profile.meals={fruh:$("#mlFruh").checked,snacks:$("#mlSnacks").checked,spaet:$("#mlSpaet").checked,midnight:$("#mlMid").checked};
  aiSugs=null;renderMealSettings();render();await saveProfile();
}));
