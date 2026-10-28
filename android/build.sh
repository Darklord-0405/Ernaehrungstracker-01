#!/usr/bin/env bash
# Baut Zunahme-Log.apk: aapt2 (Ressourcen) -> javac -> dx (dex) -> zip -> signieren
set -euo pipefail
cd "$(dirname "$0")"
# Werkzeuge: aapt2, android.jar (API 29+) und dex2jar 2.4 (d2j-jar2dex). Pfade per Umgebungsvariable anpassen.
TOOLS="${TOOLS:-$HOME/android-tools}"
AAPT2="${AAPT2:-$TOOLS/aapt2}"
ANDROID_JAR="${ANDROID_JAR:-$TOOLS/android.jar}"
D2J="${D2J:-$TOOLS/dex-tools-v2.4}"
OUT=build
rm -rf $OUT && mkdir -p $OUT/res $OUT/classes

python3 build_html.py "${1:-../web/ernaehrungstracker.html}"

$AAPT2 compile --dir app/res -o $OUT/res.zip
$AAPT2 link -o $OUT/base.apk -I $ANDROID_JAR --manifest app/AndroidManifest.xml \
  --min-sdk-version 24 --target-sdk-version 34 --version-code 12 --version-name 2.1 \
  -A app/assets --java $OUT/gen $OUT/res.zip

javac -nowarn -source 8 -target 8 -bootclasspath $ANDROID_JAR -encoding UTF-8 \
  -d $OUT/classes $(find $OUT/gen app/src -name '*.java') 2>&1 | grep -v -E "^(Picked up|warning: \[options\])|^1 warning" || true
(cd $OUT/classes && jar cf ../classes.jar .)
bash $D2J/d2j-jar2dex.sh -f -o $OUT/classes.dex $OUT/classes.jar 2>&1 | grep -v "Picked up" || true

python3 - <<'EOF'
import zipfile, shutil
shutil.copy("build/base.apk", "build/unsigned.apk")
with zipfile.ZipFile("build/unsigned.apk", "a", zipfile.ZIP_DEFLATED) as z:
    z.write("build/classes.dex", "classes.dex")
EOF

node sign.mjs $OUT/unsigned.apk Ernaehrungstracker.apk
ls -la Ernaehrungstracker.apk
