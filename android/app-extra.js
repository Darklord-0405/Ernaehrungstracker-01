/* App-Modus: Einstellungen für die KI, Datensicherung und Zurück-Taste. */
(function(){
  if (!window.__isApp) return;
  var $ = function(s){ return document.querySelector(s); };
  function lsGet(k){ try { return localStorage.getItem(k) || ""; } catch(e){ return ""; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
  function st(el, t, err){ var s = $(el); s.textContent = t; s.classList.toggle("err", !!err); }

  $("#olUrl").value = lsGet("zl-ollama-url");
  $("#olModel").value = lsGet("zl-ollama-model");
  $("#olKey").value = lsGet("zl-ollama-key");
  function saveOl(){
    lsSet("zl-ollama-url", $("#olUrl").value.trim());
    lsSet("zl-ollama-model", $("#olModel").value.trim());
    lsSet("zl-ollama-key", $("#olKey").value.trim());
  }
  $("#olSave").onclick = function(){
    saveOl();
    st("#olStatus", $("#olUrl").value.trim() ? "Gespeichert." : "Gespeichert. Ohne Server funktionieren Schnell-Liste und manuelle Eingabe.");
  };
  $("#olTest").onclick = async function(){
    saveOl();
    var b = window.__ollamaBase();
    if (!b) { st("#olStatus", "Bitte zuerst die Server-Adresse eintragen.", true); return; }
    st("#olStatus", "Verbinde mit " + b + " …");
    var r = await window.__ollamaHttp("GET", b + "/api/tags", "");
    if (r.status === 0) { st("#olStatus", "Keine Verbindung zu " + b + ". Prüfe Adresse, WLAN, OLLAMA_HOST=0.0.0.0 und die Firewall am PC.", true); return; }
    if (r.status === 401 || r.status === 403) {
      var why = ""; try { why = JSON.parse(r.body).error || ""; } catch(e){ why = String(r.body || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 140); }
      var k = $("#olKey").value.trim();
      var hint = !k ? "Es ist kein API-Schlüssel eingetragen." : /^ssh-|^ollama:|ed25519/i.test(k) ? "Das sieht nach einem Geräte-Schlüssel (ssh-ed25519) aus, nicht nach einem API-Schlüssel." : "Erstelle auf ollama.com unter Settings → Keys einen neuen API-Schlüssel und kopiere ihn vollständig.";
      st("#olStatus", "Zugriff abgelehnt (Fehler " + r.status + (why ? ": " + why : "") + "). " + hint, true); return;
    }
    var names = [];
    try { names = (JSON.parse(r.body).models || []).map(function(m){ return m.name || m.model; }); } catch(e){}
    if (r.status >= 400) { st("#olStatus", "Server antwortet mit Fehler " + r.status + ".", true); return; }
    $("#olModels").innerHTML = names.map(function(n){ return '<option value="' + String(n).replace(/"/g, "&quot;") + '"></option>'; }).join("");
    var want = $("#olModel").value.trim() || window.__ollamaDefModel();
    var has = names.some(function(n){ return n === want || n === want + ":latest" || n.split(":")[0] === want; });
    if (!names.length) st("#olStatus", "Verbunden, aber es ist noch kein Modell installiert. Am PC: ollama pull " + want, true);
    else if (!has) st("#olStatus", "Verbunden. „" + want + "“ fehlt auf dem Server. Installiert: " + names.join(", ") + ". Tippe ins Modellfeld, um eines auszuwählen, oder am PC: ollama pull " + want, true);
    else st("#olStatus", "Verbunden. Modell „" + want + "“ ist bereit. Installiert: " + names.join(", "));
  };

  $("#expBtn").onclick = function(){
    var data = lsGet("zl-cache") || "{}";
    try { var o = JSON.parse(data); o.recipeImgs = JSON.parse(lsGet("zl-rimg") || "{}"); data = JSON.stringify(o); } catch(e) {}
    var d = new Date(), p = function(n){ return String(n).padStart(2, "0"); };
    var name = "ernaehrungstracker-" + d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + ".json";
    var res = window.Android.saveFile(name, data);
    if (res && res.indexOf("ok:") === 0) st("#bakStatus", "Gespeichert unter " + res.slice(3));
    else st("#bakStatus", "Export fehlgeschlagen: " + res, true);
  };
  $("#impIn").onchange = function(ev){
    var f = ev.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function(){
      try {
        var j = JSON.parse(r.result);
        if (!j || typeof j !== "object" || !("days" in j || "profile" in j)) throw 0;
        if (j.recipeImgs) { lsSet("zl-rimg", JSON.stringify(j.recipeImgs)); delete j.recipeImgs; }
        lsSet("zl-cache", JSON.stringify(j));
        st("#bakStatus", "Importiert. Lade neu …");
        setTimeout(function(){ location.reload(); }, 600);
      } catch(e) { st("#bakStatus", "Diese Datei ist keine Sicherung aus dem Ernährungstracker.", true); }
    };
    r.readAsText(f);
  };

  /* ---------- Erinnerungen ---------- */
  function remCfg(){ try { var c = JSON.parse(lsGet("zl-rem") || "{}"); return {food: c.food !== false, water: c.water !== false}; } catch(e){ return {food: true, water: true}; } }
  function permText(){
    var s = window.Android.notifState ? window.Android.notifState() : "on";
    $("#remPerm").hidden = s === "on";
    if (s === "on") st("#remStatus", "Mitteilungen sind erlaubt.");
    else st("#remStatus", s === "ask" ? "Erlaube Mitteilungen, damit die Erinnerungen ankommen." : "Mitteilungen sind in den Android-Einstellungen ausgeschaltet. Tippe auf „Mitteilungen erlauben“.", true);
    return s;
  }
  function at(d, h, m){ var x = new Date(d); x.setHours(h, m, 0, 0); return x.getTime(); }
  function plan(){
    var z = window.__zl; if (!z || !window.Android.setReminders) return;
    var cfg = remCfg(), T = z.targets(), now = Date.now(), out = [], fmt = z.fmt;
    for (var off = 0; off < 2; off++) {
      var d = new Date(); d.setDate(d.getDate() + off);
      var key = z.dkey(d), day = off === 0 ? (z.days()[key] || {}) : {};
      var t = z.dayTotals(day.entries || []), water = day.water || 0, wGoal = z.waterGoalFor(key);
      if (cfg.food) z.mealPlan().forEach(function(sl, i){
        var hm = sl.rem, ts = at(d, hm[0], hm[1]); if (ts <= now + 60000) return;
        var frac = z.planFrac(sl);
        var missK = T.kcal * frac - t.kcal, lowC = t.carbs < T.carbs * frac * 0.75, lowP = t.protein < T.protein * frac * 0.75;
        if (missK < 250 && !lowC) return;
        var meal = z.ideaFor(sl, d.getDate() * 10 + i);
        var title = missK >= 250 ? sl.title : "Dir fehlen Kohlenhydrate";
        var text = "Bisher " + fmt(t.kcal) + " von " + fmt(T.kcal) + " kcal. Noch " + fmt(T.kcal - t.kcal) + " kcal offen";
        var extra = [];
        if (lowC) extra.push(fmt(Math.max(0, T.carbs - t.carbs)) + " g Kohlenhydrate");
        if (lowP) extra.push(fmt(Math.max(0, T.protein - t.protein)) + " g Protein");
        if (extra.length) text += ", davon " + extra.join(" und ");
        text += ". Idee: " + meal + ".";
        out.push({at: ts, title: title, text: text, kind: "food"});
      });
      if (cfg.water) [10,12,14,16,18,20].forEach(function(h){
        var ts = at(d, h, 0); if (ts <= now + 60000) return;
        var exp = wGoal * Math.max(0, Math.min(1, (h - 8) / 13));
        var gm = z.glassMl ? z.glassMl() : 250;
        if (water >= exp - gm) return;
        out.push({at: ts, title: "Zeit für ein Glas Wasser", text: fmt(water / 1000, 1) + " von " + fmt(wGoal / 1000, 1) + " l getrunken. Ein Glas (" + gm + " ml) bringt dich näher an dein Ziel.", kind: "water"});
      });
    }
    out.sort(function(a, b){ return a.at - b.at; });
    window.Android.setReminders(JSON.stringify(out));
    window.__lastPlan = out;
  }
  var planTimer = null;
  window.__onRender = function(){ clearTimeout(planTimer); planTimer = setTimeout(plan, 800); };
  window.__notifChanged = function(){ permText(); };
  window.__appResume = function(){ permText(); window.__onRender(); };
  var rc = remCfg(); $("#remFood").checked = rc.food; $("#remWater").checked = rc.water;
  function saveRem(){ lsSet("zl-rem", JSON.stringify({food: $("#remFood").checked, water: $("#remWater").checked})); plan(); }
  $("#remFood").onchange = saveRem; $("#remWater").onchange = saveRem;
  $("#remPerm").onclick = function(){ window.Android.requestNotif(); };
  $("#remTest").onclick = function(){
    if (permText() !== "on") { window.Android.requestNotif(); return; }
    window.Android.testNotif(); st("#remStatus", "Test-Mitteilung gesendet.");
  };
  permText();
  if ((rc.food || rc.water) && !lsGet("zl-rem-asked") && window.Android.notifState && window.Android.notifState() === "ask") {
    lsSet("zl-rem-asked", "1"); setTimeout(function(){ window.Android.requestNotif(); }, 1500);
  }
  window.__onRender();

  window.__appBack = function(){
    if (window.__closeOverlay && window.__closeOverlay()) return true;
    var sub = document.querySelector('.modes button[aria-pressed="true"]');
    var onErf = !document.getElementById('v-erfassen').hidden;
    if (onErf && sub && (sub.dataset.m === 'mahlzeit' || sub.dataset.m === 'rezepte')) { document.querySelector('.modes button[data-m="foto"]').click(); return true; }
    var sel = document.querySelector('nav button[aria-selected="true"]');
    if (sel && sel.dataset.v !== "heute") { document.querySelector('nav button[data-v="heute"]').click(); return true; }
    return false;
  };
})();
