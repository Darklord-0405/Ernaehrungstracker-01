/* ---------- chat ---------- */
let chat=[];
try{chat=JSON.parse(localStorage.getItem("zl-chat")||"[]")||[]}catch(e){}
function saveChat(){try{localStorage.setItem("zl-chat",JSON.stringify(chat.slice(-40)))}catch(e){}}
function md(t){
  const lines=esc(t).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").split(/\n/);
  let html="",list=null;
  const close=()=>{if(list){html+=`</${list}>`;list=null}};
  lines.forEach(l=>{
    const ul=l.match(/^\s*[-*•]\s+(.*)/), ol=l.match(/^\s*\d+[.)]\s+(.*)/);
    if(ul){if(list!=="ul"){close();html+="<ul>";list="ul"}html+=`<li>${ul[1]}</li>`}
    else if(ol){if(list!=="ol"){close();html+="<ol>";list="ol"}html+=`<li>${ol[1]}</li>`}
    else if(!l.trim())close();
    else{close();html+=`<p>${l.replace(/^#+\s*/,"")}</p>`}
  });
  close();return html;
}
const CHIPS=["Was soll ich diese Woche einkaufen?","Welche Lebensmittel liefern viele gesunde Kalorien?","Was esse ich vor und nach dem Krafttraining?","Wie schaffe ich heute noch mein Proteinziel?","Was ist ein guter Midnight Snack?"];
function renderChat(){
  const box=$("#chatMsgs");
  if(!chat.length)box.innerHTML=`<div class="msg a"><p>Hallo! Ich kenne dein Tagesziel und was du heute gegessen hast. Frag mich zum Beispiel, was du einkaufen sollst, welche Lebensmittel viele gesunde Kalorien haben oder was vor dem Training passt.</p></div>`;
  else box.innerHTML=chat.map((m,i)=>m.role==="user"?`<div class="msg u">${esc(m.content)}</div>`
    :`<div class="msg a">${md(m.content)}${m.content&&!m.pending?`<div class="msg-act"><button data-chshop="${i}">Auf die Einkaufsliste</button></div>`:""}</div>`).join("");
  $("#chatChips").hidden=chat.length>0;
  $("#chatChips").innerHTML=CHIPS.map(c=>`<button data-chip="${esc(c)}">${esc(c)}</button>`).join("");
  const ok=!!sample;$("#chatIn").disabled=!ok;$("#chatSend").disabled=!ok||chatBusy;
  if(!ok)chStatus(window.__isApp?"Der Chat braucht die KI. Richte sie unter Profil → KI-Analyse mit Ollama ein.":"Der Chat ist in dieser Ansicht nicht verfügbar.",true);
  box.scrollTop=box.scrollHeight;
}
function chStatus(t,err){const s=$("#chatStatus");s.textContent=t||"";s.classList.toggle("err",!!err)}
function chatContext(){
  const T=targets(),t=dayTotals(days[today()]?.entries||[]);
  const eaten=(days[today()]?.entries||[]).map(e=>e.name).slice(-12).join(", ")||"noch nichts";
  const shop=shopping.filter(s=>!s.done).map(s=>s.name).slice(0,30).join(", ")||"leer";
  const recs=recipes.slice(0,12).map(r=>r.name).join(", ")||"keine";
  const M=mealCfg();
  return `Du bist ein freundlicher, sachlicher Ernährungscoach in der App „Ernährungstracker“. Antworte immer auf Deutsch, konkret und knapp (höchstens etwa 180 Wörter), nutze kurze Listen mit Mengen, wenn es um Lebensmittel oder Einkäufe geht. Empfiehl gesunde, in deutschen Supermärkten erhältliche Lebensmittel und stütze dich auf anerkannte Empfehlungen (DGE, WHO, ISSN). Stelle keine Diagnosen; bei Beschwerden oder Essstörungs-Anzeichen rate zu ärztlicher Hilfe.
Nutzer: männlich, ${profile.age} Jahre, ${fmt(profile.weight,1)} kg, ${profile.height} cm, Ziel: gesund zunehmen auf ${fmt(+profile.goalWeight||66,1)} kg. Training: ${profile.gym}× Kraft, ${profile.runs}× Joggen und ${profile.walks}× Spazieren pro Woche.
Tagesziel: ${fmt(T.kcal)} kcal, ${T.protein} g Protein, ${T.carbs} g Kohlenhydrate, ${T.fat} g Fett, ${(+profile.waterGoal||2000)/1000} l Wasser. Mahlzeiten: ${activeSlots().map(s=>s.label).join(", ")}${M.midnight?"":" (kein Midnight Snack)"}.
Heute bisher (${new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})} Uhr): ${fmt(t.kcal)} kcal, ${fmt(t.protein)} g Protein, ${fmt(t.carbs)} g Kohlenhydrate. Gegessen: ${eaten}.
Einkaufsliste: ${shop}. Gespeicherte Rezepte: ${recs}.`;
}
let chatBusy=false,chatCtl=null;
async function sendChat(text){
  text=String(text||"").trim();if(!text||!sample||chatBusy)return;
  chat.push({role:"user",content:text});const a={role:"assistant",content:"",pending:true};chat.push(a);
  chatBusy=true;$("#chatIn").value="";renderChat();chStatus("Denkt nach …");
  const turns=chat.filter(m=>!m.pending).slice(-12);
  while(turns.length&&turns[0].role!=="user")turns.shift();
  chatCtl=new AbortController();
  try{
    const r=await sample([{role:"user",content:chatContext()},...turns.map(m=>({role:m.role,content:m.content}))],{cache:false,signal:chatCtl.signal,onText:({text})=>{a.content=text;const last=$("#chatMsgs").lastElementChild;if(last){last.innerHTML=md(text);$("#chatMsgs").scrollTop=$("#chatMsgs").scrollHeight}}});
    a.content=r.text;chStatus(r.truncated?"Die Antwort wurde gekürzt. Frag nach, wenn du mehr wissen willst.":"");
  }catch(e){
    if(e?.text)a.content=e.text;
    if(!a.content){chat.pop();chat.pop();$("#chatIn").value=text}
    chStatus(e?.code==="cancelled"?"":(window.__appErr&&window.__appErr(e))||({rate_limited:"Gerade zu viele Anfragen. Versuch es gleich noch einmal.",not_granted:"Ohne Erlaubnis für die KI kann der Chat nicht antworten."}[e?.code])||"Die Antwort hat nicht geklappt. Versuch es noch einmal.",e?.code!=="cancelled");
  }finally{delete a.pending;chatBusy=false;chatCtl=null;saveChat();renderChat()}
}
function openChat(prefill){
  $("#chatSheet").hidden=false;document.body.style.overflow="hidden";chStatus("");renderChat();
  if(prefill){$("#chatIn").value=prefill}
  setTimeout(()=>{if(!$("#chatIn").disabled)$("#chatIn").focus()},60);
}
function closeChat(){if(chatCtl)chatCtl.abort();$("#chatSheet").hidden=true;document.body.style.overflow=""}
$("#chatFab").onclick=()=>openChat();
$("#chatClose").onclick=closeChat;
$("#chatNew").onclick=()=>{if(chatCtl)chatCtl.abort();chat=[];saveChat();chStatus("");renderChat()};
$("#chatForm").addEventListener("submit",ev=>{ev.preventDefault();sendChat($("#chatIn").value)});
$("#chatIn").addEventListener("keydown",ev=>{if(ev.key==="Enter"&&!ev.shiftKey){ev.preventDefault();sendChat($("#chatIn").value)}});
$("#chatIn").addEventListener("input",ev=>{ev.target.style.height="auto";ev.target.style.height=Math.min(ev.target.scrollHeight,140)+"px"});
$("#chatChips").addEventListener("click",ev=>{const c=ev.target.closest("[data-chip]");if(c)sendChat(c.dataset.chip)});
$("#chatMsgs").addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-chshop]");if(!b)return;const m=chat[+b.dataset.chshop];if(!m)return;
  b.disabled=true;b.textContent="Lese Zutaten …";
  let items=null;
  if(sample){try{const r=await sample.json(`Extrahiere aus dem folgenden Text alle Lebensmittel, die man einkaufen kann, mit Menge, falls genannt. Keine Gerichte, nur einzelne Zutaten.
Antworte nur mit einem JSON-Array: [{"name":"Haferflocken","qty":"500 g"}]
Text:
${m.content.slice(0,4000)}`,{modelTier:"quick"});if(Array.isArray(r))items=r.filter(x=>x&&x.name).map(x=>({name:String(x.name),qty:String(x.qty||""),cat:""}))}catch(e){}}
  if(!items)items=m.content.split("\n").filter(l=>/^\s*([-*•]|\d+[.)])\s+/.test(l)).map(l=>parseIngLine(l.replace(/^\s*\d+[.)]\s+/,"").replace(/\*\*/g,"").replace(/:.*$/,"")));
  if(!items.length){b.textContent="Keine Zutaten gefunden";return}
  const n=addShop(items,"Chat");b.textContent=`${n} Artikel auf der Einkaufsliste`;
});
const prevClose=window.__closeOverlay;
window.__closeOverlay=()=>{if(!$("#chatSheet").hidden){closeChat();return true}return prevClose?prevClose():false};
