import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  Pressable,
  ScrollView,
  Linking,
  RefreshControl,
  Platform,
  Alert,
  ToastAndroid,
} from "react-native";
import { WebView } from "react-native-webview";
import { ScreenContainer } from "./screen-container";
import { MYANMAR_STRINGS } from "@/lib/myanmar-strings";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

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

  // Handle messages from WebView (Website)
  const onMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === "SAVE_IMAGE" && data.url) {
        handleSaveImage(data.url);
      }
    } catch (error) {
      console.error("Message error:", error);
    }
  };

  const handleSaveImage = async (imageSource: string) => {
    try {
      // 1. Check/Request permissions quietly
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "ပုံသိမ်းရန်အတွက် Storage Permission ပေးဖို့ လိုအပ်ပါတယ်ခင်ဗျာ။");
        return;
      }

      // Show a small toast for starting download (Android only)
      if (Platform.OS === 'android') {
        ToastAndroid.show("သိမ်းဆည်းနေပါသည်...", ToastAndroid.SHORT);
      }

      const filename = `miba-myitta-${Date.now()}.jpg`;
      const fileUri = ((FileSystem as any).cacheDirectory || "") + filename;
      
      let localUri = "";

      // 2. Check if source is base64 or URL
      if (imageSource.startsWith("data:image")) {
        const base64Data = imageSource.split("base64,")[1];
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: (FileSystem as any).EncodingType.Base64,
        });
        localUri = fileUri;
      } else {
        const downloadRes = await FileSystem.downloadAsync(imageSource, fileUri);
        if (downloadRes.status === 200) {
          localUri = downloadRes.uri;
        } else {
          throw new Error(`Download failed with status ${downloadRes.status}`);
        }
      }

      // 3. Save to Media Library
      if (localUri) {
        try {
          const asset = await MediaLibrary.createAssetAsync(localUri);
          
          // Check if album exists, if not create it
          const album = await MediaLibrary.getAlbumAsync("MibaMyitta");
          if (album === null) {
            await MediaLibrary.createAlbumAsync("MibaMyitta", asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
          
          // Success feedback using Toast instead of Alert
          if (Platform.OS === 'android') {
            ToastAndroid.show("ပုံကို Gallery (MibaMyitta album) ထဲသို့ သိမ်းဆည်းပြီးပါပြီ။", ToastAndroid.LONG);
          }
        } catch (saveError) {
          console.error("MediaLibrary save error:", saveError);
          // Fallback to simple save if album creation fails
          await MediaLibrary.saveToLibraryAsync(localUri);
          if (Platform.OS === 'android') {
            ToastAndroid.show("ပုံကို Gallery ထဲသို့ သိမ်းဆည်းပြီးပါပြီ။", ToastAndroid.LONG);
          }
        }
        
        // Clean up
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      }
    } catch (error) {
      console.error("Save image error:", error);
      if (Platform.OS === 'android') {
        ToastAndroid.show("ပုံသိမ်း၍ မရပါ၊ နောက်တစ်ကြိမ် ပြန်ကြိုးစားပါ။", ToastAndroid.SHORT);
      }
    }
  };

  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = request.url;
    if (url.includes("t.me/") || url.startsWith("tg://")) {
      Linking.openURL(url).catch((err) => console.error("Error opening Telegram:", err));
      return false;
    }
    if (url.includes("viber.com/") || url.startsWith("viber://")) {
      Linking.openURL(url).catch((err) => console.error("Error opening Viber:", err));
      return false;
    }
    if (url.startsWith("tel:")) {
      Linking.openURL(url).catch((err) => console.error("Error opening phone:", err));
      return false;
    }
    if (url.startsWith("mailto:")) {
      Linking.openURL(url).catch((err) => console.error("Error opening email:", err));
      return false;
    }
    return true;
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    
    // Silence common offline errors because our Service Worker and LOAD_CACHE_ELSE_NETWORK will handle them
    const isOfflineError = 
      nativeEvent.description?.includes("net::ERR_INTERNET_DISCONNECTED") ||
      nativeEvent.description?.includes("net::ERR_NAME_NOT_RESOLVED") ||
      nativeEvent.description?.includes("net::ERR_CACHE_MISS") ||
      nativeEvent.description?.includes("net::ERR_CONNECTION_REFUSED");

    if (!isOfflineError) {
      setHasError(true);
      setErrorMessage(MYANMAR_STRINGS.errors.loadingFailed);
    } else {
      // If it's an offline error, we don't show the error screen 
      // because the WebView will try to show the cached version
      setIsLoading(false);
      console.log("Offline mode detected in WebView, suppressing error screen.");
    }
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    setIsRefreshing(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setHasError(false);
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

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: WEBSITE_URL }}
        style={{ flex: 1 }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={handleLoadEnd}
        onError={handleWebViewError}
        onMessage={onMessage}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          // Only show error for critical failures, ignore 404s or other non-breaking issues when offline
          if (nativeEvent.statusCode >= 500) {
            console.warn("HTTP error:", nativeEvent.statusCode);
          }
        }}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        startInLoadingState={false}
        scalesPageToFit={true}
        originWhitelist={["*"]}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
        pullToRefreshEnabled={true}
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 MibaMyittaApp/1.0"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
      />
    </ScreenContainer>
  );
}
