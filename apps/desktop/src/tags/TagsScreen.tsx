import type { ReactElement } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";

import { Eyebrow } from "../shared/Eyebrow";
import { log } from "../shared/log";
import { Rise } from "../shared/Rise";
import { TagChip } from "../shared/TagChip";

interface TagRow {
  id: string;
  name: string;
  numBookmarks: number;
}

type Mode = { kind: "rename"; id: string } | { kind: "merge"; id: string } | null;

const ACTION =
  "h-8 cursor-pointer rounded-[10px] border-0 bg-transparent px-3 text-[13px] font-bold text-soft hover:bg-surface-2 hover:text-text";
const FIELD =
  "h-9 rounded-[10px] border-0 bg-field px-3 text-sm text-text shadow-[inset_0_0_0_1px_var(--line-strong)] outline-none";

function RenameField({
  tag,
  onRename,
  onCancel,
}: {
  tag: TagRow;
  onRename: (id: string, name: string) => void;
  onCancel: () => void;
}): ReactElement {
  const [value, setValue] = useState(tag.name);
  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      aria-label="Nouveau nom"
      className={FIELD}
      onKeyDown={(e) => {
        if (e.key === "Enter") onRename(tag.id, value.trim());
        if (e.key === "Escape") onCancel();
      }}
    />
  );
}

function MergeControls({
  tag,
  tags,
  onMerge,
  onCancel,
}: {
  tag: TagRow;
  tags: TagRow[];
  onMerge: (from: string, into: string) => void;
  onCancel: () => void;
}): ReactElement {
  const [target, setTarget] = useState("");
  return (
    <>
      <select value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Fusionner dans" className={FIELD}>
        <option value="">Fusionner dans…</option>
        {tags
          .filter((t) => t.id !== tag.id)
          .map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
      </select>
      <button type="button" className={ACTION} disabled={!target} onClick={() => onMerge(tag.id, target)}>
        Fusionner
      </button>
      <button type="button" className={ACTION} onClick={onCancel}>
        Annuler
      </button>
    </>
  );
}

function Row({
  tag,
  tags,
  mode,
  setMode,
  onRename,
  onMerge,
}: {
  tag: TagRow;
  tags: TagRow[];
  mode: Mode;
  setMode: (m: Mode) => void;
  onRename: (id: string, name: string) => void;
  onMerge: (from: string, into: string) => void;
}): ReactElement {
  const active = mode?.id === tag.id ? mode.kind : null;
  const cancel = (): void => setMode(null);
  return (
    <div className="hover:bg-surface-2 flex min-h-[52px] flex-wrap items-center gap-3.5 rounded-2xl px-3.5 py-2">
      {active === "rename" ? (
        <RenameField tag={tag} onRename={onRename} onCancel={cancel} />
      ) : (
        <TagChip>{tag.name}</TagChip>
      )}
      <span className="flex-1 font-mono text-[12px] text-muted">{tag.numBookmarks}</span>
      {active === "merge" ? (
        <MergeControls tag={tag} tags={tags} onMerge={onMerge} onCancel={cancel} />
      ) : (
        <>
          <button type="button" className={ACTION} onClick={() => setMode({ kind: "rename", id: tag.id })}>
            Renommer
          </button>
          <button type="button" className={ACTION} onClick={() => setMode({ kind: "merge", id: tag.id })}>
            Fusionner
          </button>
        </>
      )}
    </div>
  );
}

export function TagsScreen(): ReactElement {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const list = useQuery(trpc.tags.list.queryOptions({}));
  const [mode, setMode] = useState<Mode>(null);
  const done = (): void => {
    setMode(null);
    void queryClient.invalidateQueries(trpc.tags.pathFilter());
    void queryClient.invalidateQueries(trpc.bookmarks.pathFilter());
  };
  const onError = (cause: unknown): void => log.error("tags", cause);
  const update = useMutation(trpc.tags.update.mutationOptions({ onSuccess: done, onError }));
  const merge = useMutation(trpc.tags.merge.mutationOptions({ onSuccess: done, onError }));
  const tags: TagRow[] = [...(list.data?.tags ?? [])].sort((a, b) => b.numBookmarks - a.numBookmarks);
  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-6 px-10 pb-20 pt-9">
      <Rise className="flex flex-col gap-3">
        <Eyebrow>BASE</Eyebrow>
        <h1 className="text-text m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.035em]">Tags</h1>
      </Rise>
      <Rise index={1} className="bg-surface rounded-3xl p-1.5 shadow-ring">
        {tags.length === 0 && <p className="m-0 p-4 text-sm text-muted">Aucun tag.</p>}
        {tags.map((t) => (
          <Row
            key={t.id}
            tag={t}
            tags={tags}
            mode={mode}
            setMode={setMode}
            onRename={(id, name) => name && update.mutate({ tagId: id, name })}
            onMerge={(from, into) => merge.mutate({ intoTagId: into, fromTagIds: [from] })}
          />
        ))}
      </Rise>
    </div>
  );
}
