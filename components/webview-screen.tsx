import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, ScrollView, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { ScreenContainer } from './screen-container';

const WEBSITE_URL = 'https://mibamyitta.shop';
const CACHE_DIR = FileSystem.documentDirectory + 'website_cache/';
const CACHE_INDEX_FILE = CACHE_DIR + 'index.html';

interface WebViewScreenProps {
  onNotificationReceived?: (notification: any) => void;
}

export function WebViewScreen({ onNotificationReceived }: WebViewScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [cachedContent, setCachedContent] = useState<string | null>(null);

  // Initialize cache directory
  useEffect(() => {
    const initializeCache = async () => {
      try {
        const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
        }
      } catch (error) {
        console.error('Error initializing cache:', error);
      }
    };

    initializeCache();
  }, []);

  // Load cached content on mount
  useEffect(() => {
    const loadCachedContent = async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(CACHE_INDEX_FILE);
        if (fileInfo.exists) {
          const content = await FileSystem.readAsStringAsync(CACHE_INDEX_FILE);
          setCachedContent(content);
        }
      } catch (error) {
        console.error('Error loading cached content:', error);
      }
    };

    loadCachedContent();
  }, []);

  // Handle WebView navigation
  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = request.url;

    // Handle Telegram links
    if (url.includes('t.me/') || url.startsWith('tg://')) {
      Linking.openURL(url).catch((err) => console.error('Error opening Telegram:', err));
      return false;
    }

    // Handle Viber links
    if (url.includes('viber.com/') || url.startsWith('viber://')) {
      Linking.openURL(url).catch((err) => console.error('Error opening Viber:', err));
      return false;
    }

    // Handle phone calls
    if (url.startsWith('tel:')) {
      Linking.openURL(url).catch((err) => console.error('Error opening phone:', err));
      return false;
    }

    // Handle email
    if (url.startsWith('mailto:')) {
      Linking.openURL(url).catch((err) => console.error('Error opening email:', err));
      return false;
    }

    // Allow all other URLs to load in WebView
    return true;
  };

  // Cache webpage content
  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'cache' && data.content) {
        await FileSystem.writeAsStringAsync(CACHE_INDEX_FILE, data.content);
        setCachedContent(data.content);
      }
    } catch (error) {
      console.error('Error caching content:', error);
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
        document.body.innerHTML = '<div style="padding: 20px; text-align: center; margin-top: 50px;"><p>အင်တာနက်ချိတ်ဆက်မှုမရှိပါ။ ကျေးဇူးပြု၍ အင်တာနက်ချိတ်ဆက်ပြီး ထပ်မံကြိုးစားပါ။</p></div>';
      }

      true;
    })();
  `;

  return (
    <ScreenContainer className="flex-1 bg-background" edges={['top', 'left', 'right', 'bottom']}>
      {isLoading && (
        <View className="absolute inset-0 flex items-center justify-center bg-background z-50">
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      )}

      <WebView
        source={{ uri: WEBSITE_URL }}
        style={{ flex: 1 }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onMessage={handleWebViewMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        startInLoadingState={true}
        renderLoading={() => (
          <View className="flex-1 items-center justify-center bg-background">
            <ActivityIndicator size="large" color="#0a7ea4" />
          </View>
        )}
      />
    </ScreenContainer>
  );
}
