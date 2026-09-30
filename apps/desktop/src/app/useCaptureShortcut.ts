import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

import { log } from "../shared/log";

// Raccourci global (Ctrl+Maj+Espace, même app en arrière-plan) : l'app native
// remonte la fenêtre et émet « savoir://capture ».
export function useCaptureShortcut(open: () => void): void {
  useEffect(() => {
    if (!("__TAURI_INTERNALS__" in window)) return;
    let unlisten: (() => void) | undefined;
    listen("savoir://capture", () => open())
      .then((fn) => {
        unlisten = fn;
      })
      .catch((cause: unknown) => log.warn(`raccourci global indisponible : ${String(cause)}`));
    return () => unlisten?.();
  }, [open]);
}
