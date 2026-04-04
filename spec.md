# HN Coach - Points System

## Current State
- Admin panel has Messages tab (with user list + conversation panel) and Bookings tab
- Users can chat with coach via ChatPage
- Backend has user profiles, messaging, bookings, and read receipt tracking
- No points system exists

## Requested Changes (Diff)

### Add
- **Backend**: Points store per user (Map<Principal, Nat>)
- **Backend**: `givePoints(user, points, reason)` - admin gives arbitrary points to a user
- **Backend**: `getUserPoints(user)` - returns total points for a given user (no auth, called by admin or from user chat)
- **Backend**: `getCallerPoints()` - returns the authenticated caller's own points (user-facing)
- **Backend**: Three special point award functions (or handled via `givePoints` with reason enum):
  - Weight image upload reward: 20 pts
  - Footsteps: 30 pts
  - Daily Bonus: 50 pts
- **Admin Panel - ConversationPanel**: Below the user header in the conversation panel, add a "Give Points" section with three preset buttons:
  - Weight Image (20 pts)
  - Footsteps (30 pts)
  - Daily Bonus (50 pts)
  - Plus a manual input for custom points with a "Give" button
  - Show current total points for selected user in this section
- **ChatPage (user-facing)**: Display a points summary card/badge in the chat header area showing:
  - Total points count prominently
  - Breakdown: Weight Images earned, Footsteps earned, Daily Bonuses earned (via point history)
  - Styled with the existing dark navy/orange theme

### Modify
- **Backend**: Add points-related types and storage
- **AdminPage**: `ConversationPanel` - add points award UI below the conversation header
- **ChatPage**: Add points display widget in the header or sidebar of the chat view
- **useQueries.ts**: Add hooks for `givePoints`, `getUserPoints`, `getCallerPoints`

### Remove
- Nothing removed

## Implementation Plan
1. Add `PointRecord` type with fields: `points: Nat`, `reason: PointReason`, `timestamp: Int`
2. Add `PointReason` variant: `#weightImage`, `#footsteps`, `#dailyBonus`, `#custom`
3. Add `pointsStore: Map<Principal, List<PointRecord>>` to backend
4. Add `givePoints(user: Principal, points: Nat, reason: PointReason)` - no auth (admin protected by frontend password)
5. Add `getUserPoints(user: Principal): Nat` - sums all point records for the user
6. Add `getCallerPoints(): Nat` - user-facing, returns caller's total
7. Add `getCallerPointHistory(): [PointRecord]` - user-facing, returns full history for display
8. In admin ConversationPanel, add a points panel above/beside chat with:
   - Current total display
   - 3 preset buttons (Weight Image 20, Footsteps 30, Daily Bonus 50)
   - Custom points input
9. In ChatPage, add a points card in the header showing total and category breakdown
10. Add useQueries hooks: `useGivePoints`, `useGetUserPoints`, `useGetCallerPoints`, `useGetCallerPointHistory`
