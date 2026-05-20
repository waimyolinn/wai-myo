import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  Pressable,
  ScrollView,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system/legacy";
import { ScreenContainer } from "./screen-container";
import { MYANMAR_STRINGS } from "@/lib/myanmar-strings";
import { Ionicons } from "@expo/vector-icons";

const WEBSITE_URL = "https://mibamyitta.shop";
const CACHE_DIR = FileSystem.documentDirectory + "website_cache/";
const CACHE_INDEX_FILE = CACHE_DIR + "index.html";
const CACHE_TIMESTAMP_FILE = CACHE_DIR + "timestamp.json";
const CACHE_EXPIRY_DAYS = 7;

interface WebViewScreenProps {
  onNotificationReceived?: (notification: any) => void;
}

export function WebViewScreen({ onNotificationReceived }: WebViewScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cachedContent, setCachedContent] = useState<string | null>(null);
  const webViewRef = React.useRef<WebView>(null);

  // Initialize cache directory
  useEffect(() => {
    const initializeCache = async () => {
      try {
        const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(CACHE_DIR, {
            intermediates: true,
          });
        }

        // Load cached content
        await loadCachedContent();

        // Clear expired cache
        await clearExpiredCache();
      } catch (error) {
        console.error("Error initializing cache:", error);
      }
    };

    initializeCache();
  }, []);

  // Load cached content
  const loadCachedContent = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(CACHE_INDEX_FILE);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(CACHE_INDEX_FILE);
        setCachedContent(content);
      }
    } catch (error) {
      console.error("Error loading cached content:", error);
    }
  };

  // Clear expired cache (older than 7 days)
  const clearExpiredCache = async () => {
    try {
      const timestampFile = await FileSystem.readAsStringAsync(
        CACHE_TIMESTAMP_FILE
      );
      const { timestamp } = JSON.parse(timestampFile);
      const now = Date.now();
      const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      if (now - timestamp > expiryTime) {
        await FileSystem.deleteAsync(CACHE_DIR);
        await FileSystem.makeDirectoryAsync(CACHE_DIR, {
          intermediates: true,
        });
      }
    } catch (error) {
      // Timestamp file doesn't exist yet, that's okay
    }
  };

  // Handle WebView navigation
  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = request.url;

    // Handle Telegram links
    if (url.includes("t.me/") || url.startsWith("tg://")) {
      Linking.openURL(url).catch((err) =>
        console.error("Error opening Telegram:", err)
      );
      return false;
    }

    // Handle Viber links
    if (url.includes("viber.com/") || url.startsWith("viber://")) {
      Linking.openURL(url).catch((err) =>
        console.error("Error opening Viber:", err)
      );
      return false;
    }

    // Handle phone calls
    if (url.startsWith("tel:")) {
      Linking.openURL(url).catch((err) =>
        console.error("Error opening phone:", err)
      );
      return false;
    }

    // Handle email
    if (url.startsWith("mailto:")) {
      Linking.openURL(url).catch((err) =>
        console.error("Error opening email:", err)
      );
      return false;
    }

    // Allow all other URLs to load in WebView
    return true;
  };

  // Cache webpage content
  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "cache" && data.content) {
        await FileSystem.writeAsStringAsync(CACHE_INDEX_FILE, data.content);
        await FileSystem.writeAsStringAsync(
          CACHE_TIMESTAMP_FILE,
          JSON.stringify({ timestamp: Date.now() })
        );
        setCachedContent(data.content);
      }
    } catch (error) {
      console.error("Error caching content:", error);
    }
  };

  // Handle WebView errors
  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn("WebView error:", nativeEvent);

    setHasError(true);
    setErrorMessage(MYANMAR_STRINGS.errors.loadingFailed);

    // Try to load cached content on error
    if (cachedContent) {
      setIsOffline(true);
    }
  };

  // Handle load end
  const handleLoadEnd = () => {
    setIsLoading(false);
    setIsRefreshing(false);
    setHasError(false);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);

    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  // Inject script to cache page content and handle offline
  const injectedJavaScript = `
    (function() {
      // Cache the page content
      window.addEventListener('load', function() {
        const html = document.documentElement.outerHTML;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'cache',
          content: html
        }));
      });

      // Handle offline/online events
      window.addEventListener('online', function() {
        console.log('App is online');
      });

      window.addEventListener('offline', function() {
        console.log('App is offline');
      });

      // Detect if we're offline
      if (!navigator.onLine) {
        document.body.innerHTML = '<div style="padding: 20px; text-align: center; margin-top: 50px; background: #1a1a1a; color: #fff;"><p>အင်တာနက်ချိတ်ဆက်မှုမရှိပါ။ ကျေးဇူးပြု၍ အင်တာနက်ချိတ်ဆက်ပြီး ထပ်မံကြိုးစားပါ။</p></div>';
      }

      true;
    })();
  `;

  return (
    <ScreenContainer
      className="flex-1 bg-background"
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Offline Indicator */}
      {isOffline && (
        <View className="bg-red-600 px-4 py-2 flex-row items-center justify-center">
          <Ionicons name="wifi-off" size={16} color="#fff" />
          <Text className="text-white ml-2 text-sm">
            {MYANMAR_STRINGS.labels.offline}
          </Text>
        </View>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <ScrollView className="flex-1 bg-background">
          <View className="flex-1 items-center justify-center p-6">
            <Ionicons name="alert-circle" size={48} color="#84102d" />
            <Text className="text-foreground text-lg font-semibold mt-4 text-center">
              {errorMessage}
            </Text>
            <Text className="text-muted text-sm mt-2 text-center">
              {MYANMAR_STRINGS.errors.timeoutError}
            </Text>

            <Pressable
              onPress={handleRefresh}
              className="mt-6 bg-primary px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">
                {MYANMAR_STRINGS.labels.retry}
              </Text>
            </Pressable>

            {cachedContent && (
              <Text className="text-muted text-xs mt-4">
                {MYANMAR_STRINGS.messages.emptyList}
              </Text>
            )}
          </View>
        </ScrollView>
      )}

      {/* Loading State */}
      {isLoading && !hasError && (
        <View className="absolute inset-0 flex items-center justify-center bg-background z-50">
          <ActivityIndicator size="large" color="#b5ac8a" />
          <Text className="text-muted mt-4">
            {MYANMAR_STRINGS.labels.loading}
          </Text>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: WEBSITE_URL }}
        style={{ flex: 1 }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={handleLoadEnd}
        onError={handleWebViewError}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onMessage={handleWebViewMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        startInLoadingState={true}
        scalesPageToFit={true}
        renderLoading={() => (
          <View className="flex-1 items-center justify-center bg-background">
            <ActivityIndicator size="large" color="#b5ac8a" />
          </View>
        )}
        originWhitelist={["*"]}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
      />

      {/* Pull to Refresh Hint */}
      {!isLoading && (
        <View className="absolute bottom-4 left-0 right-0 items-center">
          <Text className="text-muted text-xs">
            {MYANMAR_STRINGS.messages.pullToRefresh}
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}
