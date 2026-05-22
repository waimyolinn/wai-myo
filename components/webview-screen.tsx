import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  Pressable,
  ScrollView,
  Linking,
  RefreshControl,
} from "react-native";
import { WebView } from "react-native-webview";
import { ScreenContainer } from "./screen-container";
import { MYANMAR_STRINGS } from "@/lib/myanmar-strings";
import { Ionicons } from "@expo/vector-icons";

const WEBSITE_URL = "https://mibamyitta.shop";

interface WebViewScreenProps {
  onNotificationReceived?: (notification: any) => void;
}

export function WebViewScreen({ onNotificationReceived }: WebViewScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const webViewRef = React.useRef<WebView>(null);

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

  // Handle WebView errors
  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn("WebView error:", nativeEvent);

    // Only show error if it's not a connectivity issue that might be handled by cache
    if (!nativeEvent.description.includes("net::ERR_CACHE_MISS")) {
      setHasError(true);
      setErrorMessage(MYANMAR_STRINGS.errors.loadingFailed);
    }
  };

  // Handle load end
  const handleLoadEnd = () => {
    setIsLoading(false);
    setIsRefreshing(false);
    setHasError(false);
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <ScreenContainer
      className="flex-1 bg-background"
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Error State */}
      {hasError && !isLoading && (
        <ScrollView 
          className="flex-1 bg-background"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          <View className="flex-1 items-center justify-center p-6 mt-20">
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
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        // Use LOAD_CACHE_ELSE_NETWORK for better offline support
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        startInLoadingState={true}
        scalesPageToFit={true}
        originWhitelist={["*"]}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
        // Enable pull to refresh inside WebView if supported
        pullToRefreshEnabled={true}
      />
    </ScreenContainer>
  );
}
