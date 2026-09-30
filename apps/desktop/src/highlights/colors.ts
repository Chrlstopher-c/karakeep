import type { ZHighlightColor } from "@karakeep/shared/types/highlights";

export const HIGHLIGHT_COLORS: ZHighlightColor[] = ["yellow", "green", "red", "blue"];

export const HIGHLIGHT_META: Record<ZHighlightColor, { label: string; use: string; key: string }> = {
  yellow: { label: "Passage clé", use: "définition", key: "1" },
  green: { label: "Pour, acquis", use: "décisions", key: "2" },
  red: { label: "Risque, contre", use: "décisions", key: "3" },
  blue: { label: "À creuser", use: "question ouverte", key: "4" },
};

export function solidColor(color: ZHighlightColor): string {
  return `var(--hl-${color})`;
}

export function tintColor(color: ZHighlightColor): string {
  return `var(--hl-${color}-bg)`;
}
