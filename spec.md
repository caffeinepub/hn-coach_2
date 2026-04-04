# HN Coach

## Current State

The app has a fully working chat system between users and the coach:
- Messages are stored in `chatStore` (Map<Principal, MessageHistory>) in the Motoko backend
- `lastReadTimestamps` map tracks when each user last read their messages
- `markMessagesAsRead()` is called by users when opening chat
- `getLastReadTimestamp(user)` is used by admin to show tick indicators (sent/delivered/read)
- Frontend polls every 5 seconds for new messages on both user and admin sides
- No push notifications exist — no service worker, no VAPID, no subscription management
- Admin client list shows user names but no unread badges
- User side shows no unread count/badge

## Requested Changes (Diff)

### Add
- **Backend**: New `getCoachUnreadCountForUser(user: Principal)` query — counts messages from coach (senderRole == #coach) with timestamp > lastReadTimestamp for that user, so admin can see unread count per client
- **Backend**: New `getUserUnreadCount()` query for the caller — counts messages from coach that the user hasn't read yet
- **Backend**: New `markCoachMessagesAsReadForAdmin()` call — so coach can mark messages as read on their end (track coach's read state per user separately)
- **Frontend**: Service worker (`public/sw.js`) to handle browser push notifications via the Web Notifications API (not server-sent — we use polling to detect new messages and trigger local notifications)
- **Frontend**: `useNotifications` hook — requests browser notification permission on first use, and when polling detects new messages arrived since last check, fires a browser Notification
- **Frontend**: Unread badge on admin client list — each UserListItem shows a red dot/count if there are coach-to-user messages that the user hasn't read (uses getCoachUnreadCountForUser logic derived from polling data)
- **Frontend**: Unread badge for users — on the NavBar or chat header, show badge with count of unread coach messages

### Modify
- **ChatPage.tsx**: On message poll, compare new messages to previous count; if new coach messages arrived and user is not on chat page (document.hidden or page not active), fire a browser notification
- **AdminPage.tsx**: UserListItem — add unread badge. Compute unread by filtering messages for that user where senderRole==#coach and timestamp > lastReadTimestamp
- **useQueries.ts**: Add `useGetUserUnreadCount` and `useGetAllUsersUnreadCounts` hooks
- **NavBar.tsx**: Show unread message badge if there are unread coach messages for current user

### Remove
- Nothing removed

## Implementation Plan

1. Add `getUserUnreadCount()` query to Motoko backend (caller-based, counts unread coach messages for the user)
2. Add `getCoachUnreadCountForUser(user: Principal)` query to Motoko backend (for admin panel to show per-client unread counts)
3. Update `backend.d.ts` and declarations with new methods
4. Add notification permission request and local notification firing logic in ChatPage.tsx (on poll when new messages arrive and tab is not active)
5. Add notification logic in AdminPage.tsx (when new messages arrive from any user and admin is not on that user's conversation)
6. Add unread badge to admin client list (UserListItem in AdminPage.tsx) using lastReadTimestamp vs message timestamps
7. Add unread badge to user NavBar or chat header using getUserUnreadCount
8. Add `useGetUserUnreadCount` hook to useQueries.ts
