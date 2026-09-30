import { useEffect, useRef, useState } from "react";

import type { ZHighlightColor } from "@karakeep/shared/types/highlights";

import { HIGHLIGHT_COLORS } from "../highlights/colors";
import type { ArticleSelection } from "./ReaderArticle";

export type ToolbarTarget =
  | { kind: "selection"; selection: ArticleSelection }
  | { kind: "highlight"; id: string; x: number; y: number };

// Barre de surlignage : sélection en cours ou surlignage cliqué ; 1 à 4 applique
// une couleur, Échap ferme la barre avant de quitter le lecteur.
export function useReaderSelection(
  apply: (target: ToolbarTarget, color: ZHighlightColor) => void,
) {
  const [target, setTarget] = useState<ToolbarTarget | null>(null);
  const ref = useRef({ target, apply });
  ref.current = { target, apply };

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      const current = ref.current.target;
      if (!current) return;
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        window.getSelection()?.removeAllRanges();
        setTarget(null);
        return;
      }
      const index = "1234".indexOf(e.key);
      const typing = (e.target as HTMLElement | null)?.tagName === "INPUT"; // cible clavier : élément ou null
      if (index >= 0 && !typing) {
        e.preventDefault();
        e.stopImmediatePropagation();
        ref.current.apply(current, HIGHLIGHT_COLORS[index]);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return { target, setTarget };
}
