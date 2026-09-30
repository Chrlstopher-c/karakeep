import type { ReactElement, RefObject } from "react";

import type { ZBookmark } from "@karakeep/shared/types/bookmarks";

import { useAssetUrl } from "../shared/useAssetUrl";
import { openExternal } from "../shared/openExternal";
import { HighlightToolbar } from "./HighlightToolbar";
import { NoteBody } from "./NoteBody";
import { ReaderArticle } from "./ReaderArticle";
import type { ReaderMode } from "./ReaderTopBar";
import type { ReaderHighlights } from "./useReaderHighlights";
import type { ToolbarTarget } from "./useReaderSelection";

function Placeholder({ text }: { text: string }): ReactElement {
  return (
    <div className="bg-surface rounded-3xl p-10 text-center text-base font-medium leading-normal text-muted shadow-ring">
      {text}
    </div>
  );
}

function AssetImage({
  assetId,
  className = "",
}: {
  assetId: string;
  className?: string;
}): ReactElement {
  const url = useAssetUrl(assetId);
  return url ? (
    <img src={url} alt="" className={`w-full rounded-3xl ${className}`} />
  ) : (
    <Placeholder text="Chargement de l'image…" />
  );
}

function ArchiveFrame({ assetId }: { assetId: string }): ReactElement {
  const url = useAssetUrl(assetId);
  if (!url) return <Placeholder text="Chargement de l'archive…" />;
  return (
    <iframe
      title="Archive"
      src={url}
      sandbox=""
      className="h-[80vh] w-full rounded-3xl border-0 bg-white shadow-ring"
    />
  );
}

export interface ReaderBodyProps {
  bookmark: ZBookmark;
  mode: ReaderMode;
  contentRef: RefObject<HTMLDivElement | null>;
  hl: ReaderHighlights;
  target: ToolbarTarget | null;
  setTarget: (t: ToolbarTarget | null) => void;
  applyTarget: (
    t: ToolbarTarget,
    color: Parameters<ReaderHighlights["create"]>[1],
    note: string | null,
  ) => void;
  readOnly: boolean;
}

function LinkArticle({
  html,
  props,
}: {
  html: string;
  props: ReaderBodyProps;
}): ReactElement {
  const { contentRef, hl, target, setTarget, applyTarget, readOnly } = props;
  const toolbar = target && (
    <HighlightToolbar
      key={
        target.kind === "selection"
          ? `${target.selection.start}-${target.selection.end}`
          : target.id
      }
      x={target.kind === "selection" ? target.selection.x : target.x}
      y={target.kind === "selection" ? target.selection.y : target.y}
      readOnly={readOnly}
      onApply={(color, note) => applyTarget(target, color, note)}
      onDelete={
        target.kind === "highlight"
          ? () => {
              hl.remove(target.id);
              setTarget(null);
            }
          : undefined
      }
    />
  );
  return (
    <ReaderArticle
      html={html}
      highlights={hl.painted}
      fresh={hl.fresh}
      onFreshDone={hl.doneFresh}
      contentRef={contentRef}
      onSelect={(selection) =>
        setTarget(selection ? { kind: "selection", selection } : null)
      }
      onHighlightClick={(id, x, y) =>
        setTarget({ kind: "highlight", id, x, y })
      }
    >
      {toolbar}
    </ReaderArticle>
  );
}

function NoReadableVersion({
  url,
  pending,
}: {
  url: string;
  pending: boolean;
}): ReactElement {
  if (pending)
    return <Placeholder text="Texte en cours d'extraction par le serveur." />;
  return (
    <div className="flex flex-col items-center gap-4">
      <Placeholder text="Pas de version lisible pour cette page." />
      <button
        type="button"
        className="text-accent-ink cursor-pointer border-0 bg-transparent font-bold"
        onClick={() => openExternal(url)}
      >
        Ouvrir l’original
      </button>
    </div>
  );
}

export function ReaderBody(props: ReaderBodyProps): ReactElement {
  const c = props.bookmark.content;
  if (c.type === "text") return <NoteBody markdown={c.text} />;
  if (c.type === "asset") {
    if (c.assetType === "image") return <AssetImage assetId={c.assetId} />;
    return (
      <Placeholder text="Les PDF s'ouvrent dans le lecteur du système pour l'instant." />
    );
  }
  if (c.type !== "link") return <Placeholder text="Contenu indisponible." />;
  if (props.mode === "capture" && c.screenshotAssetId)
    return <AssetImage assetId={c.screenshotAssetId} />;
  const archiveId = c.fullPageArchiveAssetId ?? c.precrawledArchiveAssetId;
  if (props.mode === "archive" && archiveId)
    return <ArchiveFrame assetId={archiveId} />;
  if (!c.htmlContent)
    return (
      <NoReadableVersion url={c.url} pending={c.crawlStatus === "pending"} />
    );
  return <LinkArticle html={c.htmlContent} props={props} />;
}
