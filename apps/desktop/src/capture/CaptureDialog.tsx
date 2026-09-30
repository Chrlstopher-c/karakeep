import type { DragEvent, ReactElement } from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";

import { useTRPC } from "@karakeep/shared-react/trpc";

import type { KnowledgeListKey } from "../knowledge/conventions";
import { LIST_NAMES } from "../knowledge/conventions";
import { useKnowledgeLists } from "../knowledge/useKnowledgeLists";
import { Button } from "../shared/Button";
import { EASE_OUT_SOFT } from "../shared/motion";
import { captureKind, useCapture } from "./useCapture";

const LIST_KEYS: KnowledgeListKey[] = [
  "sources",
  "decisions",
  "projects",
  "guide",
];

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-7 cursor-pointer rounded-full border-0 px-[11px] text-[12px] font-semibold leading-none ${active ? "bg-active text-text shadow-[inset_0_0_0_1.5px_var(--accent)]" : "hover:text-text bg-transparent text-muted shadow-ring"}`}
    >
      {label}
    </button>
  );
}

export function CaptureDialog({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (message: string) => void;
}): ReactElement {
  const trpc = useTRPC();
  const lists = useKnowledgeLists();
  const tags = useQuery(trpc.tags.list.queryOptions({}));
  const { save, saving } = useCapture();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [list, setList] = useState<KnowledgeListKey | null>("sources");
  const [picked, setPicked] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const kind = captureKind(text, file);
  const suggestions = (tags.data?.tags ?? [])
    .map((t) => t.name)
    .filter((n) => !n.startsWith("statut:"))
    .slice(0, 6);
  const ready = !!file || text.trim().length > 0;

  const submit = async (): Promise<void> => {
    if (!ready || saving) return;
    try {
      await save({
        text,
        file,
        listId: list ? (lists[list] ?? null) : null,
        tags: picked,
      });
      onSaved(list ? `Rangé dans ${LIST_NAMES[list]}` : "Ajouté à la base");
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };
  const onDrop = (e: DragEvent): void => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <div className="absolute inset-0 z-[22] grid place-items-center">
      <motion.div
        className="bg-scrim absolute inset-0"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
      />
      <motion.div
        role="dialog"
        aria-label="Capture rapide"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="bg-pop shadow-modal relative flex h-[360px] w-[560px] flex-col gap-3.5 rounded-[28px] px-6 pb-[18px] pt-[22px]"
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.2, ease: EASE_OUT_SOFT }}
      >
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-[2px] bg-accent" />
          <span className="text-accent-ink flex-1 font-mono text-[12px] leading-none tracking-[0.14em]">
            CAPTURE RAPIDE
          </span>
          <span className="bg-surface-3 text-soft h-6 rounded-full px-2.5 font-mono text-[11px] leading-6 tracking-[0.08em]">
            {kind}
          </span>
        </div>
        {file ? (
          <div className="text-text flex flex-1 items-center gap-3 text-[18px] font-semibold">
            {file.name}
            <button
              type="button"
              onClick={() => setFile(null)}
              className="cursor-pointer border-0 bg-transparent text-[13px] text-muted"
            >
              retirer
            </button>
          </div>
        ) : (
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Contenu à capturer"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
            placeholder="Coller un lien, écrire une note ou déposer un fichier"
            className="text-text flex-1 resize-none border-0 bg-transparent p-0 text-[20px] font-semibold leading-[1.45] outline-none placeholder:text-muted"
          />
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-[52px] font-mono text-[10.5px] leading-none tracking-[0.12em] text-muted">
            LISTE
          </span>
          {LIST_KEYS.map((k) => (
            <Chip
              key={k}
              active={list === k}
              label={LIST_NAMES[k]}
              onClick={() => setList(list === k ? null : k)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-[52px] font-mono text-[10.5px] leading-none tracking-[0.12em] text-muted">
            TAGS
          </span>
          {suggestions.map((t) => (
            <Chip
              key={t}
              active={picked.includes(t)}
              label={t}
              onClick={() =>
                setPicked((p) =>
                  p.includes(t) ? p.filter((x) => x !== t) : [...p, t],
                )
              }
            />
          ))}
        </div>
        {error && (
          <span role="alert" className="text-err font-mono text-[12px]">
            {error}
          </span>
        )}
        <div className="border-line flex items-center gap-4 border-t pt-3">
          <span className="flex-1 font-mono text-[11px] leading-none text-muted">
            ENTRÉE RANGER · ÉCHAP FERMER
          </span>
          <Button
            variant="primary"
            className="h-10 text-sm"
            onClick={() => void submit()}
            disabled={!ready || saving}
          >
            {saving ? "Rangement…" : "Ranger"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
