#!/bin/bash
echo "🔧 Building and installing debug APK..."

cd android

# Clean and build debug APK
./gradlew clean assembleDebug --parallel

if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "📱 Installing debug APK on device..."
    adb install -r app/build/outputs/apk/debug/app-debug.apk
    echo "✅ Debug APK installed successfully!"
    echo "🚀 Open the app and shake to access dev menu"
else
    echo "❌ Debug APK not found"
fi