# Yaku — Next features

Prioritized next steps from the local-first MVP toward a real online demo and backend.

**Status:** Saved for later — not continuing this today.

## Current state

UI and host office are strong; auth and data are **browser-only** (`localStorage`). Public demo booking exists at `/b/demo` (homepage CTA removed). Google/Apple sign-in and calendar are stubs.

## Priority

### 1. Make it online-ready (highest impact)

- **Supabase**: Auth (email or OAuth), host profile, bookings, availability
- Per-host booking link `/b/[slug]` (not only `demo`)
- Guest bookings write to the cloud — host sees them across devices
- Manage links can stay token-based where useful

### 2. Notifications

- **Resend** (or similar): confirmation to guest + notify host
- Later: reminder ~24h before (cron / Edge Function)

### 3. Calendar integrations (menu item already exists)

- Google Calendar sync (busy / create)
- Apple/CalDAV or ICS feed as a lighter path
- Real OAuth instead of stub buttons

### 4. Host product polish (works without cloud)

- **Overview**: today/week counts, next few appointments
- **Settings**: account, display name, language, clearer logout
- **Guests**: contacts from past bookings
- Day view next to week; stronger empty board state

### 5. Later / nice-to-have

- Teams / multiple hosts, custom branding, payments, waitlist, Zoom link fields

## Portfolio / training order

1. Vercel deploy + README that separates “local demo” vs “production”
2. Supabase Auth + Bookings (one real end-to-end path)
3. Email confirmation
4. Overview / Settings in the office
5. Google Calendar

## Deliberately not first

- More menu stubs without a backend
- More office art / drone polish
- Re-enable “Try demo booking” before cloud bookings exist
