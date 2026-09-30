import type { KeyboardEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import { useNavigation } from "../app/navigation";
import { useThemeControl } from "../app/useTheme";
import { buildCommands, matchCommands } from "./commands";
import type { PaletteItem } from "./usePaletteResults";
import { usePaletteResults } from "./usePaletteResults";

export interface PaletteState {
  query: string;
  setQuery: (q: string) => void;
  sel: number;
  setSel: (i: number) => void;
  groups: { label: string; items: PaletteItem[] }[];
  count: number;
  run: (item: PaletteItem | undefined) => void;
  onKey: (e: KeyboardEvent) => void;
  listRef: RefObject<HTMLDivElement | null>;
}

function handleKey(
  e: KeyboardEvent,
  count: number,
  sel: number,
  setSel: (i: number) => void,
  runSelected: () => void,
): void {
  const moves: Record<string, () => void> = {
    ArrowDown: () => setSel(Math.min(count - 1, sel + 1)),
    ArrowUp: () => setSel(Math.max(0, sel - 1)),
    Enter: runSelected,
  };
  if (!moves[e.key]) return;
  e.preventDefault();
  moves[e.key]();
}

// Requête, sélection au clavier et exécution de l'élément choisi.
export function usePalette(onClose: () => void, onCapture: () => void, onToggleFollow: () => void): PaletteState {
  const { go } = useNavigation();
  const theme = useThemeControl();
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const ctx = {
    go,
    theme: theme.preference,
    setTheme: theme.setPreference,
    toggleFollow: onToggleFollow,
    openCapture: onCapture,
  };
  const groups = usePaletteResults(query, matchCommands(buildCommands(ctx), query));
  const flat = groups.flatMap((g) => g.items);
  const run = (item: PaletteItem | undefined): void => {
    if (!item) return;
    onClose();
    item.run();
  };
  useEffect(() => {
    setSel(0);
  }, [query]);
  useEffect(() => {
    listRef.current?.querySelector("[data-pal-selected]")?.scrollIntoView({ block: "nearest" });
  }, [sel]);
  const onKey = (e: KeyboardEvent): void => handleKey(e, flat.length, sel, setSel, () => run(flat[sel]));
  return { query, setQuery, sel, setSel, groups, count: flat.length, run, onKey, listRef };
}
