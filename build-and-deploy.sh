#!/bin/bash

# Kiosk App - Build and Deploy Script
# This script builds the Android APK and optionally distributes it via Firebase App Distribution

set -e

echo "🚀 Building Kiosk App for Android..."

# Navigate to project root
cd "$(dirname "$0")"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean

# Build debug APK
echo "📱 Building debug APK..."
./gradlew assembleDebug

# Build release APK  
echo "📦 Building release APK..."
./gradlew assembleRelease

# Show APK locations
echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📁 APK Files:"
echo "Debug APK:   android/app/build/outputs/apk/debug/app-debug.apk"
echo "Release APK: android/app/build/outputs/apk/release/app-release.apk"
echo ""

# Check if Firebase CLI is available for distribution
if command -v firebase &> /dev/null; then
    echo "🔥 Firebase CLI detected."
    echo "To distribute via Firebase App Distribution, run:"
    echo "firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk --app 1:1028976833455:android:cdc2a698413314000eb55a"
else
    echo "💡 To set up Firebase App Distribution:"
    echo "1. Install Firebase CLI: npm install -g firebase-tools"
    echo "2. Login: firebase login"
    echo "3. Distribute: firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk --app 1:1028976833455:android:cdc2a698413314000eb55a"
fi

echo ""
echo "🎯 Ready for deployment to Lenovo tablets!"