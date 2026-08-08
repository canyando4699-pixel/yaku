type IconProps = {
  name:
    | "globe"
    | "chevronDown"
    | "chevronLeft"
    | "chevronRight"
    | "check"
    | "calendar"
    | "clock"
    | "user"
    | "mail"
    | "download"
    | "arrowRight"
    | "list"
    | "x";
  className?: string;
};

const paths: Record<IconProps["name"], React.ReactNode> = {
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronLeft: <path d="M14 6l-6 6 6 6" />,
  chevronRight: <path d="M10 6l6 6-6 6" />,
  check: <path d="M5 12l4 4L19 7" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M4 8l8 6 8-6" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v10" />
      <path d="M8 10l4 4 4-4" />
      <path d="M5 18h14" />
    </>
  ),
  arrowRight: <path d="M5 12h12M13 6l6 6-6 6" />,
  list: (
    <>
      <path d="M8 7h12" />
      <path d="M8 12h12" />
      <path d="M8 17h12" />
      <circle cx="4" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="17" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  x: (
    <>
      <path d="M7 7l10 10" />
      <path d="M17 7L7 17" />
    </>
  ),
};

export function Icon({ name, className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
