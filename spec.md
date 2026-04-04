# HN Coach

## Current State
- Backend: `PointRecord` has `{ points: Nat; reason: PointReason; timestamp: Int }` -- no `remark` field.
- Backend: `givePoints(user, points, reason)` -- no remark parameter.
- Backend: `getCallerPointHistory()` returns full history for the user (caller).
- Backend: No admin-facing `getUserPointHistory(user)` function.
- Frontend (ChatPage): Shows total points summary card, streak tracker, and bonus points guide. No today's points card, no history list.
- Frontend (AdminPage): PointsBar shows total points and a points input form with category selector. No remark field, no history view.

## Requested Changes (Diff)

### Add
- `remark: Text` field to `PointRecord` type in Motoko backend.
- `remark` parameter to `givePoints(user, points, reason, remark)` backend function.
- `getUserPointHistory(user: Principal)` admin-facing backend query (no auth check, protected by frontend password).
- **Today's Points Card** on `ChatPage`: A separate badge/card showing total points earned today (sum of all PointRecords where timestamp is within current calendar day).
- **Points History List** on `ChatPage`: A scrollable list below (or near) the points summary showing each PointRecord with date, category label, amount, and remark.
- **Remark text input** in AdminPage PointsBar when awarding points: a text field for the coach to type the activity/reason remark.
- **Points History section** in AdminPage per selected client: scrollable list of that client's point records (date, category, amount, remark), fetched via `getUserPointHistory`.
- When coach awards points, also send a chat message to the user as a system bubble: "You earned {points} pts — {Category}: {remark}". This calls `sendMessageToUser` with a special formatted message.

### Modify
- `givePoints` frontend call in AdminPage must pass the new `remark` parameter.
- `PointRecord` TypeScript interface to include `remark: string`.
- `getCallerPointHistory` on ChatPage to use the updated PointRecord with remark.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `PointRecord` type in `main.mo` to add `remark: Text`.
2. Update `givePoints` function signature in `main.mo` to accept `remark: Text` and store it.
3. Add `getUserPointHistory(user: Principal)` admin query function in `main.mo`.
4. Regenerate frontend bindings (`backend.d.ts`) via Motoko code generation.
5. In `ChatPage.tsx`:
   a. Add "Today's Points" card: compute today's total by filtering `getCallerPointHistory()` records by today's date.
   b. Add "Points History" collapsible/scrollable section listing all records with date, category, points, remark.
6. In `AdminPage.tsx`:
   a. Add remark text input to the points award form in PointsBar.
   b. After awarding points, also call `sendMessageToUser` with the formatted notification bubble.
   c. Add points history section per client showing their history from `getUserPointHistory`.
