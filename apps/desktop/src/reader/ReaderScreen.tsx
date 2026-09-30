import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";
import type { ZBookmark } from "@karakeep/shared/types/bookmarks";
import type { ZHighlightColor } from "@karakeep/shared/types/highlights";

import { useNavigation } from "../app/navigation";
import { useProvenance } from "../claude/useAgentActivity";
import { markElements } from "./highlightDom";
import { ReaderBody } from "./ReaderBody";
import { ReaderHeader } from "./ReaderHeader";
import { ReaderPanel } from "./ReaderPanel";
import type { ReaderMode } from "./ReaderTopBar";
import { ReaderTopBar } from "./ReaderTopBar";
import { useReaderHighlights } from "./useReaderHighlights";
import type { ToolbarTarget } from "./useReaderSelection";
import { useReaderSelection } from "./useReaderSelection";
import { useReadingPosition } from "./useReadingPosition";

const NARROW_PX = 1240;

function modesOf(bookmark: ZBookmark): ReaderMode[] {
  const c = bookmark.content;
  if (c.type !== "link") return ["article"];
  const modes: ReaderMode[] = ["article"];
  if (c.screenshotAssetId) modes.push("capture");
  if (c.fullPageArchiveAssetId ?? c.precrawledArchiveAssetId)
    modes.push("archive");
  return modes;
}

function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(window.innerWidth < NARROW_PX);
  useEffect(() => {
    const onResize = (): void => setNarrow(window.innerWidth < NARROW_PX);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return narrow;
}

function focusHighlight(root: HTMLElement | null, id: string): void {
  const marks = root ? markElements(root, id) : [];
  marks[0]?.scrollIntoView({ block: "center", behavior: "smooth" });
  marks.forEach((m) => m.classList.add("sv-hl-focus"));
  setTimeout(
    () => marks.forEach((m) => m.classList.remove("sv-hl-focus")),
    1600,
  );
}

export function ReaderScreen({
  bookmarkId,
  highlightId,
}: {
  bookmarkId: string;
  highlightId?: string;
}): ReactElement {
  const trpc = useTRPC();
  const { back } = useNavigation();
  const bookmark = useQuery(
    trpc.bookmarks.getBookmark.queryOptions({
      bookmarkId,
      includeContent: true,
    }),
  );
  const provenance = useProvenance();
  const hl = useReaderHighlights(bookmarkId);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<ReaderMode>("article");
  const [panelOpen, setPanelOpen] = useState(false);
  const narrow = useNarrow();
  const isLink = bookmark.data?.content.type === "link";
  const percent = useReadingPosition(
    bookmarkId,
    contentRef,
    isLink && mode === "article",
  );

  const apply = (
    target: ToolbarTarget,
    color: ZHighlightColor,
    note: string | null,
  ): void => {
    if (target.kind === "selection") hl.create(target.selection, color, note);
    else
      hl.update(
        target.id,
        color,
        note ?? hl.list.find((h) => h.id === target.id)?.note ?? null,
      );
    window.getSelection()?.removeAllRanges();
    selection.setTarget(null);
  };
  const selection = useReaderSelection((target, color) =>
    apply(target, color, null),
  );

  useEffect(() => {
    if (highlightId && hl.list.length)
      focusHighlight(contentRef.current, highlightId);
  }, [highlightId, hl.list.length]);

  if (!bookmark.data)
    return (
      <ReaderTopBar
        backLabel="Retour"
        onBack={back}
        mode="article"
        modes={[]}
        onMode={setMode}
        percent={0}
        url={null}
      />
    );
  const b = bookmark.data;
  const showPanel = !narrow || panelOpen;
  return (
    <div>
      <ReaderTopBar
        backLabel="Retour"
        onBack={back}
        mode={mode}
        modes={modesOf(b)}
        onMode={setMode}
        percent={percent}
        url={b.content.type === "link" ? b.content.url : null}
        panelToggle={
          narrow
            ? {
                label: panelOpen
                  ? "Masquer"
                  : `Surlignages · ${hl.list.length}`,
                onToggle: () => setPanelOpen((o) => !o),
              }
            : undefined
        }
      />
      <div className="flex items-start">
        <div className="flex min-w-0 flex-1 justify-center px-12 pb-[180px] pt-12">
          <article className="relative isolate w-full max-w-[700px]">
            <ReaderHeader
              bookmark={b}
              byClaude={provenance.bookmarkIds.has(b.id)}
            />
            <ReaderBody
              bookmark={b}
              mode={mode}
              contentRef={contentRef}
              hl={hl}
              target={selection.target}
              setTarget={selection.setTarget}
              applyTarget={apply}
              readOnly={false}
            />
          </article>
        </div>
        {showPanel && isLink && (
          <ReaderPanel
            bookmark={b}
            highlights={hl.list}
            byClaude={hl.byClaude}
            onGoHighlight={(id) => focusHighlight(contentRef.current, id)}
          />
        )}
      </div>
    </div>
  );
}
