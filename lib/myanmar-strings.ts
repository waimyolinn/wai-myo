/**
 * Myanmar Language Strings
 * Error messages, UI text, and utility strings in Myanmar language
 */

export const MYANMAR_STRINGS = {
  // Error Messages
  errors: {
    networkError: "အင်တာနက်ချိတ်ဆက်မှု ပျက်သွားပါတယ်",
    loadingFailed: "စာမျက်နှာ ဖွင့်နိုင်ခြင်း မအောင်မြင်ပါ",
    timeoutError: "အချိန်ကုန်ဆုံးသွားပါတယ်။ ထပ်မံ ကြိုးစားပါ",
    serverError: "ဆာဗာ အမှားအယွင်း ရှိပါတယ်",
    noConnection: "အင်တာနက် ချိတ်ဆက်မှု မရှိပါ",
    cacheEmpty: "သိမ်းဆည်းထားတဲ့ ဒေတာ မရှိပါ",
    imageLoadFailed: "ပုံ ဖွင့်နိုင်ခြင်း မအောင်မြင်ပါ",
    permissionDenied: "ခွင့်ပြုချက် မရရှိပါ",
  },

  // UI Labels
  labels: {
    retry: "ထပ်မံ ကြိုးစားပါ",
    cancel: "ပယ်ဖျက်ပါ",
    ok: "အိုကေ",
    close: "ပိတ်ပါ",
    loading: "စာမျက်နှာ ဖွင့်နေပါတယ်...",
    offline: "အင်တာနက်မရှိ",
    online: "အင်တာနက်ရှိ",
    refresh: "ပြန်လည်ရယူပါ",
    share: "မျှဝေပါ",
    back: "ပြန်သွားပါ",
    next: "နောက်သို့",
    previous: "အရှေ့သို့",
    more: "နောက်ထပ်",
    search: "ရှာဖွေပါ",
    filter: "စစ်ထုတ်ပါ",
    sort: "စီစဉ်ပါ",
  },

  // Messages
  messages: {
    pullToRefresh: "ပြန်လည်ရယူရန် ဆွဲပါ",
    releaseToRefresh: "ပြန်လည်ရယူရန် လွှတ်ပါ",
    refreshing: "ပြန်လည်ရယူနေပါတယ်...",
    noMoreItems: "နောက်ထပ် အရာ မရှိပါ",
    loadingMore: "နောက်ထပ် ဖွင့်နေပါတယ်...",
    emptyList: "စာရင်း အလွတ်ဖြစ်နေပါတယ်",
    imageSaved: "ပုံ သိမ်းဆည်းပြီးပါပြီ",
    imageCopied: "ပုံ ကူးယူပြီးပါပြီ",
    linkCopied: "လင့်ခ် ကူးယူပြီးပါပြီ",
    sharedSuccessfully: "မျှဝေပြီးပါပြီ",
  },

  // Contact Actions
  contact: {
    callViber: "Viber မှ ခေါ်ဆိုပါ",
    callTelegram: "Telegram မှ ဆက်သွယ်ပါ",
    callWhatsApp: "WhatsApp မှ ဆက်သွယ်ပါ",
    sendSMS: "SMS ပို့ပါ",
    sendEmail: "အီမေးလ် ပို့ပါ",
    callPhone: "ဖုန်းခေါ်ဆိုပါ",
  },

  // Notifications
  notifications: {
    newMessage: "သစ်တစ်ခု ရောက်ရှိပါတယ်",
    newProduct: "ထုတ်ကုန်သစ်",
    orderConfirmed: "အော်ဒါ အတည်ပြုပြီးပါပြီ",
    orderShipped: "အော်ဒါ ပို့ဆောင်ပြီးပါပြီ",
    orderDelivered: "အော်ဒါ ရောက်ရှိပြီးပါပြီ",
  },

  // Placeholders
  placeholders: {
    searchProducts: "ထုတ်ကုန် ရှာဖွေပါ",
    enterPhoneNumber: "ဖုန်းနံပါတ် ထည့်သွင်းပါ",
    enterEmail: "အီမေးလ် ထည့်သွင်းပါ",
    enterMessage: "စာသားထည့်သွင်းပါ",
  },

  // Time Strings
  time: {
    justNow: "အခုလေယ",
    minutesAgo: (n: number) => `${n} မိနစ် အရှေ့`,
    hoursAgo: (n: number) => `${n} နာရီ အရှေ့`,
    daysAgo: (n: number) => `${n} ရက် အရှေ့`,
    yesterday: "မနေ့က",
    today: "ယနေ့",
    tomorrow: "မနက်ဖြန်",
  },

  // Size Strings
  size: {
    bytes: "B",
    kilobytes: "KB",
    megabytes: "MB",
    gigabytes: "GB",
  },

  // Validation
  validation: {
    required: "ဤအကွက်သည် လိုအပ်ပါသည်",
    invalidEmail: "အီမေးလ် လိပ်စာ မှားနေပါတယ်",
    invalidPhone: "ဖုန်းနံပါတ် မှားနေပါတယ်",
    passwordTooShort: "စကားဝှက် အတိုအကျဉ်းလွန်းပါတယ်",
    passwordMismatch: "စကားဝှက် မကိုက်ညီပါ",
  },
};

/**
 * Get error message in Myanmar
 */
export function getErrorMessage(errorType: string, fallback?: string): string {
  const key = errorType as keyof typeof MYANMAR_STRINGS.errors;
  return MYANMAR_STRINGS.errors[key] || fallback || "အမှားအယွင်း ရှိပါတယ်";
}

/**
 * Get label in Myanmar
 */
export function getLabel(labelType: string, fallback?: string): string {
  const key = labelType as keyof typeof MYANMAR_STRINGS.labels;
  return MYANMAR_STRINGS.labels[key] || fallback || labelType;
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Format time ago in Myanmar
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return MYANMAR_STRINGS.time.justNow;
  } else if (minutes < 60) {
    return MYANMAR_STRINGS.time.minutesAgo(minutes);
  } else if (hours < 24) {
    return MYANMAR_STRINGS.time.hoursAgo(hours);
  } else if (days < 7) {
    return MYANMAR_STRINGS.time.daysAgo(days);
  } else {
    const date = new Date(timestamp);
    return date.toLocaleDateString("my-MM");
  }
}
