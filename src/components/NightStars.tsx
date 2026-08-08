"use client";

type Star = {
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
};

/** Subtle star field in the upper sky */
const STARS: Star[] = [
  { left: "8%", top: "10%", size: 1.5, delay: "0s", duration: "3.6s", opacity: 0.7 },
  { left: "14%", top: "18%", size: 1.2, delay: "0.4s", duration: "4.2s", opacity: 0.5 },
  { left: "22%", top: "8%", size: 2, delay: "1.1s", duration: "3.8s", opacity: 0.75 },
  { left: "31%", top: "14%", size: 1.2, delay: "0.2s", duration: "4.4s", opacity: 0.45 },
  { left: "38%", top: "6%", size: 1.5, delay: "1.8s", duration: "3.9s", opacity: 0.6 },
  { left: "55%", top: "9%", size: 1.5, delay: "2.2s", duration: "3.5s", opacity: 0.65 },
  { left: "63%", top: "16%", size: 1.2, delay: "0.9s", duration: "4.6s", opacity: 0.4 },
  { left: "72%", top: "7%", size: 2, delay: "1.4s", duration: "4s", opacity: 0.7 },
  { left: "78%", top: "13%", size: 1.2, delay: "2.6s", duration: "4.1s", opacity: 0.5 },
  { left: "86%", top: "10%", size: 1.5, delay: "0.5s", duration: "3.7s", opacity: 0.55 },
  { left: "18%", top: "5%", size: 2.2, delay: "1.0s", duration: "5s", opacity: 0.8 },
  { left: "50%", top: "4%", size: 1.2, delay: "2.8s", duration: "4.2s", opacity: 0.45 },
  { left: "92%", top: "18%", size: 1.5, delay: "1.7s", duration: "3.8s", opacity: 0.55 },
  { left: "5%", top: "22%", size: 1.2, delay: "2.1s", duration: "4.8s", opacity: 0.35 },
  { left: "84%", top: "22%", size: 1.5, delay: "0.8s", duration: "3.9s", opacity: 0.5 },
];

export function NightStars() {
  return (
    <div
      aria-hidden
      className="yaku-stars pointer-events-none absolute inset-0 z-[1] overflow-hidden"
    >
      {STARS.map((star, index) => (
        <span
          key={index}
          className="yaku-star absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            boxShadow: `0 0 ${star.size * 2.2}px ${star.size}px rgba(255,250,230,0.45)`,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  );
}
