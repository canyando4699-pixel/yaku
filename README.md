<p align="center">
  <img src="public/yaku-logo.png" alt="Yaku (約) logo" width="220" />
</p>

<h1 align="center">Yaku (約)</h1>

<p align="center">Open-source scheduling — a lightweight alternative to Calendly.</p>

<p align="center">
  <a href="https://github.com/canyando4699-pixel/yaku">GitHub</a>
</p>

**約 (yaku)** means agreement / appointment / a promise kept.

## Preview

### Hero
![Yaku hero — Fuji night with 約 brand lockup](docs/screenshots/hero-2026-08.png)

### Calendar section
![Yaku calendar preview on the landing page](docs/screenshots/calendar-2026-08.png)

### Demo booking flow
![Yaku demo booking — event type, date, and time](docs/screenshots/demo-2026-08.png)

### Host office — schedule board
![Yaku host schedule board with weekly bookings](docs/screenshots/host-schedule.png)

### Host office — availability
![Yaku host availability, buffers, and event types](docs/screenshots/host-availability.png)

### Host office — share link
![Yaku host share booking link](docs/screenshots/host-share.png)

### Sign in
![Yaku local sign-in screen](docs/screenshots/login.png)

## Tagline

**One appointment. No bloat.**

Yaku turns open time into real appointments. Lightweight, open source, self-hostable — a booking link without the lock-in.

## Status

Early MVP (UI default language: **English**; DE / JA also available):

- Landing hero + calendar preview
- Public demo booking link (`/b/demo`) with event types, timezone, and optional weekly series
- Local auth: sign in / sign up (`/login`, `/signup`) — demo account `demo@yaku.app` / `yaku123`
- Host office (`/host`) with Japanese room backgrounds and drone-style room transitions
- Schedule board (week view), booking list, availability settings, share link
- Availability: weekdays, hours, buffers, minimum notice, max/day, event types, series
- Guest manage page: cancel / reschedule + `.ics` download (`/b/demo/m/[bookingId]`)
- Local-first storage in the browser (replaceable with Supabase later)

## Develop

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Security / GitHub

**Do not commit or push:**

- `.env`, `.env.local`, or any real env files
- API keys, database URLs, service-account JSONs
- Private certificates (`*.pem`, `*.key`)

Only `.env.example` with placeholders belongs in the repo. Before every push:

```bash
git status
git diff
```

If unsure: **do not** stage the file.
