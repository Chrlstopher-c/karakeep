import type { DragEvent } from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";

import type { KnowledgeListKey } from "../knowledge/conventions";
import { LIST_NAMES } from "../knowledge/conventions";
import { useKnowledgeLists } from "../knowledge/useKnowledgeLists";
import type { CaptureKind } from "./useCapture";
import { captureKind, useCapture } from "./useCapture";

const SUGGESTED_TAGS = 6;

export interface CaptureForm {
  text: string;
  setText: (t: string) => void;
  file: File | null;
  setFile: (f: File | null) => void;
  list: KnowledgeListKey | null;
  toggleList: (k: KnowledgeListKey) => void;
  picked: string[];
  toggleTag: (t: string) => void;
  suggestions: string[];
  kind: CaptureKind;
  ready: boolean;
  saving: boolean;
  error: string | null;
  submit: () => Promise<void>;
  onDrop: (e: DragEvent) => void;
}

function useTagSuggestions(): string[] {
  const trpc = useTRPC();
  const tags = useQuery(trpc.tags.list.queryOptions({}));
  return (tags.data?.tags ?? [])
    .map((t) => t.name)
    .filter((n) => !n.startsWith("statut:"))
    .slice(0, SUGGESTED_TAGS);
}

function droppedFile(setFile: (f: File) => void): (e: DragEvent) => void {
  return (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };
}

// Liste de rangement (Sources par défaut) et tags choisis.
function useCaptureChoices(): Pick<CaptureForm, "list" | "picked" | "toggleList" | "toggleTag"> {
  const [list, setList] = useState<KnowledgeListKey | null>("sources");
  const [picked, setPicked] = useState<string[]>([]);
  return {
    list,
    picked,
    toggleList: (k) => setList(list === k ? null : k),
    toggleTag: (t) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t])),
  };
}

export function useCaptureForm(onClose: () => void, onSaved: (message: string) => void): CaptureForm {
  const lists = useKnowledgeLists();
  const { save, saving } = useCapture();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { list, picked, toggleList, toggleTag } = useCaptureChoices();
  const [error, setError] = useState<string | null>(null);
  const ready = !!file || text.trim().length > 0;
  const submit = (): Promise<void> =>
    ready && !saving
      ? save({ text, file, listId: list ? (lists[list] ?? null) : null, tags: picked }).then(
          () => {
            onSaved(list ? `Rangé dans ${LIST_NAMES[list]}` : "Ajouté à la base");
            onClose();
          },
          (cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)),
        )
      : Promise.resolve();
  return {
    text,
    setText,
    file,
    setFile,
    list,
    picked,
    error,
    ready,
    saving,
    submit,
    kind: captureKind(text, file),
    toggleList,
    toggleTag,
    suggestions: useTagSuggestions(),
    onDrop: droppedFile(setFile),
  };
}
