# HN Coach — Admin Panel + File Sharing

## Current State
- 6-page app: Login, Signup, Home, Profile, Chat, Book Appointment
- Dark navy + orange theme (#0B2232 background, #FF6A00 accent)
- Backend: Motoko with UserProfile, Message (text only), Booking, Authorization (role-based)
- Chat: user sends text to coach, polls every 5s, coach replies via admin
- Blob-storage component already included for avatar uploads
- Backend already has `sendMessageToUser`, `getUserMessageHistory`, `getAllProfiles`, `getAllBookingsForDate`, admin checks via AccessControl

## Requested Changes (Diff)

### Add
- Coach Admin Panel (`/admin` route) — password-protected with hardcoded password "hncoach2024" (localStorage session)
  - List all users who have messaged (show name/principal from profile if available)
  - Select a user to open their conversation thread
  - Reply to selected user's messages (calls `sendMessageToUser`)
  - View all bookings section — list all bookings with user info, date/time, status; allow cancel/reschedule
  - Cancel booking from admin panel (calls `cancelBooking` on behalf — or new admin cancel endpoint)
- File/image sharing in Chat (both user and coach sides)
  - User can attach image or PDF in chat — upload via blob-storage, send message with blobId reference
  - Coach sees file messages in admin panel — images display inline, PDFs as clickable links
  - Message type extended: `messageType` field (#text, #image, #file), `blobId` optional field
- Admin panel shows file attachments inline in conversation view

### Modify
- Backend `Message` type: add optional `blobId: ?Text` and `messageType: MessageType` (#text | #image | #file)
- `sendMessageToCoach` accepts optional blobId and messageType
- `sendMessageToUser` accepts optional blobId and messageType
- Backend: add `getAllUsers` query for admin to list principals who have messages
- Backend: add `adminCancelBooking` that allows admin to cancel any booking by id
- Backend: add `getAllBookings` for admin to get all bookings across all users
- ChatPage: add file attachment button (image + PDF), upload to blob storage, show file previews in message bubbles
- App.tsx: add `/admin` route

### Remove
- Nothing removed

## Implementation Plan
1. Update Motoko backend:
   - Add `MessageType` variant (#text | #image | #file)
   - Add optional `blobId` field to `Message`
   - Update `sendMessageToCoach` and `sendMessageToUser` to accept blobId + messageType
   - Add `getAllUsers` (admin only) — returns all principals with message history
   - Add `getAllBookings` (admin only) — returns all bookings
   - Add `adminCancelBooking(bookingId: Nat)` (admin only)
2. Frontend:
   - Add `AdminPage.tsx` with password gate ("hncoach2024" in localStorage)
     - Users list panel on left
     - Conversation view on right for selected user
     - Reply input at bottom
     - Bookings tab: table of all bookings with cancel action
   - Update `ChatPage.tsx`:
     - Add paperclip/attach button next to send
     - File picker accepts image/* and application/pdf
     - Upload file to blob-storage, get blobId, send message with blobId + type
     - Render image messages as inline img, PDF messages as file link
   - Update `useQueries.ts` with new hooks
   - Update `App.tsx` to add `/admin` route (no ProtectedRoute — uses password gate)
