#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

ROOT="$(pwd)"
ASSETS="$ROOT/android/app/src/main/assets/www"

echo "==> Sincronizando o app web para o Android"
rm -rf "$ASSETS"
mkdir -p "$ASSETS/assets"
cp index.html styles.css app.js manifest.webmanifest sw.js "$ASSETS/"
cp -a assets/. "$ASSETS/assets/"
rm -f "$ASSETS/assets/bg.jpg" \
      "$ASSETS/assets/icon.svg" \
      "$ASSETS/assets/icon-foreground.svg" \
      "$ASSETS/assets/icon-background.svg" \
      "$ASSETS/assets/favicon-32.png"

echo "==> Preparando a chave de assinatura"
KEYSTORE_DIR="$ROOT/keystore"
KEYSTORE="$KEYSTORE_DIR/miragecity-release.jks"
STORE_PASS="${MIRAGE_KEYSTORE_PASSWORD:-miragecity-local-key}"
KEY_PASS="${MIRAGE_KEY_PASSWORD:-$STORE_PASS}"
ALIAS="${MIRAGE_KEY_ALIAS:-miragecity}"

if [ ! -f "$KEYSTORE" ]; then
  mkdir -p "$KEYSTORE_DIR"
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias "$ALIAS" \
    -keyalg RSA \
    -keysize 4096 \
    -validity 10000 \
    -storepass "$STORE_PASS" \
    -keypass "$KEY_PASS" \
    -dname "CN=Mirage City, OU=Mirage City, O=Mirage City, L=Sao Paulo, ST=SP, C=BR" >/dev/null
  echo "    Chave criada em: $KEYSTORE"
  echo "    Guarde esse arquivo para assinar futuras atualizações."
fi

cat > "$ROOT/keystore.properties" <<EOF
storeFile=../keystore/miragecity-release.jks
storePassword=$STORE_PASS
keyAlias=$ALIAS
keyPassword=$KEY_PASS
EOF
chmod 600 "$ROOT/keystore.properties"

echo "==> Compilando o APK"
if command -v gradle >/dev/null 2>&1; then
  GRADLE=(gradle)
elif [ -x "$ROOT/android/gradlew" ]; then
  GRADLE=("$ROOT/android/gradlew")
else
  echo "Gradle não encontrado. Instale o Gradle ou use o wrapper em android/gradlew." >&2
  exit 1
fi

"${GRADLE[@]}" -p "$ROOT/android" :app:assembleRelease --no-daemon

APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
mkdir -p "$ROOT/release"
cp "$APK" "$ROOT/MirageCity.apk"
cp "$APK" "$ROOT/release/MirageCity.apk"

echo "==> Verificando a assinatura e o pacote"
BUILD_TOOLS="$(ls -d "${ANDROID_HOME:-$ANDROID_SDK_ROOT}"/build-tools/* 2>/dev/null | sort -V | tail -1 || true)"
if [ -n "$BUILD_TOOLS" ] && [ -x "$BUILD_TOOLS/apksigner" ]; then
  "$BUILD_TOOLS/apksigner" verify --print-certs "$ROOT/MirageCity.apk" | sed -n '1,8p'
fi
if [ -n "$BUILD_TOOLS" ] && [ -x "$BUILD_TOOLS/aapt2" ]; then
  "$BUILD_TOOLS/aapt2" dump badging "$ROOT/MirageCity.apk" | sed -n '1,3p'
fi

echo
echo "APK pronto:"
ls -lh "$ROOT/MirageCity.apk" "$ROOT/release/MirageCity.apk"
