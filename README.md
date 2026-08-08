# Yaku (約)

Open-source scheduling — a lightweight alternative to Calendly.

**約 (yaku)** means agreement / appointment / a promise kept.

## Tagline

**One appointment. No bloat.**

Yaku turns open time into real appointments. Lightweight, open source, self-hostable — a booking link without the lock-in.

## Status

Early MVP. Planned:

- Public booking link
- Availability (weekdays, duration)
- Booking with name / email
- Simple dashboard

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
