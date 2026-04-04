# HN Coach

## Current State
Full-stack coaching app with Internet Identity auth, user profiles (mandatory completion), chat, appointment booking, and admin panel. Profile completion redirects to home after save. Booking slots run 6am–9pm hourly (16 slots). Sessions displayed as "60-minute" throughout.

## Requested Changes (Diff)

### Add
- 10pm (22:00) slot to booking -- extend to 17 hourly slots (6am–10pm)

### Modify
- Backend `timeSlots` constant: add `"22:00"` to the array
- BookPage header subtitle: "60-minute" → "40-minute", add "6am – 10pm" range
- BookPage booking confirmation card: "60-minute" → "40-minute"
- BookPage upcoming sessions list: "60-min" → "40-min"

### Remove
- Nothing removed

## Implementation Plan
1. Update `src/backend/main.mo` timeSlots array to include `"22:00"`
2. Update `src/frontend/src/pages/BookPage.tsx` -- replace all "60-min(ute)" with "40-min(ute)" and update subtitle to show "6am – 10pm"
3. Profile auto-redirect to home on save is already implemented -- no change needed
