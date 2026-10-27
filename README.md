# Ernährungstracker

Kalorien- und Ernährungstracker zum **gesunden Zunehmen**, als Android-App und als Web-Version. Erfasst Mahlzeiten per Foto, Barcode, Etikett-Texterkennung, Beschreibung oder Schnell-Liste, bewertet jedes Essen mit einem wissenschaftlich begründeten Ernährungs-Score von 1 bis 10 und schlägt passende Gerichte aus über 2.500 Rezepten vor.

**Aktuelle Version: 2.0** · [APK herunterladen](apk/Ernaehrungstracker-2.0.apk)

## Funktionen

- **Tagesziel nach Profil**: Grundumsatz nach Mifflin-St Jeor, Aktivität über MET-Werte, Überschuss zum Zunehmen, Protein 2 g pro kg. Standardprofil: männlich, 23 Jahre, 58 kg, 177 cm, Ziel 66 kg.
- **Erfassen**: Foto der Mahlzeit, Barcode-Scanner mit [Open Food Facts](https://world.openfoodfacts.org), Etikett-Texterkennung, Beschreibung in Worten, Schnell-Liste und manuelle Eingabe.
- **Eigene Produkte**: Unbekannte Barcodes einmal anlegen (Werte eintippen oder Nährwerttabelle fotografieren), danach werden sie sofort erkannt.
- **Mahlzeiten aus mehreren Zutaten** mit Übersichtsseite: Werte ändern, Mengen anpassen (Änderungen rechnen Kalorien, Makros und Vitamine automatisch um), Zutaten löschen.
- **Ernährungs-Score 1–10** auf Basis von Nutri-Score-Logik, NOVA-Verarbeitungsgrad und Empfehlungen von WHO und DGE.
- **Vitamine und Mineralstoffe** je Mahlzeit und Tag im Vergleich zu den DGE-Referenzwerten.
- **Über 2.500 Rezeptvorschläge**: 682 Frühstücke, 620 Mittagessen, 620 Abendessen, 595 Snacks, je mit Zutaten, Zubereitung und Nährwerten. Passend zur Uhrzeit und zu den noch fehlenden Kalorien.
- **Mahlzeiten-Einstellungen**: Frühstück, Snacks, später Snack und Midnight Snack ein- oder ausschalten.
- **Rezepte**: eigene Rezepte mit Portionen und Foto der fertigen Mahlzeit; eingetragene Vorschläge landen automatisch im Ordner „KI-Rezepte“.
- **Einkaufsliste**: manuell, aus Rezepten, aus Vorschlägen und aus dem Chat; gleiche Zutaten werden zusammengerechnet und nach Supermarkt-Bereich sortiert.
- **Ernährungs-Chat**: Fragen zu Einkauf, Lebensmitteln und Training, mit Kontext zu Tagesziel und heutigem Stand.
- **Wassertracker** mit einstellbarer Glas- und Flaschengröße.
- **Erinnerungen** (Android) an Essen und Trinken, nur wenn man hinter dem Tagesplan liegt.
- **Übersicht und Verlauf**: Gewichtskurve mit Prognose, Wochenvergleich, Fototracker, Tagesdetails.
- **Neuigkeiten-Seite** nach jedem Update, dauerhaft unter Profil → Neuigkeiten.

## Installation (Android)

1. [`apk/Ernaehrungstracker-2.0.apk`](apk/Ernaehrungstracker-2.0.apk) aufs Handy laden und öffnen.
2. „Installation aus dieser Quelle zulassen“ erlauben. Warnt Play Protect, „Trotzdem installieren“ wählen.
3. Beim ersten Start Mitteilungen erlauben, damit die Erinnerungen ankommen.

Ab Android 7.0. Eine neue Version installiert sich über die alte, die Daten bleiben erhalten.

## KI einrichten (Ollama)

Foto-Erkennung, Etikett-Texterkennung, Beschreiben, KI-Ideen und der Chat laufen in der App über [Ollama](https://ollama.com). Einstellungen unter **Profil → KI-Analyse mit Ollama**.

- **Eigener PC (kostenlos, ohne Limit):** Ollama installieren, `ollama pull qwen2.5vl:7b`, Umgebungsvariable `OLLAMA_HOST=0.0.0.0` setzen, Ollama neu starten und die IP-Adresse des PCs in der App eintragen. Handy und PC müssen im selben WLAN sein.
- **Ollama Cloud:** Adresse `https://ollama.com`, API-Schlüssel aus dem ollama.com-Konto, Modell `gemma4:31b` (im kostenlosen Tarif enthalten, versteht Bilder).

Ohne KI funktionieren Barcode-Scanner, Schnell-Liste, manuelle Eingabe, Rezeptvorschläge, Einkaufsliste und alle Auswertungen weiterhin.

## Web-Version

[`web/ernaehrungstracker.html`](web/ernaehrungstracker.html) ist dieselbe App als einzelne HTML-Seite. Auf claude.ai läuft die KI dort über Claude und die Daten werden geräteübergreifend gespeichert. Als normale Datei im Browser geöffnet funktioniert sie ohne KI-Funktionen; die Daten bleiben dann im Browser.

## Aufbau

```
apk/        fertige, signierte APK
web/        Web-Version (eine HTML-Datei, Quelle der App-Oberfläche)
android/    Android-Hülle (WebView) und Build-Skripte
  app/        Manifest, Ressourcen, Java-Quellen, gebaute Assets
  app-shim.js   ersetzt in der App die KI-Anbindung durch Ollama
  app-extra.js  Ollama-Einstellungen, Datensicherung, Erinnerungen, Zurück-Taste
  app-panel.html  zusätzliche Bereiche im Profil der App
  build_html.py   baut aus der Web-Version die Datei app/assets/index.html
  build.sh        baut und signiert die APK
modules/    lesbare Einzelquellen der Funktionen aus Version 2.0
            (Rezeptgenerator, Mahlzeiten, Einkaufsliste, Chat, Rezepte)
```

Die Android-App ist eine schlanke WebView-Hülle ohne Fremdbibliotheken. Sie lädt `app/assets/index.html` und stellt über eine JavaScript-Schnittstelle Netzwerkzugriffe (Ollama, Open Food Facts), Kamera und Galerie, Datei-Export und Mitteilungen bereit.

## Selbst bauen

Benötigt: Java (JDK 17+), Python 3, Node.js, `aapt2`, eine `android.jar` (API 29 oder neuer) und [dex2jar 2.4](https://github.com/pxb1988/dex2jar) für `d2j-jar2dex`.

```bash
cd android
npm install
mkdir -p keys
# eigenen Signaturschlüssel erzeugen (wird nicht ins Repository übernommen)
openssl req -x509 -newkey rsa:2048 -nodes -keyout keys/key.pem -out keys/cert.pem -days 10000 -subj "/CN=Ernaehrungstracker"
TOOLS=/pfad/zu/android-tools bash build.sh
```

`build.sh` erwartet in `$TOOLS` die Dateien `aapt2`, `android.jar` und den Ordner `dex-tools-v2.4` (einzeln überschreibbar mit `AAPT2`, `ANDROID_JAR`, `D2J`). Das Ergebnis liegt in `android/Ernaehrungstracker.apk`.

Hinweis: Eine mit einem anderen Schlüssel signierte APK lässt sich nicht über eine bereits installierte Version installieren. Dafür muss die alte App erst deinstalliert werden.

## Datenquellen und Grundlagen

- Nährwerte der Rezepte: eigene Zutaten-Tabelle mit Durchschnittswerten (orientiert an BLS und USDA)
- Produktdaten: Open Food Facts (freie Datenbank, ODbL)
- Referenzwerte: DGE (Männer 19–24 Jahre), WHO (Zucker, Salz), ISSN (Protein)
- Barcode-Erkennung: [ZXing](https://github.com/zxing-js/library)

Die Werte sind Schätzungen und ersetzen keine ärztliche oder ernährungsfachliche Beratung.
