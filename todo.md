# မိဘမေတ္တာ အထည်ဆိုင် App - TODO (Production v2)

## Phase 1: Theme & Configuration
- [x] Dark theme colors (#84102d primary, #b5ac8a accent)
- [x] Fullscreen mode (no URL bar)
- [x] Portrait orientation lock
- [x] Update app.config.ts

## Phase 2: Offline Caching System
- [x] Network-first caching strategy
- [x] Cache last 50 images
- [x] Max cache size 100MB
- [x] Auto-clear cache after 7 days
- [x] Offline indicator UI
- [x] Cache service module
- [x] WebView integration with offline support
- [x] Error handling with retry button

## Phase 3: Image Gallery Viewer
- [x] Fullscreen vertical swipe gallery (component created)
- [x] Double tap zoom in/out
- [x] Swipe down to dismiss
- [x] Share image button
- [x] Back button closes viewer only
- [x] Image preloading

## Phase 4: Deep Linking
- [x] Viber app integration (phone number)
- [x] Telegram app integration (username)
- [x] Deep link handlers (service created)
- [x] WebView integration for links

## Phase 5: Push Notifications (FCM)
- [x] FCM integration with google-services.json
- [x] Silent notifications when app open
- [x] Click notification opens relevant post
- [x] Notification badge

## Phase 6: Performance & UX
- [x] Pull to refresh (swipe down)
- [x] Skeleton loading (placeholder cards)
- [x] Lazy image loading
- [x] 10 second timeout
- [x] Retry button on error

## Phase 7: Error Handling
- [x] Myanmar language error messages (strings created)
- [x] User-friendly error UI
- [x] Connection status indicator
- [x] Error logging

## Phase 8: Build & Delivery
- [ ] Final testing
- [ ] APK build
- [ ] Checkpoint creation
- [ ] APK delivery
