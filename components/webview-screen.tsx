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

  const handleSaveImage = async (imageUrl: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "ပုံသိမ်းရန်အတွက် Storage Permission ပေးဖို့ လိုအပ်ပါတယ်ခင်ဗျာ။");
        return;
      }

      const filename = `miba-myitta-${Date.now()}.jpg`;
      const fileUri = FileSystem.cacheDirectory + filename;
      
      const downloadRes = await FileSystem.downloadAsync(imageUrl, fileUri);
      
      if (downloadRes.status === 200) {
        const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);
        await MediaLibrary.createAlbumAsync("Miba Myitta", asset, false);
        Alert.alert("Success", "ပုံကို Gallery ထဲသို့ သိမ်းဆည်းပြီးပါပြီ။");
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Save image error:", error);
      Alert.alert("Error", "ပုံသိမ်းရာတွင် အဆင်မပြေဖြစ်သွားပါသည်။ နောက်တစ်ကြိမ် ပြန်ကြိုးစားကြည့်ပါဦး။");
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
    if (
      !nativeEvent.description.includes("net::ERR_CACHE_MISS") &&
      !nativeEvent.description.includes("net::ERR_INTERNET_DISCONNECTED") &&
      !nativeEvent.description.includes("net::ERR_NAME_NOT_RESOLVED")
    ) {
      setHasError(true);
      setErrorMessage(MYANMAR_STRINGS.errors.loadingFailed);
    } else {
      setIsLoading(false);
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
          if (nativeEvent.statusCode >= 400) {
            console.warn("HTTP error:", nativeEvent.statusCode);
          }
        }}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        startInLoadingState={false} // Disable default loading state
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
