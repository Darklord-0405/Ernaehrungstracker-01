"""Baut assets/index.html für die Android-App aus der Artifact-Seite."""
import pathlib, re, sys

root = pathlib.Path(__file__).parent
src = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
out_dir = root / "app" / "assets"
(out_dir / "fonts").mkdir(parents=True, exist_ok=True)

# Schriften offline einbetten
fonts = [("Bricolage Grotesque", "bricolage-grotesque", [500, 700, 800]),
         ("Figtree", "figtree", [400, 500, 600, 700]),
         ("IBM Plex Mono", "ibm-plex-mono", [400, 500])]
face_css = []
for fam, slug, weights in fonts:
    pkg = next((root / "fonts").glob(f"fontsource-{slug}-*/package/files"), None)
    for w in weights:
        fn = f"{slug}-latin-{w}-normal.woff2"
        if pkg is not None:
            (out_dir / "fonts" / fn).write_bytes((pkg / fn).read_bytes())
        assert (out_dir / "fonts" / fn).exists(), f"Schrift fehlt: {fn} (npm pack @fontsource/{slug} nach fonts/ entpacken)"
        face_css.append(f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:normal;font-display:swap;src:url(fonts/{fn}) format('woff2')}}")

src = re.sub(r'<link rel="preconnect"[^>]*>\s*', "", src)
src = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>\s*', "", src)
src = src.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")

head = ('<!doctype html><html lang="de"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>:root{color-scheme:light}body{margin:0;font:14px system-ui,sans-serif;-webkit-tap-highlight-color:transparent}'
        'img{max-width:100%}[hidden]{display:none!important}' + "".join(face_css) + '</style></head><body>')

panel = (root / "app-panel.html").read_text(encoding="utf-8")
anchor = '    <p class="note" id="storeNote"></p>'
assert anchor in src, "storeNote anchor missing"
src = src.replace(anchor, panel + anchor)

# Fehlermeldungen der App-Bridge einhängen
n1 = src.count("status(map[e?.code]||")
src = src.replace("status(map[e?.code]||", "status(map[e?.code]||(window.__appErr&&window.__appErr(e))||")
n2 = src.count('[e?.code]||"Das hat nicht geklappt.')
src = src.replace('[e?.code]||"Das hat nicht geklappt.', '[e?.code]||(window.__appErr&&window.__appErr(e))||"Das hat nicht geklappt.')
assert n1 == 1 and n2 == 1, (n1, n2)
src = src.replace('"Deine Einträge werden in diesem Browser gespeichert."',
                  '(window.__isApp?"Deine Einträge werden auf diesem Handy gespeichert. Sichere sie ab und zu über „Daten exportieren“.":"Deine Einträge werden in diesem Browser gespeichert.")')

# Texte: in der App läuft die KI über Ollama statt Claude
for a, b in [(">Ideen von Claude<", ">KI-Ideen<"),
             ("Claude erkennt das Essen, schätzt", "Die KI erkennt das Essen, schätzt"),
             ('"Claude analysiert die Mahlzeit …"', '"KI analysiert die Mahlzeit … (lokal kann das 1–2 Minuten dauern)"'),
             ('"Lese Text vom Etikett und bewerte …"', '"Lese Text vom Etikett und bewerte … (lokal kann das 1–2 Minuten dauern)"'),
             ('"Claude sucht passende Gerichte …"', '"KI sucht passende Gerichte …"'),
             ("Du hast den Zugriff auf Claude abgelehnt. ", ""),
             ("Ohne Erlaubnis für Claude gibt es nur die eingebauten Vorschläge.", "Ohne KI gibt es nur die eingebauten Vorschläge."),
             ("Tippe noch einmal auf „Ideen von Claude“.", "Tippe noch einmal auf „KI-Ideen“.")]:
    assert a in src, a
    src = src.replace(a, b)
src = src.replace("<title>Florians Ernährungstracker</title>", "<title>Ernährungstracker</title>")

zx_tag = '<script src="https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js"></script>'
assert src.count(zx_tag) == 1, "zxing tag"
(out_dir / "lib").mkdir(exist_ok=True)
zx = root / "node_modules" / "@zxing" / "library" / "umd" / "index.min.js"
if zx.exists():
    (out_dir / "lib" / "zxing.min.js").write_bytes(zx.read_bytes())
assert (out_dir / "lib" / "zxing.min.js").exists(), "zxing fehlt: npm install"
src = src.replace(zx_tag, '<script src="lib/zxing.min.js"></script>')

shim = (root / "app-shim.js").read_text(encoding="utf-8")
extra = (root / "app-extra.js").read_text(encoding="utf-8")
first_script = src.index("<script>")
src = src[:first_script] + "<script>\n" + shim + "\n</script>\n" + src[first_script:]
src = src + "\n<script>\n" + extra + "\n</script>\n"

(out_dir / "index.html").write_text(head + src + "</body></html>", encoding="utf-8")
print("ok", len(head + src))
