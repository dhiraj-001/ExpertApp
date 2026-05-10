# Vedaz Expert Booking App - Frontend

The mobile application interface for the Vedaz Expert Booking platform, built with React Native and Expo. It delivers a premium, native-feeling experience for users to browse experts and book consultation sessions.

## 🚀 Innovative Architecture
Unlike traditional mobile booking apps that rely on static screen refreshes, this app utilizes a reactive architecture powered by **Socket.io-client**. The UI dynamically updates in real-time as backend events occur (e.g., booking approvals), ensuring the user never looks at stale data. The UI architecture heavily utilizes modern Glassmorphism and Context-driven dynamic theming.

## ✨ Core Features
- **Real-Time Booking Dashboard**: Instantaneous updates of booking statuses without pulling to refresh.
- **Dynamic Theming**: Full dark/light mode support utilizing React's `Context API`, seamlessly reacting to user preferences.
- **Custom UI Components**: Highly polished, bespoke components like `CustomAlert` and `SessionCards` replacing generic OS defaults to provide a cohesive brand experience.
- **Optimized Forms**: Smart input handling with `KeyboardAvoidingView` and native `TextInput` optimizations.

## 🛡️ Security Measures
- **Strict Client-Side Validation**: Robust Regex-based sanitization and validation for sensitive inputs (Emails, Phone numbers) before network transmission, preventing malformed data payloads.
- **Safe Area Management**: `SafeAreaView` ensures UI elements do not overlap with OS-level hardware notches or navigation bars, preventing tap-jacking or obscured security prompts.
- **Secure Network Calls**: All API interactions are encapsulated within a dedicated `api` service layer, making it easy to enforce HTTPS-only communication and inject authorization tokens.

## 🛠️ Tech Stack
- **Framework**: React Native & Expo
- **Navigation**: React Navigation (Bottom Tabs, Native Stack)
- **UI Libraries**: React Native Paper, Expo Vector Icons
- **Real-Time**: Socket.io-client
- **State Management**: React Context API & Hooks

## 🌍 Environment Variables
Create a `.env` file in the root of the project with the following keys:
```env
EXPO_PUBLIC_BASE_URL=https://expertapp.onrender.com
```

## 📦 Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the Expo server:**
   ```bash
   npm start
   ```
3. **Run on Device:**
   - Press `a` for Android emulator.
   - Press `i` for iOS simulator.
   - Scan the QR code with the Expo Go app on a physical device.
