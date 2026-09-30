import { useCallback, useState } from "react";

import { summarize } from "../claude/describeActivity";
import type { Follow } from "../claude/useFollow";
import type { Toast } from "./Toasts";
import { useNavigation } from "./navigation";

export interface Overlays {
  palette: boolean;
  capture: boolean;
  openPalette: () => void;
  closePalette: () => void;
  openCapture: () => void;
  closeCapture: () => void;
  stopFollow: () => void;
  toggleFollow: () => void;
  escape: () => boolean;
}

// Arrêter le suivi n'arrête pas Claude : on résume ce qu'il a fait pendant ce temps.
function useStopFollow(follow: Follow, notify: (text: string, action?: Toast["action"]) => void): () => void {
  const { go } = useNavigation();
  return useCallback(() => {
    const done = follow.stop();
    if (done.length === 0) return;
    notify(`Pendant le suivi, Claude : ${summarize(done)}.`, { label: "Voir", run: () => go({ screen: "claude" }) });
  }, [follow, notify, go]);
}

// Palette, capture et suivi : ce qu'Échap ferme, dans l'ordre du prototype.
export function useOverlays(follow: Follow, notify: (text: string, action?: Toast["action"]) => void): Overlays {
  const [palette, setPalette] = useState(false);
  const [capture, setCapture] = useState(false);
  const stopFollow = useStopFollow(follow, notify);
  const openPalette = useCallback(() => {
    setCapture(false);
    setPalette((p) => !p);
  }, []);
  const openCapture = useCallback(() => {
    setPalette(false);
    setCapture(true);
  }, []);
  const escape = (): boolean => {
    if (palette) return (setPalette(false), true);
    if (capture) return (setCapture(false), true);
    if (follow.following) return (stopFollow(), true);
    return false;
  };
  return {
    palette,
    capture,
    openPalette,
    openCapture,
    stopFollow,
    escape,
    closePalette: useCallback(() => setPalette(false), []),
    closeCapture: useCallback(() => setCapture(false), []),
    toggleFollow: () => (follow.following ? stopFollow() : follow.start()),
  };
}
