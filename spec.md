# HN Coach App

## Current State
New project — no existing application files.

## Requested Changes (Diff)

### Add
- Authentication: Login and Signup pages with form validation
- User Profile page: editable fields (name, age, WhatsApp number, email, weight, height, target/goal) plus uploadable avatar image
- Homepage (post-login): two action cards — "Chat with Coach" and "Book Appointment"
- Chat page: messaging UI with send/receive bubbles, timestamps, and chat history stored in backend
- Book Appointment page: calendar view to select date, list of 40-minute time slots, booking confirmation, upcoming bookings list
- Top navigation bar: HN Coach logo/brand, profile icon, logout button
- Backend storage for: user profiles, chat messages, appointment bookings

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- User profile actor: store name, age, WhatsApp, email, weight, height, target/goal, avatar blob reference
- Chat messages actor: store messages per user (userId, text, timestamp, sender role: user/coach)
- Appointments actor: store bookings per user (userId, date, timeSlot, status: booked/cancelled)
- Available time slots generator: return 40-minute slots for a given date (e.g. 9:00, 9:40, 10:20 ... 17:00)
- Authorization integration: login/signup with identity-based access
- Blob storage integration: avatar image upload/retrieve

### Frontend (React + TypeScript + Tailwind)
- Auth pages: Login and Signup with form inputs and error handling
- Route protection: redirect unauthenticated users to login
- Profile page: form with all profile fields, avatar uploader
- Homepage: two large action cards with icons
- Chat page: scrollable message thread, input bar with send button, live updates
- Appointments page: calendar date picker, available time slot grid, confirm booking button, upcoming bookings section
- Navbar component: logo, profile avatar, logout
- Responsive layout for mobile and desktop
