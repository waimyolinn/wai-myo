import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Set up notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  try {
    // Request notification permissions
    if (Platform.OS === 'android') {
      // Create notification channel for Android
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E91E63',
        bypassDnd: true,
      });
    }

    // Check if notifications are already granted
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permission');
      return null;
    }

    // Get push notification token
    const token = await Notifications.getExpoPushTokenAsync();
    console.log('Push notification token:', token.data);

    // Store token securely
    try {
      await SecureStore.setItemAsync('expoPushToken', token.data);
    } catch (error) {
      console.error('Error storing push token:', error);
    }

    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

export async function setPushNotificationBadge(count: number) {
  try {
    if (Platform.OS === 'ios') {
      // Set badge for iOS
      await Notifications.setBadgeCountAsync(count);
    } else if (Platform.OS === 'android') {
      // For Android, we would need to use native code or a library
      // This is a placeholder for future implementation
      console.log('Setting badge count to', count);
    }
  } catch (error) {
    console.error('Error setting badge:', error);
  }
}

export async function handleNotificationResponse(response: Notifications.NotificationResponse) {
  try {
    const { notification } = response;
    const { data } = notification.request.content;

    // Handle notification data
    console.log('Notification received:', data);

    // You can navigate to a specific screen or perform actions based on the notification data
    if (data.url) {
      // Handle deep linking
      console.log('Opening URL:', data.url);
    }
  } catch (error) {
    console.error('Error handling notification response:', error);
  }
}

export function setupNotificationListeners() {
  // Handle notification when app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received in foreground:', notification);
    // Update badge count
    setPushNotificationBadge(1);
  });

  // Handle notification response (when user taps on notification)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    handleNotificationResponse(response);
  });

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}

export async function sendLocalNotification(title: string, body: string, data?: Record<string, any>) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        badge: 1,
      },
      trigger: { type: 'time', seconds: 1 } as any,
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
}
