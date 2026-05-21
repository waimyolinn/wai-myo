import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const COOKIE_NAME = "session";

// Local notification storage (in-memory for demo)
const notifications: Array<{
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  timestamp: number;
}> = [];

// FCM notification helper
async function sendFCMNotification(
  fcmToken: string,
  title: string,
  body: string,
  imageUrl?: string
) {
  const firebaseProjectId = "mibamyitta-99a71";
  const firebaseApiKey = process.env.FIREBASE_API_KEY;

  if (!firebaseApiKey) {
    console.warn("[FCM] Firebase API key not configured");
    return false;
  }

  try {
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${firebaseProjectId}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseApiKey}`,
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: {
              title,
              body,
              imageUrl,
            },
            data: {
              timestamp: new Date().toISOString(),
              source: "telegram",
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[FCM] Failed to send notification:", error);
      return false;
    }

    console.log("[FCM] Notification sent successfully");
    return true;
  } catch (error) {
    console.error("[FCM] Error sending notification:", error);
    return false;
  }
}

// Store local notification
function storeLocalNotification(
  title: string,
  body: string,
  imageUrl?: string
) {
  const notification = {
    id: Date.now().toString(),
    title,
    body,
    imageUrl,
    timestamp: Date.now(),
  };
  notifications.push(notification);
  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications.shift();
  }
  return notification;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Telegram webhook handler
  telegram: router({
    webhook: publicProcedure
      .input(
        z.object({
          fcmToken: z.string().optional(),
          title: z.string(),
          body: z.string(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        console.log("[Telegram] Webhook received:", input);

        // Store local notification
        const localNotif = storeLocalNotification(
          input.title,
          input.body,
          input.imageUrl
        );

        // If FCM token is provided, send FCM notification
        if (input.fcmToken) {
          const sent = await sendFCMNotification(
            input.fcmToken,
            input.title,
            input.body,
            input.imageUrl
          );
          return { success: sent, notificationId: localNotif.id };
        }

        return { success: true, notificationId: localNotif.id };
      }),

    // Get all notifications
    getNotifications: publicProcedure.query(() => {
      return notifications.sort((a, b) => b.timestamp - a.timestamp);
    }),

    // Get latest notification
    getLatest: publicProcedure.query(() => {
      return notifications.length > 0
        ? notifications[notifications.length - 1]
        : null;
    }),

    // Clear all notifications
    clearNotifications: publicProcedure.mutation(() => {
      notifications.length = 0;
      return { success: true };
    }),
  }),

  // Vercel webhook handler (for image uploads)
  vercel: router({
    webhook: publicProcedure
      .input(
        z.object({
          title: z.string(),
          body: z.string(),
          imageUrl: z.string().optional(),
          fcmToken: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        console.log("[Vercel] Webhook received:", input);

        // Store local notification
        const localNotif = storeLocalNotification(
          input.title,
          input.body,
          input.imageUrl
        );

        // If FCM token is provided, send FCM notification
        if (input.fcmToken) {
          const sent = await sendFCMNotification(
            input.fcmToken,
            input.title,
            input.body,
            input.imageUrl
          );
          return { success: sent, notificationId: localNotif.id };
        }

        return { success: true, notificationId: localNotif.id };
      }),
  }),

  // Notifications router
  notifications: router({
    getAll: publicProcedure.query(() => {
      return notifications.sort((a, b) => b.timestamp - a.timestamp);
    }),

    getLatest: publicProcedure.query(() => {
      return notifications.length > 0
        ? notifications[notifications.length - 1]
        : null;
    }),

    clear: publicProcedure.mutation(() => {
      notifications.length = 0;
      return { success: true };
    }),

    // Send test notification
    sendTest: publicProcedure
      .input(
        z.object({
          title: z.string().default("Test Notification"),
          body: z.string().default("This is a test notification"),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        return storeLocalNotification(input.title, input.body, input.imageUrl);
      }),
  }),
});

export type AppRouter = typeof appRouter;
