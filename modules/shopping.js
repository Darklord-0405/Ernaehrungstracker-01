/* ---------- amounts ---------- */
const UNITMUL={kg:[1000,"g"],g:[1,"g"],gramm:[1,"g"],l:[1000,"ml"],liter:[1000,"ml"],ml:[1,"ml"]};
function parseAmt(s){
  const m=String(s||"").trim().match(/^(\d+(?:[.,]\d+)?|½|¼|¾)\s*([A-Za-zÄÖÜäöüß]+)?/);if(!m)return null;
  let n=m[1]==="½"?.5:m[1]==="¼"?.25:m[1]==="¾"?.75:parseFloat(m[1].replace(",","."));if(!(n>0))return null;
  const raw=m[2]||"";let u=raw.toLowerCase();
  if(UNITMUL[u]){n*=UNITMUL[u][0];u=UNITMUL[u][1]}
  return {n,u,raw};
}
const ustem=u=>String(u||"").replace(/(en|n|e|s)$/,"");
function amtFactor(oldS,newS){
  const a=parseAmt(oldS),b=parseAmt(newS);if(!a||!b)return null;
  if(a.u&&b.u&&a.u!==b.u&&ustem(a.u)!==ustem(b.u))return null;
  const f=b.n/a.n;return f>0&&f<100?f:null;
}
function scaleNutrients(o,f){
  NUMF.forEach(k=>o[k]=Math.round((+o[k]||0)*f*10)/10);
  if(o.micros){const m={};NK.forEach(k=>m[k]=Math.round((+o.micros[k]||0)*f*100)/100);o.micros=m}
  if(Array.isArray(o.items))o.items=o.items.map(i=>{const c={...i};scaleItem(c,f);return c});
}
function findEntry(id){for(const k in days){const e=(days[k].entries||[]).find(x=>x.id===id);if(e)return [k,e]}return [null,null]}
async function rescaleEntry(id,f,newPortion){
  const [k,e]=findEntry(id);if(!e||!f||Math.abs(f-1)<.001)return;
  scaleNutrients(e,f);e.portion=newPortion!=null?newPortion:scalePortion(e.portion,f);
  render();if(!$("#v-verlauf").hidden)renderDayDetail();await saveDay(k);
}
document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-amt]"), c=ev.target.closest("[data-ef]");
  if(b){const id=b.dataset.amt,inp=$("#am-"+id),msg=$("#amh-"+id),[,e]=findEntry(id);if(!e||!inp)return;
    const f=amtFactor(e.portion,inp.value);
    if(!f){msg.textContent=parseAmt(e.portion)?"Bitte die gleiche Einheit verwenden, z. B. 200 g statt 150 g.":"Die bisherige Menge hat keine Zahl. Nutze die Knöpfe ½× bis 2×.";return}
    await rescaleEntry(id,f,inp.value.trim());return}
  if(c){await rescaleEntry(c.dataset.eid,+c.dataset.ef);return}
});

