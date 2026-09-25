import React from "react";

export type IconName =
  | "home"
  | "search"
  | "shopping-bag"
  | "cart"
  | "heart"
  | "star"
  | "user"
  | "bell"
  | "check"
  | "menu"
  | "arrow-right"
  | "arrow-left"
  | "plus"
  | "minus"
  | "mail"
  | "phone"
  | "calendar"
  | "clock"
  | "map-pin"
  | "delivery-truck"
  | "credit-card"
  | "shield-check"
  | "settings"
  | "filter"
  | "bookmark"
  | "camera"
  | "leaf"
  | "sun-light"
  | "gift"
  | "palette";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  strokeWidth?: number;
  className?: string;
}

const iconPaths: Record<IconName, (sw: number) => React.ReactNode> = {
  home: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5v11a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-11z" />,
  search: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" />,
  "shopping-bag": (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />,
  cart: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />,
  heart: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
  star: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  user: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />,
  bell: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />,
  check: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />,
  menu: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />,
  "arrow-right": (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />,
  "arrow-left": (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />,
  plus: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />,
  minus: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />,
  mail: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" />,
  phone: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />,
  calendar: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18" />,
  clock: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2" />,
  "map-pin": (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z" />,
  "delivery-truck": (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm13 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />,
  "credit-card": (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M1 4h22v16H1zM1 10h22" />,
  "shield-check": (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" />,
  settings: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />,
  filter: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
  bookmark: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />,
  camera: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z" />,
  leaf: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.5 21 2c-.5 4-1 5.5-2.1 11.2A7 7 0 0111 20zM2 22l9-9" />,
  "sun-light": (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 17a5 5 0 100-10 5 5 0 000 10z" />,
  gift: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z" />,
  palette: (sw) => <path strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.49 2 2 6.49 2 12c0 4.97 3.63 9.07 8.35 9.87.55.09 1-.35 1-.91 0-.25-.09-.49-.24-.67-.5-.61-.79-1.39-.79-2.29 0-1.66 1.34-3 3-3h1.36c4.05 0 7.32-3.27 7.32-7.32C22 5.06 17.52 2 12 2z" />,
};

export const AgoraIcon: React.FC<IconProps> = ({
  name,
  size = 20,
  strokeWidth = 1.8,
  className = "",
  ...props
}) => {
  const renderPath = iconPaths[name];
  if (!renderPath) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      {renderPath(strokeWidth)}
    </svg>
  );
};

export default AgoraIcon;
