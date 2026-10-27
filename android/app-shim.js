/* App-Modus: KI über Ollama (lokaler Server im WLAN oder Ollama Cloud) statt claude.ai. */
(function(){
  if (window.claude || !window.Android) return;
  window.__isApp = true;
  function defModel(){ return /ollama\.com/i.test(base()) ? "gemma4:31b" : "qwen2.5vl:7b"; }
  window.__ollamaDefModel = function(){ return defModel(); };
  function ls(k){ try { return localStorage.getItem(k) || ""; } catch(e){ return ""; } }
  function base(){
    var u = ls("zl-ollama-url").trim().replace(/\/+$/, "");
    if (u && !/^https?:\/\//i.test(u)) u = "http://" + u;
    if (u && !/:\d+$/.test(u) && !/^https:/i.test(u) && !/ollama\.com/i.test(u)) u += ":11434";
    return u;
  }
  window.__ollamaBase = base;
  function headers(){
    var h = {"content-type": "application/json", "accept": "application/json"}, k = ls("zl-ollama-key").replace(/^\s*bearer\s+/i, "").replace(/\s+/g, "");
    if (k) h["authorization"] = "Bearer " + k;
    return h;
  }
  var cbs = {}, n = 0;
  window.__httpDone = function(id, status, body){ var c = cbs[id]; delete cbs[id]; if (c) c(status, body); };
  function http(method, url, body){
    return new Promise(function(res){
      var id = "h" + (++n);
      cbs[id] = function(s, b){ res({status: s, body: b}); };
      window.Android.request(id, method, url, JSON.stringify(headers()), body || "");
    });
  }
  window.__ollamaHttp = http;
  window.__appGet = function(url){
    return new Promise(function(res){
      var id = "g" + (++n);
      cbs[id] = function(s, b){ res({status: s, body: b}); };
      window.Android.request(id, "GET", url, JSON.stringify({"accept": "application/json"}), "");
    });
  };
  function toB64(blob){
    return new Promise(function(res, rej){
      var img = new Image();
      img.onload = function(){
        var r = Math.min(1, 1280 / Math.max(img.width, img.height));
        var c = document.createElement("canvas");
        c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src);
        res(c.toDataURL("image/jpeg", 0.85).split(",")[1]);
      };
      img.onerror = function(){ rej({code: "image_rejected", message: "Bild nicht lesbar"}); };
      img.src = URL.createObjectURL(blob);
    });
  }
  function extractJSON(t){
    try { return JSON.parse(t); } catch(e){}
    var m = t.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) { try { return JSON.parse(m[1]); } catch(e){} }
    var s = t.search(/[\[{]/), e2 = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
    if (s >= 0 && e2 > s) { try { return JSON.parse(t.slice(s, e2 + 1)); } catch(e){} }
    throw {code: "invalid_json", message: "Keine JSON-Antwort", text: t};
  }
  async function call(input, opts, asJson){
    opts = opts || {};
    var b = base();
    if (!b) throw {code: "no_host", message: ""};
    var imgs = opts.images ? (opts.images instanceof Blob ? [opts.images] : Array.prototype.slice.call(opts.images)) : [];
    var images = [];
    for (var i = 0; i < imgs.length; i++) images.push(await toB64(imgs[i]));
    var msgs = typeof input === "string" ? [{role: "user", content: input}] : input.map(function(m){ return {role: m.role === "assistant" ? "assistant" : "user", content: String(m.content)}; });
    if (images.length) msgs[msgs.length - 1].images = images;
    var req = {model: ls("zl-ollama-model").trim() || defModel(), stream: false, messages: msgs, options: {temperature: asJson ? 0.4 : 0.7, num_ctx: 8192}};
    if (asJson) req.format = "json";
    var r = await http("POST", b + "/api/chat", JSON.stringify(req));
    if (r.status === 0) throw {code: "offline", message: r.body};
    var j = null; try { j = JSON.parse(r.body); } catch(e){}
    var err = j && j.error || "";
    if (r.status === 401 || r.status === 403) throw {code: "bad_key", message: err};
    if (r.status === 404) throw {code: "bad_model", message: err};
    if (r.status === 402) throw {code: "paid_model", message: err};
    if (r.status >= 400 || !j) throw {code: "api_error", message: err || ("HTTP " + r.status)};
    var text = j.message && j.message.content || "";
    if (!text.trim()) throw {code: "empty_completion", message: ""};
    return {text: text, truncated: j.done_reason === "length", modelTierApplied: "default"};
  }
  var sample = function(i, o){ return call(i, o, false); };
  sample.json = async function(i, o){
    var p = typeof i === "string" ? i + "\n\nAntworte ausschließlich mit gültigem JSON, ohne weiteren Text." : i;
    var r = await call(p, o, true);
    var v = extractJSON(r.text);
    // Manche Modelle verpacken ein verlangtes Array in ein Objekt
    if (/JSON-Array/.test(String(i)) && v && !Array.isArray(v) && typeof v === "object") {
      var arr = Object.keys(v).map(function(k){ return v[k]; }).find(Array.isArray);
      if (arr) v = arr;
    }
    return v;
  };
  sample.limits = async function(){ return {maxPromptBytes: 262144, images: {maxCount: 5, maxInputBytes: 20000000, mediaTypes: ["image/jpeg", "image/png", "image/webp"]}}; };
  window.claude = { use: async function(name){ return name === "sample" ? sample : null; } };
  window.__appErr = function(e){
    var c = e && e.code;
    if (c === "no_host") return "Trag zuerst die Adresse deines Ollama-Servers unter Profil → KI-Analyse ein.";
    if (c === "offline") return "Ollama ist nicht erreichbar. Läuft der Server, und ist das Handy im selben WLAN? Schnell-Liste und manuelle Eingabe gehen auch ohne.";
    if (c === "bad_model") return "Das Modell ist auf dem Ollama-Server nicht installiert" + (e.message ? " (" + e.message + ")" : "") + ". Prüfe den Namen unter Profil.";
    if (c === "bad_key") return "Der Ollama-Server hat den Zugriff abgelehnt. Prüfe den API-Schlüssel unter Profil.";
    if (c === "paid_model") return "Dieses Modell ist bei Ollama Cloud kostenpflichtig. Nimm im Profil gemma4:31b, das ist im Free-Tarif enthalten und versteht Bilder.";
    if (c === "invalid_json") return "Das Modell hat kein auswertbares Ergebnis geliefert. Versuch es noch einmal oder nimm ein größeres Modell.";
    if (c === "api_error") return "Ollama meldet einen Fehler" + (e.message ? ": " + e.message : ".");
    return "";
  };
})();
