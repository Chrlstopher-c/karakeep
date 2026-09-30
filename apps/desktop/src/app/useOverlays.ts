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

// Palette, capture et suivi : ce qu'Échap ferme, dans l'ordre du prototype.
export function useOverlays(
  follow: Follow,
  notify: (text: string, action?: Toast["action"]) => void,
): Overlays {
  const { go } = useNavigation();
  const [palette, setPalette] = useState(false);
  const [capture, setCapture] = useState(false);

  const stopFollow = useCallback(() => {
    const done = follow.stop();
    if (done.length > 0) {
      notify(`Claude a ${summarize(done)}.`, {
        label: "Voir",
        run: () => go({ screen: "claude" }),
      });
    }
  }, [follow, notify, go]);

  const escape = (): boolean => {
    if (palette) return (setPalette(false), true);
    if (capture) return (setCapture(false), true);
    if (follow.following) return (stopFollow(), true);
    return false;
  };

  return {
    palette,
    capture,
    openPalette: useCallback(() => {
      setCapture(false);
      setPalette((p) => !p);
    }, []),
    closePalette: useCallback(() => setPalette(false), []),
    openCapture: useCallback(() => {
      setPalette(false);
      setCapture(true);
    }, []),
    closeCapture: useCallback(() => setCapture(false), []),
    stopFollow,
    toggleFollow: () => (follow.following ? stopFollow() : follow.start()),
    escape,
  };
}
