import Image from "next/image";
import { BookingCalendar } from "@/components/BookingCalendar";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(225,6,0,0.08)_0%,transparent_42%),radial-gradient(ellipse_at_10%_80%,rgba(17,17,17,0.05)_0%,transparent_50%)]"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <Image
            src="/yaku-logo.png"
            alt="Yaku"
            width={40}
            height={52}
            className="h-10 w-auto"
            priority
          />
          <p className="font-display text-xl tracking-wide text-ink">Yaku</p>
        </div>
        <p className="text-sm text-muted">Open Source</p>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-12 px-6 pb-20 pt-6 md:flex-row md:items-center md:justify-between md:gap-16 md:px-10">
        <div className="max-w-xl text-center md:text-left">
          <p className="text-sm font-medium tracking-[0.2em] text-accent uppercase">
            約 — a promise
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] text-ink md:text-7xl">
            One appointment.
            <br />
            No bloat.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted md:text-xl">
            Yaku turns open time into real appointments. Lightweight, open
            source, self-hostable — a booking link without the lock-in.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <span className="inline-flex items-center border border-line bg-panel px-4 py-2 text-sm text-ink">
              MVP in progress
            </span>
            <span className="inline-flex items-center px-2 py-2 text-sm text-muted">
              Booking link · Availability · Dashboard
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <BookingCalendar />
        </div>
      </main>
    </div>
  );
}
