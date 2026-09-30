import type { ReactElement } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { Icon } from "../shared/Icon";
import { Kbd } from "../shared/Kbd";
import { log } from "../shared/log";
import { useNavigation } from "./navigation";

function windowAction(action: "minimize" | "toggleMaximize" | "close"): void {
  const win = getCurrentWindow();
  win[action]().catch((cause: unknown) =>
    log.error(`fenêtre : ${action}`, cause),
  );
}

const DOTS = [
  { action: "minimize", title: "Réduire", tone: "bg-surface-3 hover:bg-warn" },
  {
    action: "toggleMaximize",
    title: "Agrandir",
    tone: "bg-surface-3 hover:bg-ok",
  },
  { action: "close", title: "Fermer", tone: "bg-surface-4 hover:bg-err" },
] as const;

function HistoryButton({ dir }: { dir: "back" | "forward" }): ReactElement {
  const nav = useNavigation();
  return (
    <button
      type="button"
      onClick={dir === "back" ? nav.back : nav.forward}
      title={dir === "back" ? "Précédent  ⌘←" : "Suivant  ⌘→"}
      className="hover:bg-surface-2 hover:text-text grid size-[30px] cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-muted"
    >
      <Icon name={dir} size={16} stroke={2} />
    </button>
  );
}

export function Titlebar({
  onOpenPalette,
}: {
  onOpenPalette: () => void;
}): ReactElement {
  return (
    <div
      data-tauri-drag-region
      className="border-line flex h-12 flex-none items-center gap-3 border-b pl-5 pr-4"
    >
      <div className="flex gap-0.5">
        <HistoryButton dir="back" />
        <HistoryButton dir="forward" />
      </div>
      <div data-tauri-drag-region className="flex flex-1 justify-center">
        <button
          type="button"
          onClick={onOpenPalette}
          className="bg-surface flex h-8 w-full max-w-[420px] cursor-pointer items-center gap-2.5 rounded-[10px] border-0 pl-3 pr-2 text-[13px] font-medium text-muted shadow-ring transition-shadow hover:shadow-[0_0_0_1px_var(--line-strong)]"
        >
          <Icon name="search" size={15} stroke={2} />
          <span className="flex-1 text-left">
            Rechercher, ouvrir, lancer une commande
          </span>
          <Kbd>⌘K</Kbd>
        </button>
      </div>
      <div className="flex gap-2 pl-2">
        {DOTS.map((dot) => (
          <button
            key={dot.action}
            type="button"
            title={dot.title}
            aria-label={dot.title}
            onClick={() => windowAction(dot.action)}
            className={`size-3 cursor-pointer rounded-full border-0 p-0 transition-colors ${dot.tone}`}
          />
        ))}
      </div>
    </div>
  );
}
