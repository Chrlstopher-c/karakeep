import type { ReactElement } from "react";

import { Icon } from "../shared/Icon";
import { Kbd } from "../shared/Kbd";
import { openExternal } from "../shared/openExternal";
import { Segmented } from "../shared/Segmented";

export type ReaderMode = "article" | "capture" | "archive";

const MODE_LABEL: Record<ReaderMode, string> = { article: "Article", capture: "Capture", archive: "Archive" };
const PILL =
  "flex h-9 cursor-pointer items-center gap-1.5 rounded-[10px] border-0 bg-surface-2 px-3 text-[13px] font-bold";

interface TopBarProps {
  backLabel: string;
  onBack: () => void;
  mode: ReaderMode;
  modes: ReaderMode[];
  onMode: (m: ReaderMode) => void;
  percent: number;
  url: string | null;
  panelToggle?: { label: string; onToggle: () => void };
}

function BackButton({ label, onBack }: { label: string; onBack: () => void }): ReactElement {
  return (
    <button
      type="button"
      onClick={onBack}
      className="text-soft hover:bg-surface-2 hover:text-text flex h-9 cursor-pointer items-center gap-2 rounded-[10px] border-0 bg-transparent pl-2 pr-2.5 text-sm font-bold"
    >
      <Icon name="chevronLeft" size={16} stroke={2} />
      {label}
      <Kbd>ÉCHAP</Kbd>
    </button>
  );
}

function ProgressLine({ percent }: { percent: number }): ReactElement {
  return (
    <div className="absolute -bottom-px left-0 right-0 h-0.5 overflow-hidden">
      <div
        className="h-full origin-left bg-accent transition-transform duration-150"
        style={{ transform: `scaleX(${percent / 100})` }}
      />
    </div>
  );
}

export function ReaderTopBar(props: TopBarProps): ReactElement {
  const { mode, modes, onMode, percent, url, panelToggle } = props;
  return (
    <div className="border-line bg-bg sticky top-0 z-[5] flex h-14 items-center gap-3 border-b px-5">
      <BackButton label={props.backLabel} onBack={props.onBack} />
      <span className="flex-1" />
      {modes.length > 1 && (
        <Segmented value={mode} onChange={onMode} options={modes.map((m) => ({ value: m, label: MODE_LABEL[m] }))} />
      )}
      <span className="flex-1" />
      <span className="min-w-10 text-right font-mono text-[12px] leading-none text-muted">{percent} %</span>
      {panelToggle && (
        <button type="button" onClick={panelToggle.onToggle} className={`${PILL} text-text whitespace-nowrap`}>
          {panelToggle.label}
        </button>
      )}
      {url && (
        <button type="button" onClick={() => openExternal(url)} className={`${PILL} text-soft hover:text-text`}>
          Original
          <Icon name="external" size={14} stroke={2} />
        </button>
      )}
      <ProgressLine percent={percent} />
    </div>
  );
}
