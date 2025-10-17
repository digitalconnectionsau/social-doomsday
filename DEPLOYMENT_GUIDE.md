# Firebase App Distribution Deployment Guide

## Overview
Your kiosk app is now configured with Firebase App Distribution for easy testing and deployment to Lenovo tablets.

## Project Configuration
- **Firebase Project**: doomsday-content
- **App ID**: `1:1028976833455:android:cdc2a698413314000eb55a`
- **Package Name**: `com.digitalconnections.doomsdaytest`

## Prerequisites

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Verify Project Access
```bash
firebase projects:list
```

## Building the App

### Option 1: Using the Build Script
```bash
./build-and-deploy.sh
```

### Option 2: Manual Build
```bash
cd android
./gradlew assembleRelease
```

## Distributing via Firebase App Distribution

### Command Line Distribution
```bash
firebase appdistribution:distribute \
  android/app/build/outputs/apk/release/app-release.apk \
  --app 1:1028976833455:android:cdc2a698413314000eb55a \
  --testers "email1@example.com,email2@example.com" \
  --release-notes-file release-notes.txt
```

### Using Gradle Task (Alternative)
```bash
cd android
./gradlew appDistributionUploadRelease
```

## Adding Testers

### Via Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/doomsday-content)
2. Navigate to App Distribution
3. Select your Android app
4. Click "Add testers" or "Manage testers"
5. Add email addresses of tablet users

### Via Command Line
```bash
firebase appdistribution:testers:add email1@example.com email2@example.com \
  --project doomsday-content
```

## Installing on Lenovo Tablets

### For Testers
1. Testers receive email invitation
2. Click link to install Firebase App Tester app
3. Download and install your kiosk app
4. App automatically launches in kiosk mode

### Direct Installation (Development)
1. Enable "Unknown Sources" on tablet:
   - Settings > Security > Unknown Sources (Enable)
2. Transfer APK file to tablet
3. Open file manager and install APK
4. Grant required permissions when prompted

## Kiosk Mode Features Enabled

✅ **Full Screen**: Status bar and navigation hidden  
✅ **Back Button Disabled**: Cannot exit app  
✅ **Landscape Locked**: Consistent orientation  
✅ **Screen Wake**: Prevents tablet from sleeping  
✅ **Touch Optimized**: Responsive design for tablets  

## Testing Checklist

Before deploying to production tablets:

- [ ] Test on actual Lenovo tablet (Android 15/16)
- [ ] Verify kiosk mode prevents app exit
- [ ] Test all touch interactions and scrolling
- [ ] Confirm screen stays awake during use
- [ ] Test landscape orientation lock
- [ ] Verify Firebase analytics are working

## Production Deployment Tips

1. **Create Tester Groups**: Organize by location/device type
2. **Staged Rollout**: Deploy to small group first
3. **Version Management**: Use meaningful version names
4. **Release Notes**: Include clear deployment instructions
5. **Monitor Analytics**: Track usage via Firebase

## APK File Locations

After building:
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

## Troubleshooting

### Build Issues
- Ensure Android SDK is properly configured
- Check `android/local.properties` has correct SDK path
- Clean build: `cd android && ./gradlew clean`

### Distribution Issues
- Verify Firebase CLI is logged in: `firebase login`
- Check project permissions in Firebase Console
- Ensure App ID matches in Firebase Console

### Device Installation Issues
- Enable "Unknown Sources" in device settings
- Check device has sufficient storage
- Verify Android version compatibility (15/16+)

## Support

For deployment issues:
1. Check Firebase Console logs
2. Review build output for errors
3. Test on emulator first
4. Contact Firebase Support if needed

## Security Notes

- APK is signed with debug key (development)
- For production, use release signing configuration
- Consider additional device management tools for enterprise deployment
- Review Firebase security rules and analytics privacy settings