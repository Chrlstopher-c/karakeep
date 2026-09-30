import type { ReactElement } from "react";
import { motion } from "motion/react";

import type { KnowledgeListKey } from "../knowledge/conventions";
import { LIST_NAMES } from "../knowledge/conventions";
import { Button } from "../shared/Button";
import { EASE_OUT_SOFT } from "../shared/motion";
import type { CaptureForm } from "./useCaptureForm";
import { useCaptureForm } from "./useCaptureForm";

const LIST_KEYS: KnowledgeListKey[] = ["sources", "decisions", "projects", "guide"];

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }): ReactElement {
  const tone = active
    ? "bg-active text-text shadow-[inset_0_0_0_1.5px_var(--accent)]"
    : "bg-transparent text-muted shadow-ring hover:text-text";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-7 cursor-pointer rounded-full border-0 px-[11px] text-[12px] font-semibold leading-none ${tone}`}
    >
      {label}
    </button>
  );
}

function ChipRow({ label, children }: { label: string; children: ReactElement[] }): ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-[52px] font-mono text-[10.5px] leading-none tracking-[0.12em] text-muted">{label}</span>
      {children}
    </div>
  );
}

function Input({ f }: { f: CaptureForm }): ReactElement {
  if (f.file) {
    return (
      <div className="text-text flex flex-1 items-center gap-3 text-[18px] font-semibold">
        {f.file.name}
        <button
          type="button"
          onClick={() => f.setFile(null)}
          className="cursor-pointer border-0 bg-transparent text-[13px] text-muted"
        >
          retirer
        </button>
      </div>
    );
  }
  return (
    <textarea
      autoFocus
      value={f.text}
      onChange={(e) => f.setText(e.target.value)}
      aria-label="Contenu à capturer"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          void f.submit();
        }
      }}
      placeholder="Coller un lien, écrire une note ou déposer un fichier"
      className="text-text flex-1 resize-none border-0 bg-transparent p-0 text-[20px] font-semibold leading-[1.45] outline-none placeholder:text-muted"
    />
  );
}

function Header({ kind }: { kind: string }): ReactElement {
  return (
    <div className="flex items-center gap-2.5">
      <span className="size-2 rounded-[2px] bg-accent" />
      <span className="text-accent-ink flex-1 font-mono text-[12px] leading-none tracking-[0.14em]">
        CAPTURE RAPIDE
      </span>
      <span className="bg-surface-3 text-soft h-6 rounded-full px-2.5 font-mono text-[11px] leading-6 tracking-[0.08em]">
        {kind}
      </span>
    </div>
  );
}

function Choices({ f }: { f: CaptureForm }): ReactElement {
  return (
    <>
      <ChipRow label="LISTE">
        {LIST_KEYS.map((k) => (
          <Chip key={k} active={f.list === k} label={LIST_NAMES[k]} onClick={() => f.toggleList(k)} />
        ))}
      </ChipRow>
      <ChipRow label="TAGS">
        {f.suggestions.map((t) => (
          <Chip key={t} active={f.picked.includes(t)} label={t} onClick={() => f.toggleTag(t)} />
        ))}
      </ChipRow>
    </>
  );
}

function Footer({ f }: { f: CaptureForm }): ReactElement {
  return (
    <div className="border-line flex items-center gap-4 border-t pt-3">
      <span className="flex-1 font-mono text-[11px] leading-none text-muted">ENTRÉE RANGER · ÉCHAP FERMER</span>
      <Button
        variant="primary"
        className="h-10 text-sm"
        onClick={() => void f.submit()}
        disabled={!f.ready || f.saving}
      >
        {f.saving ? "Rangement…" : "Ranger"}
      </Button>
    </div>
  );
}

export function CaptureDialog({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (message: string) => void;
}): ReactElement {
  const f = useCaptureForm(onClose, onSaved);
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
        onDrop={f.onDrop}
        className="bg-pop shadow-modal relative flex h-[360px] w-[560px] flex-col gap-3.5 rounded-[28px] px-6 pb-[18px] pt-[22px]"
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.2, ease: EASE_OUT_SOFT }}
      >
        <Header kind={f.kind} />
        <Input f={f} />
        <Choices f={f} />
        {f.error && (
          <span role="alert" className="text-err font-mono text-[12px]">
            {f.error}
          </span>
        )}
        <Footer f={f} />
      </motion.div>
    </div>
  );
}
