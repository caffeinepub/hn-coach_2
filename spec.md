# HN Coach

## Current State
App has points history collapsible on ChatPage and AdminPage using ScrollArea with max-h-48/max-h-40, but no overflow-hidden on parent containers so content spills outside the card border. Browser push notifications use `new Notification()` directly which Chrome silently ignores without a Service Worker. No PWA manifest or service worker exists.

## Requested Changes (Diff)

### Add
- `public/sw.js` -- Service worker that handles notification display via `showNotification()` and message-based triggers from main thread
- `public/manifest.json` -- PWA manifest with app name, icons, theme color for Chrome install prompt
- PWA install prompt banner/button in NavBar (or login page) for Chrome users
- Service worker registration in main.tsx
- Notification utility that uses service worker's `showNotification()` instead of `new Notification()`

### Modify
- `index.html` -- Add `<link rel="manifest">`, theme-color meta, apple-mobile-web-app meta tags
- `ChatPage.tsx` -- Fix points history overflow: add `overflow-hidden` to parent div wrapping ScrollArea; make scrollbar always visible with custom CSS
- `AdminPage.tsx` -- Same overflow fix for points history panel
- `ChatPage.tsx` notification code -- Replace `new Notification()` with service worker `showNotification()` via registered SW
- `AdminPage.tsx` notification code -- Same service worker notification fix
- `main.tsx` -- Register service worker on app init
- `NavBar.tsx` -- Add PWA install prompt button that appears when Chrome detects the app is installable

### Remove
- Nothing

## Implementation Plan
1. Create `sw.js` and `manifest.json` in public/ (done)
2. Update `index.html` with manifest link and meta tags (done)
3. Update `main.tsx` to register service worker
4. Create notification utility function using SW showNotification
5. Fix ChatPage points history overflow with overflow-hidden + visible scrollbar
6. Fix AdminPage points history overflow with overflow-hidden + visible scrollbar  
7. Update ChatPage notification code to use SW-based notifications
8. Update AdminPage notification code to use SW-based notifications
9. Add PWA install prompt to NavBar
10. Validate and deploy
