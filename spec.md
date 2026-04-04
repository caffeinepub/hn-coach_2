# HN Coach

## Current State
- Chat page shows a `PointsSummaryCard` with total points + category breakdown badges (Weight ×N, Footsteps ×N, Daily ×N)
- A `BonusPointsGuide` collapsible card shows streak milestones (7/14/21/28 days) and image bonuses, but there is no live tracker for the user's actual current streak
- Admin panel chat header has three preset point buttons: 🏋️ +20, 👣 +30, ⭐ +50 (plus a custom input)
- Backend has no streak tracking; no `recordActivity` or `getCallerStreak` functions

## Requested Changes (Diff)

### Add
- **Backend**: `streakStore` (Map<Principal, [Int]> of active day timestamps), `recordActivity` shared func (idempotent, marks today UTC as active for caller), `getCallerStreak` query func (returns `{currentStreak: Nat; nextMilestone: Nat; daysToNext: Nat; lastActiveDate: Text}`)
- **Frontend ChatPage**: `StreakTrackerCard` component -- shows current streak (fire emoji + day count), a progress bar toward the next bonus milestone (7→14→21→28 days), and calls `recordActivity` on mount

### Modify
- **Frontend ChatPage `PointsSummaryCard`**: Remove the Weight ×N, Footsteps ×N, Daily ×N breakdown badges. Keep total points display only.
- **Frontend AdminPage `PointsPanel`**: Remove the three preset buttons (🏋️ +20, 👣 +30, ⭐ +50). Keep the custom points input + Give button only.

### Remove
- The three preset point buttons from admin chat panel
- The category count badges from user chat points card

## Implementation Plan
1. Add `streakStore` to backend and two new query/update functions: `recordActivity` and `getCallerStreak`
2. Expose new functions in `backend.d.ts` and declarations
3. Add `useRecordActivity` mutation and `useGetCallerStreak` query hooks in `useQueries.ts`
4. Build `StreakTrackerCard` in `ChatPage.tsx`, place it below `PointsSummaryCard`
5. Remove category breakdown badges from `PointsSummaryCard` in `ChatPage.tsx`
6. Remove three preset buttons from `AdminPage.tsx` `PointsPanel` component
