import { useCallback, useMemo } from "react";

import { useNavigation } from "../app/navigation";
import { useDecisionBookmarks } from "./useBookmarks";

export interface OpenBookmark {
  isDecision: (bookmarkId: string) => boolean;
  open: (bookmarkId: string, highlightId?: string) => void;
}

// Une fiche de décision s'ouvre en fiche, tout le reste dans le lecteur.
export function useOpenBookmark(): OpenBookmark {
  const { go } = useNavigation();
  const decisions = useDecisionBookmarks();
  const ids = useMemo(
    () => new Set(decisions.bookmarks.map((b) => b.id)),
    [decisions.bookmarks],
  );
  const isDecision = useCallback((id: string) => ids.has(id), [ids]);
  const open = useCallback(
    (bookmarkId: string, highlightId?: string) =>
      isDecision(bookmarkId)
        ? go({ screen: "sheet", bookmarkId })
        : go({ screen: "reader", bookmarkId, highlightId }),
    [go, isDecision],
  );
  return { isDecision, open };
}