/* ---------- shopping list ---------- */
const SHOPCATS=["Obst & Gemüse","Brot & Backwaren","Kühlregal","Fleisch & Fisch","Tiefkühl","Konserven","Vorrat","Nüsse & Samen","Süßes","Getränke","Gewürze & Sonstiges","Sonstiges"];
const SHOPKW=[
 ["Fleisch & Fisch",/hähnchen|huhn|pute|rind|hack|schwein|lachs|fisch|thunfisch|garnele|seelachs|steak|fleisch|forelle|kabeljau/],
 ["Tiefkühl",/\btk\b|tiefkühl|erbsen/],
 ["Konserven",/dose|passiert|kichererbsen|kidney|mais|kokosmilch|bohnen \(/],
 ["Kühlregal",/milch|joghurt|quark|skyr|käse|feta|mozzarella|butter|sahne|\beier?\b|tofu|hummus|drink/],
 ["Brot & Backwaren",/brot|toast|brötchen|wrap|tortilla|pita|knäcke|waffel/],
 ["Nüsse & Samen",/nuss|nüsse|mandel|cashew|erdnüsse|kerne|samen|chia|leinsamen/],
 ["Vorrat",/hafer|reis|nudel|pasta|spaghetti|quinoa|couscous|bulgur|linsen|mehl|öl|honig|kakao|müsli|granola|erdnussbutter|mus\b|tahin|sojasauce|essig|zucker|brühe/],
 ["Obst & Gemüse",/apfel|äpfel|banane|beere|birne|kiwi|mango|orange|zitrone|limette|tomate|gurke|paprika|zucchini|spinat|salat|rucola|möhre|karotte|brokkoli|blumenkohl|kartoffel|zwiebel|knoblauch|ingwer|pilz|champignon|avocado|kräuter|petersilie|basilikum|bohnen|lauch|kohl|obst|gemüse|dattel|traube/],
 ["Süßes",/schoko|keks|riegel|gummi/],
 ["Getränke",/wasser|saft|tee\b|kaffee|limo/],
 ["Gewürze & Sonstiges",/salz|pfeffer|gewürz|curry|kreuzkümmel|paprikapulver|chili|zimt|oregano|vanille|senf|kurkuma/]
];
function shopCat(name,hint){
  if(hint&&SHOPCATS.includes(hint))return hint;
  const n=String(name).toLowerCase();
  for(const k in FD)if(FD[k][0].toLowerCase()===n)return FD[k][1];
  for(const [c,re] of SHOPKW)if(re.test(n))return c;
  return "Sonstiges";
}
const normName=n=>String(n).toLowerCase().replace(/\(.*?\)/g,"").replace(/[^a-zäöüß0-9 ]/g," ").replace(/\s+/g," ").trim();
function parseIngLine(s){
  s=String(s).trim().replace(/^[-•*]\s*/,"");
  const m=s.match(/^((?:\d+(?:[.,]\d+)?|½|¼|¾)(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?\s*(?:kg|g|ml|l|EL|TL|Stück|Scheiben?|Dosen?|Bund|Zehen?|Prisen?|Packungen?|Becher|Gläser|Glas|Handvoll|Liter|Gramm)?\.?)\s+(.+)$/i);
  return m?{name:m[2].trim(),qty:m[1].trim(),cat:""}:{name:s,qty:"",cat:""};
}
function mergeQty(a,b){
  if(!a)return b||"";if(!b)return a;
  const x=parseAmt(a),y=parseAmt(b);
  if(x&&y&&(x.u===y.u||ustem(x.u)===ustem(y.u))){
    const s=Math.round((x.n+y.n)*100)/100;
    if(x.u==="g"&&s>=1000)return `${fmt(s/1000,2).replace(/,?0+$/,"")} kg`;
    if(x.u==="ml"&&s>=1000)return `${fmt(s/1000,2).replace(/,?0+$/,"")} l`;
    const unit=x.u==="g"||x.u==="ml"?x.u:(s>1?(x.n>1?x.raw:y.raw):x.raw);
    return `${fmt(s,s%1?1:0)}${unit?" "+unit:""}`;
  }
  return `${a} + ${b}`;
}
function addShop(list,src){
  let n=0;
  list.forEach(it=>{
    const name=String(it.name||"").trim();if(!name)return;
    const key=normName(name), ex=shopping.find(s=>!s.done&&normName(s.name)===key);
    if(ex){ex.qty=mergeQty(ex.qty,it.qty||"");if(src&&!String(ex.src||"").includes(src))ex.src=ex.src?ex.src+", "+src:src}
    else shopping.push({id:uid(),name,qty:String(it.qty||""),cat:shopCat(name,it.cat),done:false,src:src||""});
    n++;
  });
  saveShopping();if(!$("#v-einkauf").hidden)renderShop();updateShopBadge();
  return n;
}
async function saveShopping(){
  cache();
  if(mode==="db"){try{await db.collection("data/users/"+userId).doc("shopping").set({list:shopping})}catch(e){}}
}
function updateShopBadge(){const n=shopping.filter(s=>!s.done).length;$("#t-einkauf").textContent=n?`Einkauf (${n})`:"Einkauf"}
function shStatus(t,err){const s=$("#shStatus");s.textContent=t||"";s.classList.toggle("err",!!err)}
function renderShop(){
  const open=shopping.filter(s=>!s.done), done=shopping.filter(s=>s.done);
  $("#shSub").textContent=shopping.length?`${open.length} offen${done.length?`, ${done.length} erledigt`:""}`:"";
  const own=recipes.filter(r=>(r.folder||"eigen")!=="ki"), ki=recipes.filter(r=>r.folder==="ki");
  const cur=$("#shRec").value;
  $("#shRec").innerHTML=recipes.length?`<option value="">Rezept wählen …</option>${own.length?`<optgroup label="Meine Rezepte">${own.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join("")}</optgroup>`:""}${ki.length?`<optgroup label="KI-Rezepte">${ki.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join("")}</optgroup>`:""}`:`<option value="">Noch keine Rezepte gespeichert</option>`;
  if(cur&&recipes.some(r=>r.id===cur))$("#shRec").value=cur;
  $("#shRec").disabled=!recipes.length;
  if(!shopping.length){$("#shList").innerHTML=`<div class="empty">Deine Einkaufsliste ist leer. Trag oben Artikel ein, übernimm die Zutaten eines Rezepts oder tippe bei einem Vorschlag auf „Zutaten auf die Einkaufsliste“.</div>`;return}
  const row=s=>`<div class="shrow${s.done?" done":""}"><label class="shi" for="sh-${s.id}"><input type="checkbox" id="sh-${s.id}" data-shchk="${s.id}"${s.done?" checked":""}><span class="shn"><b>${esc(s.name)}</b>${s.src?`<small>für ${esc(s.src)}</small>`:""}</span><span class="shq num">${esc(s.qty||"")}</span></label><button class="x del" data-shdel="${s.id}" aria-label="${esc(s.name)} entfernen">entfernen</button></div>`;
  let html="";
  SHOPCATS.forEach(c=>{const g=open.filter(s=>s.cat===c);if(g.length)html+=`<div class="shgrp"><div class="eyebrow">${c}</div>${g.map(row).join("")}</div>`});
  if(done.length)html+=`<div class="shgrp"><div class="eyebrow">Erledigt</div>${done.map(row).join("")}</div>`;
  $("#shList").innerHTML=html;
}
$("#shForm").addEventListener("submit",ev=>{
  ev.preventDefault();const name=$("#shName").value.trim();if(!name){shStatus("Bitte einen Artikel eintragen.",true);return}
  const p=$("#shQty").value.trim()?{name,qty:$("#shQty").value.trim()}:parseIngLine(name);
  addShop([p],"");$("#shName").value="";$("#shQty").value="";$("#shName").focus();shStatus(`„${p.name}“ hinzugefügt.`);
});
$("#shRecAdd").onclick=()=>{
  const r=recipes.find(x=>x.id===$("#shRec").value);if(!r){shStatus("Wähle zuerst ein Rezept.",true);return}
  const n=addShop(recipeShopItems(r,parseFloat($("#shRecPort").value)||1),r.name);shStatus(`${n} Zutaten von „${r.name}“ hinzugefügt.`);
};
$("#shList").addEventListener("change",ev=>{const c=ev.target.closest("[data-shchk]");if(!c)return;const s=shopping.find(x=>x.id===c.dataset.shchk);if(s){s.done=c.checked;saveShopping();renderShop();updateShopBadge()}});
$("#shList").addEventListener("click",ev=>{const d=ev.target.closest("[data-shdel]");if(!d)return;shopping=shopping.filter(x=>x.id!==d.dataset.shdel);saveShopping();renderShop();updateShopBadge()});
$("#shClearDone").onclick=()=>{const n=shopping.filter(s=>s.done).length;if(!n){shStatus("Es ist noch nichts abgehakt.");return}shopping=shopping.filter(s=>!s.done);saveShopping();renderShop();shStatus(`${n} erledigte Artikel entfernt.`)};
$("#shClearAll").onclick=ev=>{if(!shopping.length)return;arm(ev.currentTarget,"Wirklich alles löschen?",()=>{shopping=[];saveShopping();renderShop();updateShopBadge();shStatus("Einkaufsliste geleert.")})};
function shopText(){
  const open=shopping.filter(s=>!s.done);
  return "Einkaufsliste\n"+SHOPCATS.map(c=>{const g=open.filter(s=>s.cat===c);return g.length?`\n${c}:\n`+g.map(s=>`- ${s.name}${s.qty?` (${s.qty})`:""}`).join("\n"):""}).join("");
}
$("#shCopy").onclick=async()=>{
  const t=shopText();
  try{await navigator.clipboard.writeText(t);shStatus("Liste kopiert. Du kannst sie jetzt z. B. in WhatsApp einfügen.")}
  catch(e){const ta=$("#shCopyBox");ta.hidden=false;ta.value=t;ta.focus();ta.select();let ok=false;try{ok=document.execCommand("copy")}catch(e2){}shStatus(ok?"Liste kopiert.":"Markiere den Text unten und kopiere ihn.")}
};
$("#shAsk").onclick=()=>openChat("Was sollte ich diese Woche einkaufen, um mein Kalorien- und Proteinziel gesund zu erreichen? Bitte als Liste mit Mengen.");
