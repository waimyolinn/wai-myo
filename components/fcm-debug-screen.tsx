import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { setStringAsync, getStringAsync } from 'expo-clipboard';
import * as Notifications from 'expo-notifications';
import { ScreenContainer } from './screen-container';

export function FCMDebugScreen() {
  const [fcmToken, setFcmToken] = useState<string>('Loading...');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const getFCMToken = async () => {
      try {
        // Get push notification token
        const { data: token } = await Notifications.getExpoPushTokenAsync({
          projectId: 'mibamyitta-app',
        });
        setFcmToken(token || 'Token not available');
      } catch (error) {
        setFcmToken(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    getFCMToken();
  }, []);

  const copyToClipboard = async () => {
    try {
      await setStringAsync(fcmToken);
      setCopied(true);
      Alert.alert('Success', 'FCM token copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy token');
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          {/* Header */}
          <View className="mb-4">
            <Text className="text-2xl font-bold text-foreground mb-2">
              FCM Debug Info
            </Text>
            <Text className="text-sm text-muted">
              Use this token to test push notifications from Firebase Console
            </Text>
          </View>

          {/* Token Display Box */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-sm font-semibold text-muted mb-2">FCM Token:</Text>
            <Text 
              className="text-xs text-foreground font-mono bg-background p-3 rounded border border-border"
              selectable
            >
              {fcmToken}
            </Text>
          </View>

          {/* Copy Button */}
          <TouchableOpacity
            onPress={copyToClipboard}
            className={`py-3 px-4 rounded-lg items-center ${
              copied ? 'bg-success' : 'bg-primary'
            }`}
          >
            <Text className="text-background font-semibold">
              {copied ? '✓ Copied!' : 'Copy Token'}
            </Text>
          </TouchableOpacity>

          {/* Instructions */}
          <View className="bg-surface rounded-lg p-4 border border-border mt-4">
            <Text className="text-sm font-semibold text-foreground mb-2">
              How to Test:
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              1. Copy the FCM token above{'\n'}
              2. Go to Firebase Console{'\n'}
              3. Cloud Messaging → Send your first message{'\n'}
              4. Paste token in "Add FCM registration token"{'\n'}
              5. Click "Test"
            </Text>
          </View>

          {/* App Info */}
          <View className="bg-surface rounded-lg p-4 border border-border mt-4">
            <Text className="text-xs text-muted">
              Package: com.mibamyitta.wm{'\n'}
              Project: mibamyitta-99a71
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
