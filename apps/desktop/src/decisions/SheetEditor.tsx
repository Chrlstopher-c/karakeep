import type { ReactElement } from "react";
import { useState } from "react";

import { Button } from "../shared/Button";

// Édition brute de la fiche (Markdown). Enregistrer : ⌘S ou le bouton ; Échap annule.
export function SheetEditor({
  title,
  text,
  onSave,
  onCancel,
}: {
  title: string;
  text: string;
  onSave: (title: string, text: string) => void;
  onCancel: () => void;
}): ReactElement {
  const [draftTitle, setDraftTitle] = useState(title);
  const [draft, setDraft] = useState(text);
  const save = (): void => onSave(draftTitle.trim() || title, draft);
  return (
    <div
      role="form"
      aria-label="Édition de la fiche"
      className="flex flex-col gap-4"
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "s") {
          e.preventDefault();
          save();
        }
        if (e.key === "Escape") {
          e.stopPropagation();
          onCancel();
        }
      }}
    >
      <input
        value={draftTitle}
        onChange={(e) => setDraftTitle(e.target.value)}
        aria-label="Titre de la fiche"
        className="bg-field text-text w-full rounded-2xl border-0 px-4 py-3 text-[28px] font-extrabold tracking-[-0.03em] shadow-ring outline-none focus:shadow-[0_0_0_2px_var(--accent)]"
      />
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label="Contenu de la fiche"
        autoFocus
        className="bg-field text-text min-h-[60vh] w-full resize-y rounded-3xl border-0 p-5 font-mono text-[14px] leading-[1.7] shadow-ring outline-none focus:shadow-[0_0_0_2px_var(--accent)]"
      />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button variant="primary" onClick={save}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
