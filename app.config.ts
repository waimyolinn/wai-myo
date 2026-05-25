// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

// Custom package name for မိဘမေတ္တာ အထည်ဆိုင်
const customPackageName = "com.mibamyitta.wm";

const env = {
  appName: "မိဘမေတ္တာ အထည်ဆိုင်",
  appSlug: "mibamyitta",
  logoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663668194092/dEZFCY8gzhfnHrU7QdHyU9/icon-GPAMvZnoaFVQfxM549bJAg.webp",
  scheme: "mibamyitta",
  iosBundleId: customPackageName,
  androidPackage: customPackageName,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "2.0.1", // Increment version
  icon: "./assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSPhotoLibraryUsageDescription": "မိဘမေတ္တာ အထည်ဆိုင်မှ ပုံများကို သင့်ဖုန်းထဲသို့ သိမ်းဆည်းရန်အတွက် ဓါတ်ပုံများကို အသုံးပြုခွင့်ပေးရန် လိုအပ်ပါသည်။",
        "NSPhotoLibraryAddUsageDescription": "မိဘမေတ္တာ အထည်ဆိုင်မှ ပုံများကို သင့်ဖုန်းထဲသို့ သိမ်းဆည်းရန်အတွက် ဓါတ်ပုံများကို အသုံးပြုခွင့်ပေးရန် လိုအပ်ပါသည်။"
      }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    permissions: [
      "POST_NOTIFICATIONS",
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "VIBRATE",
      "WRITE_EXTERNAL_STORAGE",
      "READ_EXTERNAL_STORAGE",
      "READ_MEDIA_IMAGES", // Added for Android 13+
      "READ_MEDIA_VIDEO"   // Added for Android 13+
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          { scheme: env.scheme, host: "*" },
          { scheme: "https", host: "mibamyitta.shop" },
          { scheme: "http", host: "mibamyitta.shop" },
          { scheme: "viber", host: "*" },
          { scheme: "tg", host: "*" }
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
    backgroundColor: "#1a1a1a",
  },
  plugins: [
    "expo-asset",
    [
      "expo-media-library",
      {
        photosPermission: "မိဘမေတ္တာ အထည်ဆိုင်မှ ပုံများကို သင့်ဖုန်းထဲသို့ သိမ်းဆည်းရန်အတွက် ဓါတ်ပုံများကို အသုံးပြုခွင့်ပေးရန် လိုအပ်ပါသည်။",
        savePhotosPermission: "မိဘမေတ္တာ အထည်ဆိုင်မှ ပုံများကို သင့်ဖုန်းထဲသို့ သိမ်းဆည်းရန်အတွက် ဓါတ်ပုံများကို အသုံးပြုခွင့်ပေးရန် လိုအပ်ပါသည်။",
        isAccessMediaLocationEnabled: true
      }
    ],
    "expo-router",
    "expo-notifications",
    [
      "expo-audio",
      { microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone." }
    ],
    [
      "expo-video",
      { supportsBackgroundPlayback: true, supportsPictureInPicture: true }
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
          minSdkVersion: 24,
          usesCleartextTraffic: true,
          compileSdkVersion: 36,
          targetSdkVersion: 36,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  assetBundlePatterns: ["**/*"],
  splash: {
    image: "./assets/images/icon.png",
    resizeMode: "contain",
    backgroundColor: "#000000"
  },
  owner: "wiamyolinn",
  extra: {
    eas: {
      projectId: "5a20b844-0045-412e-8948-1b208b84eac5"
    }
  }
};

export default config;
