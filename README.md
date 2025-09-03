# Bharat KYC - Digital Identity Verification Portal

## Overview
A government-grade KYC (Know Your Customer) verification system with both mobile and web applications. Features real-time document capture, face verification, and comprehensive validation with professional government styling.

## Current Implementation

### Web Application (`web-app/index.html`)
- **Standalone HTML5 app** with complete KYC workflow
- **Live camera integration** for document and face capture
- **Real-time processing simulation** with OCR and face analysis
- **Document validation** with fake detection (20% simulation rate)
- **Multi-language support** (English, Hindi, Telugu, Tamil, Bengali, Gujarati)
- **Professional government UI** with Indian flag colors
- **Mobile-responsive design** optimized for all devices
- **PDF report generation** and sharing functionality

### Mobile Application (`mobile-app/`)
- **React Native 0.72.6** with Expo SDK 49
- **expo-camera integration** for real camera functionality
- **Document and face processing** components
- **Government-style UI** without emojis
- **Offline-capable** with local processing

## Key Features
- **Document Support**: Aadhaar, PAN, Driving License, Voter ID
- **Face Verification**: Live camera capture with liveness detection
- **Document Validation**: Fake document detection with error handling
- **Multi-language UI**: Dynamic translation system
- **Optional Phone Verification**: Demo mode with OTP bypass
- **Professional Design**: Government portal styling
- **Mobile Optimized**: Responsive layout for all screen sizes
- **Error Handling**: Comprehensive validation with user feedback

## Technical Stack
- **Web**: Pure HTML5, CSS3, JavaScript (no frameworks)
- **Mobile**: React Native with Expo
- **Camera**: MediaDevices API (web), expo-camera (mobile)
- **Processing**: Simulated ML/AI with TensorFlow.js references
- **Styling**: Government color scheme (saffron, white, green)
- **Languages**: English (default), Hindi, Telugu, Tamil, Bengali, Gujarati

## Project Structure
```
KYC/
├── web-app/
│   ├── index.html           # Complete standalone web app
│   └── webpack.config.js    # Build configuration
├── mobile-app/
│   ├── App.js              # Main React Native app
│   ├── components/
│   │   ├── CameraScreen.js     # Camera functionality
│   │   └── DocumentProcessor.js # Processing logic
│   ├── package.json        # Dependencies
│   └── metro.config.js     # Metro bundler config
└── README.md
```

## Getting Started

### Web Application
1. Open `web-app/index.html` in any modern browser
2. Click "Start KYC Verification" to begin
3. Select document type and capture photos
4. Complete verification process

### Mobile Application
1. Navigate to `mobile-app/` directory
2. Install dependencies: `npm install`
3. Start Expo: `npx expo start`
4. Scan QR code with Expo Go app or run on simulator

## Features Implemented
- ✅ Real camera integration (web and mobile)
- ✅ Document and face capture
- ✅ Fake document detection simulation
- ✅ Multi-language translation system
- ✅ Professional government UI design
- ✅ Mobile-responsive layout
- ✅ Error handling and validation
- ✅ PDF report generation
- ✅ Optional phone verification (demo mode)
- ✅ Offline-capable processing

## Demo Flow
1. **Welcome** → Start KYC (skips phone verification)
2. **Document Selection** → Choose Aadhaar/PAN/License/Voter ID
3. **Camera Capture** → Take document photo
4. **Face Verification** → Capture selfie
5. **Processing** → Analyze and validate (simulated)
6. **Results** → Show verification status with download/share options

## Language Support
- **English** (default)
- **Hindi** (हिन्दी)
- **Telugu** (తెలుగు) 
- **Tamil** (தமிழ்)
- **Bengali** (বাংলা)
- **Gujarati** (ગુજરાતી)

## License
MIT License
