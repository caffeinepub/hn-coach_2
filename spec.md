# HN Coach

## Current State
Admin panel at `/admin` is password-protected and shows chat messages, bookings, and points management. After login via Internet Identity was made optional (homepage loads directly without login), the admin panel started showing empty data. All backend functions used by admin (`getAllUsers`, `getAllBookings`, `getUserMessageHistory`, `givePoints`, etc.) are public with no auth checks -- they work with anonymous actors.

The root cause: `useActor` creates an anonymous actor when there's no identity, but admin panel queries use `enabled: !!actor && !actorFetching`. The `actorFetching` flag can remain true during certain render cycles, blocking all queries from ever executing. Additionally, the admin panel itself uses `useActor` which triggers an Internet Identity re-initialization even though the admin panel doesn't need user authentication.

## Requested Changes (Diff)

### Add
- A dedicated `useAnonymousActor` hook for the admin panel that creates an anonymous actor directly without depending on `useInternetIdentity` at all
- This hook should use a simple `useMemo` or ref-based approach with no authentication dependencies

### Modify
- All admin-specific queries in `useQueries.ts` (`useGetAllUsers`, `useGetAllBookings`, `useGetUserMessageHistoryAdmin`, `useGetUserProfile`, `useGetUserPoints`, `useGetUserPointHistory`, `useGetCoachUnreadCount`, `useGetLastReadTimestamp`, `useMarkCoachReadForUser`, `useSendMessageToUser`, `useGivePoints`, `useAdminCancelBooking`) should accept an optional `actor` param OR the `AdminPage.tsx` should pass actors directly to avoid coupling to `useInternetIdentity`
- `AdminPage.tsx`: Replace all `useActor()` calls with a direct anonymous actor approach; the PointsBar, ConversationPanel, MessagesTab, BookingsTab, and UserListItem components all currently call hooks that use `useActor` internally. These should all work with an anonymous actor created fresh on admin page mount.

### Remove
- Nothing -- all existing features stay intact

## Implementation Plan
1. Create `src/frontend/src/hooks/useAdminActor.ts` -- a hook that creates an anonymous actor ONCE on mount using a ref, without any Internet Identity dependency. Returns `{ actor, isReady }` where isReady becomes true as soon as the actor is created (within milliseconds).
2. Create admin-specific query hooks in `useQueries.ts` OR pass the actor directly to components. The simplest approach: add a new `useAdminActor` hook and update each admin query hook to accept an explicit actor parameter, bypassing `useActor` entirely.
3. In `AdminPage.tsx`, call `useAdminActor()` once at the top of `AdminPanel` and pass the actor down via props to `MessagesTab`, `BookingsTab`, `PointsBar`, `ConversationPanel`, `UserListItem`.
4. Create admin-specific query functions (not hooks) that take an actor directly, or update the existing admin hooks to accept an actor param. This avoids any dependency on `useInternetIdentity`.
5. Validate the build passes.
