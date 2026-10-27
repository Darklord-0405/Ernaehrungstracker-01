/* ---------- recipes ---------- */
let recipeImgs={};
try{recipeImgs=JSON.parse(localStorage.getItem("zl-rimg")||"{}")||{}}catch(e){}
function saveRecipeImgLocal(){try{localStorage.setItem("zl-rimg",JSON.stringify(recipeImgs))}catch(e){status("Das Foto passt nicht mehr in den Speicher. Lösch ein paar alte Rezeptfotos.",true)}}
async function setRecipeImg(id,img){
  if(img)recipeImgs[id]=img;else delete recipeImgs[id];
  saveRecipeImgLocal();
  if(mode==="db"){try{const ref=db.collection("data/users/"+userId).doc("rimg_"+id);if(img)await ref.set({img});else await ref.delete()}catch(e){}}
}
let recFolder="eigen";
function recipePortion(r,eaten){
  const f=eaten/(r.servings||1);
  const items=(r.items||[]).map(i=>{const c=normItem(i);scaleItem(c,f);return c});
  const e=combine(items,r.name+(eaten!==1?` (${fmt(eaten,1)} Portionen)`:""));
  e.portion=`${fmt(eaten,1)} ${eaten===1?"Portion":"Portionen"}`;e.source="rezept";
  if(recipeImgs[r.id])e.photo=recipeImgs[r.id];
  if(r.why)e.pros=[r.why];
  return e;
}
function recipeShopItems(r,eaten){
  const f=eaten/(r.servings||1);
  const whole=(r.items||[]).length===1&&/^1 Portion$/.test(r.items[0].portion||"")&&r.ingredientsText;
  const list=whole?String(r.ingredientsText).split(/,\s*/).filter(Boolean).map(parseIngLine)
    :(r.items||[]).map(i=>({name:String(i.name).replace(/\s*\(.*\)$/,""),qty:i.portion?scalePortion(i.portion,f):"",cat:""}));
  (r.extras||[]).forEach(x=>list.push({name:x.name,qty:x.qty||"",cat:x.cat}));
  return list;
}
function renderRecipes(){
  const own=recipes.filter(r=>(r.folder||"eigen")!=="ki"), ki=recipes.filter(r=>r.folder==="ki").sort((a,b)=>String(b.lastUsed||"").localeCompare(String(a.lastUsed||"")));
  $("#rfOwnN").textContent=own.length;$("#rfKiN").textContent=ki.length;
  $$(".recfold button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.fold===recFolder)));
  $("#recIntro").textContent=recFolder==="ki"
    ?"Hier landen automatisch alle vorgeschlagenen Rezepte, die du eingetragen hast, mit Zutaten und Zubereitung."
    :(tray.collect?"Im Sammelmodus kommt das Rezept als eine Zutat in deine Mahlzeit. Die Werte gelten pro Portion.":"Deine selbst gespeicherten Rezepte. Die Werte gelten pro Portion.");
  const list=recFolder==="ki"?ki:own;
  if(!list.length){$("#recList").innerHTML=recFolder==="ki"
    ?`<div class="empty">Noch keine KI-Rezepte. Trag auf der Startseite einen Vorschlag unter „Was du jetzt essen kannst“ ein, dann erscheint er hier.</div>`
    :`<div class="empty">Noch keine eigenen Rezepte. Stell unter „Mahlzeit“ Zutaten zusammen und tippe auf „Als Rezept speichern“. Oder öffne bei einer eingetragenen Mahlzeit die Details und tippe dort auf „Als Rezept speichern“.</div>`;return}
  $("#recList").innerHTML=list.map(r=>{const p=recipePortion(r,1),img=recipeImgs[r.id];return `<div class="rcard">
    ${img?`<img class="rimg" src="${img}" alt="Foto: ${esc(r.name)}">`:""}
    <div class="rhead"><span class="chip ${scls(p.score)}" title="Score">${p.score}</span><div style="min-width:0"><div class="nm">${esc(r.name)}</div>
      <div class="mm">pro Portion: ${fmt(p.kcal)} kcal · P ${fmt(p.protein)} · K ${fmt(p.carbs)} · F ${fmt(p.fat)}</div>
      <div class="legend">${r.folder==="ki"?`Aus den Vorschlägen · ${r.uses||1}× gegessen${r.lastUsed?`, zuletzt ${r.lastUsed.slice(8)}.${r.lastUsed.slice(5,7)}.`:""}`:`${r.items.length} ${r.items.length===1?"Zutat":"Zutaten"} · ergibt ${fmt(r.servings||1,1)} ${(r.servings||1)===1?"Portion":"Portionen"}`}${r.time?` · ${esc(r.time)}`:""}</div></div></div>
    <details class="prep"><summary>Zutaten${r.steps&&r.steps.length?" und Zubereitung":""}</summary><div class="recipe">
      <ul>${(r.ingredientsText&&r.items.length===1?String(r.ingredientsText).split(/,\s*/).map(x=>`<li>${esc(x)}</li>`):r.items.map(i=>`<li>${esc(i.name)}${i.portion?` – ${esc(i.portion)}`:""} · ${fmt(i.kcal)} kcal</li>`)).join("")}${(r.extras||[]).map(x=>`<li>${esc(x.qty?x.qty+" "+x.name:x.name)}</li>`).join("")}</ul>
      ${r.steps&&r.steps.length?`<ol style="margin-top:8px">${r.steps.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`:""}
      <p class="legend" style="margin:6px 0 0">Mengen für das ganze Rezept.</p></div></details>
    <div class="ractions">
      <div class="field"><label for="rp-${r.id}">Portionen</label><select id="rp-${r.id}"><option value="0.5">½</option><option value="1" selected>1</option><option value="1.5">1½</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></div>
      <button class="btn" data-radd="${r.id}">${tray.collect?"Zur Mahlzeit":"Eintragen"}</button>
      <button class="btn ghost" data-rshop="${r.id}">Einkaufsliste</button>
      <button class="btn ghost" data-rphoto="${r.id}">${img?"Foto ändern":"Foto"}</button>
      <button class="btn ghost" data-redit="${r.id}">Bearbeiten</button>
      <button class="btn ghost" data-rdel="${r.id}">Löschen</button>
    </div></div>`}).join("");
}
$$(".recfold button").forEach(b=>b.onclick=()=>{recFolder=b.dataset.fold;renderRecipes()});
let photoFor=null;
$("#recPhotoIn").addEventListener("change",async ev=>{
  const f=ev.target.files[0];ev.target.value="";if(!f||!photoFor)return;
  const img=await thumb(f,360);if(!img){status("Das Bild konnte nicht gelesen werden.",true);return}
  await setRecipeImg(photoFor,img);photoFor=null;renderRecipes();status("Foto gespeichert.");
});
$("#recList").addEventListener("click",async ev=>{
  const a=ev.target.closest("[data-radd]"), ed=ev.target.closest("[data-redit]"), del=ev.target.closest("[data-rdel]"), sh=ev.target.closest("[data-rshop]"), ph=ev.target.closest("[data-rphoto]");
  if(a){const r=recipes.find(x=>x.id===a.dataset.radd);if(!r)return;const eaten=parseFloat($("#rp-"+r.id).value)||1;const e=recipePortion(r,eaten);
    if(r.folder==="ki"){r.uses=(r.uses||0)+1;r.lastUsed=today();saveRecipes()}
    if(tray.collect){const one={...e};delete one.items;addToTray([one])}else{await addEntry(e);show("heute")}return}
  if(sh){const r=recipes.find(x=>x.id===sh.dataset.rshop);if(!r)return;const eaten=parseFloat($("#rp-"+r.id).value)||1;
    const n=addShop(recipeShopItems(r,eaten),r.name);status(`${n} Zutaten von „${r.name}“ auf der Einkaufsliste.`);sh.textContent="Auf der Liste";return}
  if(ph){photoFor=ph.dataset.rphoto;$("#recPhotoIn").click();return}
  if(ed){const r=recipes.find(x=>x.id===ed.dataset.redit);if(!r)return;
    const load=()=>{tray={items:r.items.map(i=>normItem(i)),name:r.name,collect:true,editId:r.id};saveTray();setTarget(true);setMode("mahlzeit");status(`Rezept „${r.name}“ geladen. Ändere Zutaten und speichere mit „Als Rezept speichern“.`)};
    if(tray.items.length&&tray.editId!==r.id)arm(ed,"Mahlzeit ersetzen?",load);else load();return}
  if(del){const r=recipes.find(x=>x.id===del.dataset.rdel);if(!r)return;
    arm(del,"Wirklich löschen?",async()=>{recipes=recipes.filter(x=>x.id!==r.id);if(tray.editId===r.id){tray.editId=null;saveTray()}if(recipeImgs[r.id])setRecipeImg(r.id,null);renderRecipes();await saveRecipes();status(`Rezept „${r.name}“ gelöscht.`)})}
});
// Foto im Formular „Als Rezept speichern“
let rfPhoto;
function showRfPhoto(img){$("#rfImg").hidden=!img;if(img)$("#rfImg").src=img;$("#rfPhotoDel").hidden=!img;$("#rfPhotoLbl").textContent=img?"Anderes Foto":"Foto der fertigen Mahlzeit"}
$("#trSaveRec").addEventListener("click",()=>{rfPhoto=undefined;showRfPhoto(tray.editId?recipeImgs[tray.editId]:null)});
$("#rfPhotoIn").addEventListener("change",async ev=>{const f=ev.target.files[0];ev.target.value="";if(!f)return;const img=await thumb(f,360);if(img){rfPhoto=img;showRfPhoto(img)}});
$("#rfPhotoDel").onclick=()=>{rfPhoto=null;showRfPhoto(null)};
document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-tor]");if(!b)return;
  let e=null;Object.values(days).some(d=>(e=(d.entries||[]).find(x=>x.id===b.dataset.tor)));
  if(!e)return;
  const base=e.name.replace(/\s*\([\d,]+×\)$/,"").replace(/\s*\([\d,]+ Portionen\)$/,"");
  const items=e.items?.length?e.items:[{name:base,portion:e.portion,kcal:e.kcal,protein:e.protein,carbs:e.carbs,fat:e.fat,fiber:e.fiber,sugar:e.sugar,satFat:e.satFat,salt:e.salt,score:e.score,nova:e.nova,micros:e.micros}];
  const id=uid();
  recipes.unshift({id,name:base,servings:1,folder:"eigen",items:items.map(i=>stripItem(normItem(i))),updated:today()});
  if(e.photo)setRecipeImg(id,e.photo);
  b.textContent="Als Rezept gespeichert";b.disabled=true;
  await saveRecipes();
});
