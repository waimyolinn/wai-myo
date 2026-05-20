#!/bin/bash

# Build APK using Expo's prebuild and local gradle
echo "Building APK for မိဘမေတ္တာ အထည်ဆိုင်..."

# Generate native Android project
npx expo prebuild --clean --platform android 2>&1 | tail -10

echo "Native Android project generated successfully!"
