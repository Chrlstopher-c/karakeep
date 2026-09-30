import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";
import type { ZBookmark } from "@karakeep/shared/types/bookmarks";
import { getBookmarkTitle } from "@karakeep/shared/utils/bookmarkUtils";

import { useNavigation } from "../app/navigation";
import { useProvenance } from "../claude/useAgentActivity";
import { projectOf, statusOf } from "../knowledge/conventions";
import { Eyebrow } from "../shared/Eyebrow";
import { Icon } from "../shared/Icon";
import { Kbd } from "../shared/Kbd";
import { log } from "../shared/log";
import { Rise } from "../shared/Rise";
import { relativeTime } from "../shared/time";
import { SheetBody } from "./SheetBody";
import { SheetEditor } from "./SheetEditor";
import { useDecisionActions } from "./useDecisionActions";

const STATUS_STYLE = {
  ouverte: { label: "Ouverte", cls: "bg-active text-accent-ink" },
  tranchée: {
    label: "Tranchée",
    cls: "bg-[color-mix(in_srgb,var(--ok)_18%,transparent)] text-ok",
  },
  abandonnée: { label: "Abandonnée", cls: "bg-surface-2 text-muted" },
} as const;

function SheetTopBar({
  updated,
  editing,
  onEdit,
}: {
  updated: string;
  editing: boolean;
  onEdit: () => void;
}): ReactElement {
  const { back } = useNavigation();
  return (
    <div className="border-line bg-bg sticky top-0 z-[5] flex h-14 items-center gap-3 border-b px-5">
      <button
        type="button"
        onClick={back}
        className="text-soft hover:bg-surface-2 hover:text-text flex h-9 cursor-pointer items-center gap-2 rounded-[10px] border-0 bg-transparent pl-2 pr-2.5 text-sm font-bold"
      >
        <Icon name="chevronLeft" size={16} stroke={2} />
        Décisions<Kbd>ÉCHAP</Kbd>
      </button>
      <span className="flex-1" />
      <span className="font-mono text-[12px] leading-none text-muted">
        {updated}
      </span>
      {!editing && (
        <button
          type="button"
          onClick={onEdit}
          className="bg-surface-2 text-soft hover:text-text flex h-9 cursor-pointer items-center gap-2 rounded-[10px] border-0 pl-3 pr-2.5 text-[13px] font-bold"
        >
          Éditer<Kbd>E</Kbd>
        </button>
      )}
    </div>
  );
}

function SheetHeader({ bookmark }: { bookmark: ZBookmark }): ReactElement {
  const status = STATUS_STYLE[statusOf(bookmark)];
  return (
    <header className="flex flex-col gap-4">
      <Rise>
        <Eyebrow>{`FICHE DE DÉCISION${projectOf(bookmark) ? ` · ${projectOf(bookmark)?.toUpperCase()}` : ""}`}</Eyebrow>
      </Rise>
      <h1 className="text-text m-0 text-balance text-[42px] font-extrabold leading-[1.1] tracking-[-0.04em]">
        {getBookmarkTitle(bookmark) ?? "Sans titre"}
      </h1>
      <Rise index={1} className="flex flex-wrap items-center gap-3">
        <span
          className={`h-[26px] rounded-full px-3 text-[12px] font-bold leading-[26px] ${status.cls}`}
        >
          {status.label}
        </span>
        <span className="font-mono text-[12px] leading-none text-muted">
          créée le {bookmark.createdAt.toLocaleDateString("fr-FR")}
        </span>
      </Rise>
    </header>
  );
}

function useEditShortcut(active: boolean, onEdit: () => void): void {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent): void => {
      const tag = (e.target as HTMLElement | null)?.tagName; // cible clavier : élément ou null
      if (
        e.key === "e" &&
        !e.metaKey &&
        !e.ctrlKey &&
        tag !== "INPUT" &&
        tag !== "TEXTAREA"
      )
        onEdit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onEdit]);
}

export function SheetScreen({
  bookmarkId,
}: {
  bookmarkId: string;
}): ReactElement {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const bookmark = useQuery({
    ...trpc.bookmarks.getBookmark.queryOptions({
      bookmarkId,
      includeContent: true,
    }),
    refetchInterval: 3_000,
  });
  const provenance = useProvenance();
  const actions = useDecisionActions();
  const rename = useMutation(
    trpc.bookmarks.updateBookmark.mutationOptions({
      onError: (e) => log.error("titre de fiche", e),
    }),
  );
  const [editing, setEditing] = useState(false);
  useEditShortcut(!editing, () => setEditing(true));
  const b = bookmark.data;
  if (!b) return <SheetTopBar updated="" editing onEdit={() => undefined} />;
  const text = b.content.type === "text" ? b.content.text : "";

  const save = async (title: string, next: string): Promise<void> => {
    if (title !== getBookmarkTitle(b))
      await rename.mutateAsync({ bookmarkId: b.id, title });
    await actions.saveText(b.id, next);
    await queryClient.invalidateQueries(
      trpc.bookmarks.getBookmark.pathFilter(),
    );
    setEditing(false);
  };

  return (
    <div>
      <SheetTopBar
        updated={`modifiée ${relativeTime(b.modifiedAt ?? b.createdAt)}`}
        editing={editing}
        onEdit={() => setEditing(true)}
      />
      <div className="flex justify-center px-12 pb-[180px] pt-12">
        <div className="flex w-full max-w-[780px] flex-col gap-11">
          {editing ? (
            <SheetEditor
              title={getBookmarkTitle(b) ?? ""}
              text={text}
              onCancel={() => setEditing(false)}
              onSave={(t, x) => void save(t, x)}
            />
          ) : (
            <>
              <SheetHeader bookmark={b} />
              <SheetBody
                bookmark={b}
                text={text}
                byClaude={provenance.bookmarkIds.has(b.id)}
                actions={actions}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
