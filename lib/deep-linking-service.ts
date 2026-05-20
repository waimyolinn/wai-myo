/**
 * Deep Linking Service
 * Handle Viber and Telegram app links
 */

import * as Linking from "expo-linking";
import { Platform } from "react-native";

/**
 * Open Viber with phone number
 */
export async function openViber(phoneNumber: string): Promise<void> {
  try {
    // Remove any non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, "");

    // Viber URI scheme
    const viberUrl = `viber://contact?number=%2B${cleanNumber}`;

    const supported = await Linking.canOpenURL(viberUrl);

    if (supported) {
      await Linking.openURL(viberUrl);
    } else {
      // Fallback to Viber web or app store
      if (Platform.OS === "ios") {
        await Linking.openURL("https://apps.apple.com/app/viber-messenger/id382617930");
      } else {
        await Linking.openURL(
          "https://play.google.com/store/apps/details?id=com.viber.voip"
        );
      }
    }
  } catch (error) {
    console.error("Error opening Viber:", error);
  }
}

/**
 * Open Telegram with username or user ID
 */
export async function openTelegram(usernameOrId: string): Promise<void> {
  try {
    // Remove @ if present
    const cleanUsername = usernameOrId.replace(/^@/, "");

    // Telegram URI scheme
    const telegramUrl = `tg://user?username=${cleanUsername}`;

    const supported = await Linking.canOpenURL(telegramUrl);

    if (supported) {
      await Linking.openURL(telegramUrl);
    } else {
      // Fallback to Telegram web
      await Linking.openURL(`https://t.me/${cleanUsername}`);
    }
  } catch (error) {
    console.error("Error opening Telegram:", error);
  }
}

/**
 * Open WhatsApp with phone number
 */
export async function openWhatsApp(phoneNumber: string): Promise<void> {
  try {
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    const whatsappUrl = `whatsapp://send?phone=+${cleanNumber}`;

    const supported = await Linking.canOpenURL(whatsappUrl);

    if (supported) {
      await Linking.openURL(whatsappUrl);
    } else {
      // Fallback to WhatsApp web
      await Linking.openURL(`https://wa.me/${cleanNumber}`);
    }
  } catch (error) {
    console.error("Error opening WhatsApp:", error);
  }
}

/**
 * Open phone dialer
 */
export async function callPhoneNumber(phoneNumber: string): Promise<void> {
  try {
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    await Linking.openURL(`tel:${cleanNumber}`);
  } catch (error) {
    console.error("Error calling phone number:", error);
  }
}

/**
 * Open SMS
 */
export async function openSMS(phoneNumber: string, message?: string): Promise<void> {
  try {
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    const smsUrl = message
      ? `sms:${cleanNumber}?body=${encodeURIComponent(message)}`
      : `sms:${cleanNumber}`;

    await Linking.openURL(smsUrl);
  } catch (error) {
    console.error("Error opening SMS:", error);
  }
}

/**
 * Open email
 */
export async function openEmail(email: string, subject?: string, body?: string): Promise<void> {
  try {
    let mailtoUrl = `mailto:${email}`;

    if (subject || body) {
      const params = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      mailtoUrl += `?${params.join("&")}`;
    }

    await Linking.openURL(mailtoUrl);
  } catch (error) {
    console.error("Error opening email:", error);
  }
}

/**
 * Parse and open contact link
 * Supports: viber://+95..., tg://user?username=..., tel:..., mailto:...
 */
export async function openContactLink(url: string): Promise<void> {
  try {
    if (url.startsWith("viber://")) {
      const phoneMatch = url.match(/\+?[\d]+/);
      if (phoneMatch) {
        await openViber(phoneMatch[0]);
      }
    } else if (url.startsWith("tg://") || url.includes("t.me/")) {
      const usernameMatch = url.match(/(?:username=|t\.me\/)([a-zA-Z0-9_]+)/);
      if (usernameMatch) {
        await openTelegram(usernameMatch[1]);
      }
    } else if (url.startsWith("tel:")) {
      const phoneMatch = url.match(/[\d+]+/);
      if (phoneMatch) {
        await callPhoneNumber(phoneMatch[0]);
      }
    } else if (url.startsWith("mailto:")) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(url);
    }
  } catch (error) {
    console.error("Error opening contact link:", error);
  }
}
