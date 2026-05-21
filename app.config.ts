// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

// Custom package name for မိဘမေတ္တာ အထည်ဆိုင်
const customPackageName = "com.mibamyitta.wm";

const env = {
  // App branding - update these values directly (do not use env vars)
  appName: "မိဘမေတ္တာ အထည်ဆိုင်",
  appSlug: "miba-myitta",
  // S3 URL of the app logo - set this to the URL returned by generate_image when creating custom logo
  // Leave empty to use the default icon from assets/images/icon.png
  logoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663668194092/dEZFCY8gzhfnHrU7QdHyU9/icon-GPAMvZnoaFVQfxM549bJAg.webp",
  scheme: "mibamyitta",
  iosBundleId: customPackageName,
  androidPackage: customPackageName,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "2.0.0",

  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#84102d",


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
    ],
    screenOrientation: "portrait",
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
            host: "*",
          },
          {
            scheme: "https",
            host: "mibamyitta.shop",
          },
          {
            scheme: "http",
            host: "mibamyitta.shop",
          },
          {
            scheme: "viber",
            host: "*",
          },
          {
            scheme: "tg",
            host: "*",
          },
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
    "expo-router",
    "expo-notifications",
    [
      "expo-audio",
      {
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#1a1a1a",
        dark: {
          backgroundColor: "#1a1a1a",
        },
      },
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
  // Fullscreen mode for WebView app
  assetBundlePatterns: ["**/*"],
  owner: "waimyo",
  extra: {
    eas: {
      projectId: "30451cbd-a868-4d74-8c68-85bcaf2cad3e"
    }
  }
};

export default config;
