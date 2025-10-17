# Social Media Check - React Native Kiosk App

A React Native kiosk application designed for escape room experiences featuring social media awareness and cybersecurity education through an interactive LinkedIn profile simulation.

## Features

- **Password Protection**: Access code required to view the profile
- **LinkedIn-Style UI**: Professional social media interface
- **Kiosk Mode**: Full-screen experience with locked navigation
- **Kyle Matthews Profile**: Complete professional profile with experience, education, and skills
- **Android Tablet Optimized**: Designed for landscape tablet use
- **Hidden Exit**: Emergency exit via bottom-left corner taps (4 quick taps)

## Profile Details

- **Name**: Kyle Matthews
- **Title**: Data Analyst at Infinite Glow
- **Location**: Burke County, Georgia, USA
- **Company**: Infinite Glow
- **Education**: University of Georgia - Bachelor of Science in Statistics (2020)
- **Skills**: Python, SQL, Tableau, Power BI, R, Excel, Machine Learning, Statistical Analysis

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. For Android development:
   ```bash
   npx react-native run-android
   ```

## Password

The access password is: `glowdata2024`

You can change this in the `App.tsx` file by modifying the `ACCESS_PASSWORD` constant.

## Kiosk Mode

The app is designed to run in kiosk mode on Android tablets:
- Hides system UI elements
- Blocks back button
- Prevents task switching
- Keeps screen awake for extended periods
- Auto-starts on boot (when configured)

## Firebase Distribution

The app is configured for Firebase App Distribution for easy deployment to tablets:
- Build: `npm run build`
- Deploy: `npm run deploy` (requires Firebase CLI setup)

## Development

- **Framework**: React Native 0.82
- **Language**: TypeScript
- **Target Platform**: Android tablets (landscape orientation)
- **Minimum SDK**: Android API 21+
- **Target SDK**: Android API 34+

## Emergency Exit

If you need to exit the app during testing:
1. Tap the bottom-left corner of the screen 4 times quickly (within 2 seconds)
2. This will minimize the app and return to the Android home screen

## Escape Room Integration

This app is part of the Digital Doomsday escape room experience. Players discover Kyle Matthews' LinkedIn profile as part of solving puzzles related to Infinite Glow and data analysis.

## Files Structure

```
├── App.tsx                 # Main app component with LinkedIn UI
├── android/               # Android-specific kiosk configuration
├── images/               # Profile images and company logos
├── package.json          # Dependencies and scripts
└── README.md            # This file
```