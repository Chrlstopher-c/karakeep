import { useEffect, useRef } from "react";

import type { ScreenId } from "./navigation";
import { useNavigation } from "./navigation";

export interface ShortcutHandlers {
  openPalette: () => void;
  openCapture: () => void;
  toggleFollow: () => void;
  escape: () => boolean;
}

const G_TARGETS: Record<string, ScreenId> = {
  d: "decisions",
  s: "sources",
  p: "projects",
  h: "highlights",
};

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null; // cible d'un événement clavier : un élément ou null
  return (
    !!el &&
    (el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.isContentEditable)
  );
}

// Raccourcis globaux du prototype (⌘K, ⌘L/⌘N, ⌘←/→, ⌘/, G puis D/S/P/H, F, /, Échap).
export function useShortcuts(handlers: ShortcutHandlers): void {
  const nav = useNavigation();
  const ref = useRef({ handlers, nav });
  ref.current = { handlers, nav };
  const gAt = useRef(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      const { handlers: h, nav: n } = ref.current;
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      if (mod && k === "k") return prevent(e, h.openPalette);
      if (mod && (k === "l" || k === "n")) return prevent(e, h.openCapture);
      if (mod && e.key === "ArrowLeft") return prevent(e, n.back);
      if (mod && e.key === "ArrowRight") return prevent(e, n.forward);
      if (mod && e.key === "/")
        return prevent(e, () => n.go({ screen: "settings" }));
      if (e.key === "Escape") {
        if (
          !h.escape() &&
          (n.route.screen === "reader" || n.route.screen === "sheet")
        )
          n.back();
        return;
      }
      if (mod || isTyping(e.target)) return;
      if (e.key === "/") return prevent(e, h.openPalette);
      if (Date.now() - gAt.current < 1000 && G_TARGETS[k]) {
        gAt.current = 0;
        return n.go({ screen: G_TARGETS[k] });
      }
      if (k === "g") gAt.current = Date.now();
      else if (k === "f") h.toggleFollow();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function prevent(e: KeyboardEvent, action: () => void): void {
  e.preventDefault();
  action();
}
