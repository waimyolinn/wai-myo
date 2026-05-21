import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from './screen-container';
import { trpc } from '@/lib/trpc';

interface Notification {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  timestamp: number;
}

export function NotificationDisplay() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Get all notifications
  const { data: allNotifications } = trpc.notifications.getAll.useQuery(undefined, {
    refetchInterval: 2000, // Refetch every 2 seconds
  });

  // Clear notifications
  const clearMutation = trpc.notifications.clear.useMutation();

  // Send test notification
  const testMutation = trpc.notifications.sendTest.useMutation();

  useEffect(() => {
    if (allNotifications) {
      setNotifications(allNotifications);
      setLoading(false);
    }
  }, [allNotifications]);

  const handleClear = async () => {
    Alert.alert('Clear Notifications', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Clear',
        onPress: async () => {
          await clearMutation.mutateAsync();
          setNotifications([]);
        },
      },
    ]);
  };

  const handleSendTest = async () => {
    await testMutation.mutateAsync({
      title: 'Test Notification',
      body: 'This is a test notification from the app',
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          {/* Header */}
          <View className="mb-4">
            <Text className="text-2xl font-bold text-foreground mb-2">
              Notifications
            </Text>
            <Text className="text-sm text-muted">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleSendTest}
              className="flex-1 bg-primary py-3 px-4 rounded-lg items-center"
            >
              <Text className="text-background font-semibold">Send Test</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClear}
              className="flex-1 bg-error py-3 px-4 rounded-lg items-center"
            >
              <Text className="text-background font-semibold">Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Notifications List */}
          {loading ? (
            <View className="bg-surface rounded-lg p-6 items-center">
              <Text className="text-muted">Loading notifications...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View className="bg-surface rounded-lg p-6 items-center">
              <Text className="text-muted">No notifications yet</Text>
            </View>
          ) : (
            <View className="gap-3">
              {notifications.map((notif) => (
                <View
                  key={notif.id}
                  className="bg-surface rounded-lg p-4 border border-border"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-lg font-semibold text-foreground flex-1">
                      {notif.title}
                    </Text>
                    <Text className="text-xs text-muted ml-2">
                      {formatTime(notif.timestamp)}
                    </Text>
                  </View>
                  <Text className="text-sm text-muted mb-2">{notif.body}</Text>
                  {notif.imageUrl && (
                    <Text className="text-xs text-primary">
                      📷 {notif.imageUrl.substring(0, 50)}...
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Info Box */}
          <View className="bg-surface rounded-lg p-4 border border-border mt-4">
            <Text className="text-sm font-semibold text-foreground mb-2">
              How it works:
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              1. Telegram channel gets new image{'\n'}
              2. Vercel webhook triggers{'\n'}
              3. Backend sends notification{'\n'}
              4. Notification appears here
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
