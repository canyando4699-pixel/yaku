"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

export type OfficeRoom = "schedule" | "list" | "availability" | "share";

export const OFFICE_FLIGHT_MS = 2200;

const ROOM_BG: Record<OfficeRoom, string> = {
  schedule: "/images/office/office-schedule.png",
  list: "/images/office/office-list.png",
  availability: "/images/office/office-availability.png",
  share: "/images/office/office-share.png",
};

const LOBBY_BG = "/images/office/office-lobby.png";
const CORRIDOR_BG = "/images/office/office-corridor.png";

const ROOM_YAW: Record<OfficeRoom, number> = {
  schedule: 0,
  list: -22,
  availability: 20,
  share: 12,
};

type FlightPhase = "idle" | "lift" | "fly" | "bank" | "approach" | "land";

type OfficeShellProps = {
  room: OfficeRoom;
  walking: boolean;
  children: ReactNode;
  sidebar: ReactNode;
};

export function OfficeShell({
  room,
  walking,
  children,
  sidebar,
}: OfficeShellProps) {
  const [fromRoom, setFromRoom] = useState(room);
  const [toRoom, setToRoom] = useState(room);
  const [phase, setPhase] = useState<FlightPhase>("idle");

  useEffect(() => {
    if (!walking) {
      setFromRoom(room);
      setToRoom(room);
      setPhase("idle");
      return;
    }

    setToRoom(room);
    setPhase("lift");
    const t1 = window.setTimeout(() => setPhase("fly"), 280);
    const t2 = window.setTimeout(() => setPhase("bank"), 900);
    const t3 = window.setTimeout(() => setPhase("approach"), 1450);
    const t4 = window.setTimeout(() => {
      setPhase("land");
      setFromRoom(room);
    }, 1850);
    const t5 = window.setTimeout(() => setPhase("idle"), OFFICE_FLIGHT_MS);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.clearTimeout(t5);
    };
  }, [walking, room]);

  const inFlight = phase !== "idle";
  const showCorridor = phase === "fly" || phase === "bank";
  const showTarget =
    phase === "approach" || phase === "land" || phase === "idle";
  const activeBg = showCorridor
    ? CORRIDOR_BG
    : showTarget
      ? ROOM_BG[toRoom]
      : ROOM_BG[fromRoom];

  const yaw = ROOM_YAW[toRoom];
  const transform = droneTransform(phase, yaw);

  return (
    <div className="office-shell relative flex min-h-full flex-1 overflow-hidden bg-[#050607] text-white [perspective:1400px]">
      <div
        className="pointer-events-none absolute inset-0 origin-center will-change-transform"
        style={{
          transform,
          transition: inFlight
            ? "transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1)"
            : "transform 900ms ease-out",
        }}
      >
        <Image
          key={activeBg}
          src={activeBg}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className={[
            "object-cover object-center",
            phase === "fly" || phase === "bank"
              ? "office-drone-streak"
              : "",
          ].join(" ")}
        />
        {/* depth layers for parallax feel */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${LOBBY_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "screen",
            transform:
              phase === "fly"
                ? "translateZ(80px) scale(1.2)"
                : phase === "bank"
                  ? "translateZ(40px) scale(1.1)"
                  : "translateZ(0) scale(1)",
            transition: "transform 500ms ease-out",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,10,8,0.12)_0%,rgba(5,6,7,0.5)_55%,rgba(5,6,7,0.9)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050607] to-transparent" />
      </div>

      {inFlight ? (
        <div className="pointer-events-none absolute inset-0 z-[5]">
          <div className="office-drone-hud absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c4a35a]/35" />
          <div className="absolute inset-x-0 top-[42%] h-px bg-gradient-to-r from-transparent via-[#c4a35a]/50 to-transparent" />
          <div className="absolute inset-y-0 left-[48%] w-px bg-gradient-to-b from-transparent via-[#c4a35a]/35 to-transparent" />
        </div>
      ) : null}

      <aside className="office-glass relative z-10 hidden w-[200px] shrink-0 flex-col border-r border-white/8 p-3 md:flex">
        {sidebar}
      </aside>

      <div
        className={[
          "relative z-10 flex min-w-0 flex-1 flex-col transition duration-500",
          inFlight ? "pointer-events-none opacity-25 blur-[2px]" : "opacity-100",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

function droneTransform(phase: FlightPhase, yaw: number) {
  switch (phase) {
    case "lift":
      return "translate3d(0, -4%, -80px) rotateX(8deg) scale(1.05)";
    case "fly":
      return "translate3d(0, 2%, -420px) rotateX(2deg) rotateZ(-3deg) scale(1.55)";
    case "bank":
      return `translate3d(${yaw > 0 ? "8%" : yaw < 0 ? "-8%" : "0"}, 1%, -280px) rotateY(${yaw}deg) rotateZ(${yaw * 0.15}deg) scale(1.35)`;
    case "approach":
      return `translate3d(${yaw * 0.15}%, 0, -60px) rotateY(${yaw * 0.35}deg) scale(1.12)`;
    case "land":
      return "translate3d(0, 0, 0) rotateY(0deg) scale(1.02)";
    default:
      return "translate3d(0, 0, 0) scale(1.02)";
  }
}
