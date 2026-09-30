import { useEffect, useRef, useState } from "react";

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null; // cible d'un événement clavier : un élément ou null
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

// J / K pour parcourir, Entrée pour ouvrir.
export function useListKeyboard(count: number, onOpen: (index: number) => void): number {
  const [focus, setFocus] = useState(-1);
  const ref = useRef({ count, onOpen, focus });
  ref.current = { count, onOpen, focus };

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      const { count: n, onOpen: open, focus: f } = ref.current;
      if (!n) return;
      if (e.key === "j" || e.key === "k") {
        const next = f < 0 ? 0 : Math.max(0, Math.min(n - 1, f + (e.key === "j" ? 1 : -1)));
        setFocus(next);
        document.querySelector(`[data-source-index="${next}"]`)?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" && f >= 0) {
        open(f);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return focus;
}
