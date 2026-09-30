import type { ReactElement } from "react";

// Tracés du prototype (grille 24, trait 1,8).
export const ICON_PATHS = {
  home: "M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z",
  decisions: "M12 4v16M6 7h12M6 7l-3 6.5a3 3 0 0 0 6 0zM18 7l-3 6.5a3 3 0 0 0 6 0zM8.5 20h7",
  sources: "M6.5 3.5h8l3.5 3.5v13.5h-11.5zM14.5 3.5V7H18M9.5 11.5h5M9.5 15.5h5",
  projects: "M3.5 7a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z",
  highlights: "M14.5 4.5l5 5L10 19H5v-5zM4 21.5h16",
  tags: "M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-6.1 6.1a1.5 1.5 0 0 1-2.1 0zM8 8h.01",
  claude: "M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9",
  settings:
    "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8" +
    "M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8",
  sidebar: "M4 5h16v14H4zM9.5 5v14",
  back: "M15 5l-7 7 7 7",
  forward: "M9 5l7 7-7 7",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6 6 18",
  check: "M5 12.5l4.5 4.5L19 7.5",
  chevronLeft: "M14.5 6l-6 6 6 6",
  chevronDown: "M6 9.5l6 6 6-6",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  note: "M5 4h14v16H5zM8.5 9h7M8.5 13h7M8.5 17h4",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  list: "M4 6h16M4 12h16M4 18h16",
  rows: "M4 7h3M10 7h10M4 12h3M10 12h10M4 17h3M10 17h10",
  sort: "M8 5v14M4.5 15.5 8 19l3.5-3.5M16 19V5M12.5 8.5 16 5l3.5 3.5",
  copy: "M8 8h11v11H8zM5 16V5h11",
} as const;

export type IconName = keyof typeof ICON_PATHS;

export function Icon({
  name,
  size = 18,
  stroke = 1.8,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
}): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-none"
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

// Marque de provenance Claude : astérisque à six branches.
export function ClaudeMark({ size = 10 }: { size?: number }): ReactElement {
  return <Icon name="claude" size={size} stroke={2.4} />;
}
