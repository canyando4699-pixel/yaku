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
![Yaku calendar preview](docs/screenshots/calendar-2026-08.png)

### Demo booking flow
![Yaku demo booking — date and time](docs/screenshots/demo-2026-08.png)

## Tagline

**One appointment. No bloat.**

Yaku turns open time into real appointments. Lightweight, open source, self-hostable — a booking link without the lock-in.

## Status

Early MVP:

- Public demo booking link (`/b/demo`)
- Weekday availability + configurable duration/hours (`/host` → Availability)
- Booking with name / email (+ `.ics` download)
- Manage page: cancel / reschedule (`/b/demo/m/[bookingId]`)
- Host list with cancel / reschedule (`/host`, localStorage)

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
