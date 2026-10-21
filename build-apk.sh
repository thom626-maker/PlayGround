#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Sync web source into the native wrapper
cp ./index.html ./android/app/src/main/assets/www/index.html

# Build installable debug APK (debug-signed, sideload-ready)
./android/gradlew -p ./android :app:assembleDebug --no-daemon

mkdir -p ./release
cp ./android/app/build/outputs/apk/debug/app-debug.apk ./direct-chat.apk
cp ./android/app/build/outputs/apk/debug/app-debug.apk ./release/direct-chat.apk

echo "APK ready:"
ls -lh ./direct-chat.apk ./release/direct-chat.apk
