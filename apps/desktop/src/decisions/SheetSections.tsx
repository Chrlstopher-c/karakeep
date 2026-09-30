import type { ReactElement, ReactNode } from "react";

import { useNavigation } from "../app/navigation";
import { tintColor } from "../highlights/colors";
import { useAllHighlights } from "../highlights/useAllHighlights";
import { NoteBody } from "../reader/NoteBody";
import { ClaudeBadge } from "../shared/ClaudeBadge";
import { Icon } from "../shared/Icon";
import { Rise } from "../shared/Rise";
import type { SheetOption, SheetSource } from "./sheetModel";

export function SheetSection({
  n,
  title,
  badge,
  children,
  index,
}: {
  n: string;
  title: string;
  badge?: ReactNode;
  children: ReactNode;
  index: number;
}): ReactElement {
  return (
    <Rise index={index} className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <span className="text-accent-ink font-mono text-[12px] leading-none">{n}</span>
        <h2 className="text-text m-0 flex-1 text-[19px] font-extrabold leading-[1.2] tracking-[-0.025em]">{title}</h2>
        {badge}
      </div>
      {children}
    </Rise>
  );
}

export function Dashed({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="border-line-strong flex items-center gap-4 rounded-3xl border-[1.5px] border-dashed px-[26px] py-[22px] text-[15px] font-medium leading-[1.4] text-muted">
      {children}
    </div>
  );
}

export function Prose({ markdown }: { markdown: string }): ReactElement {
  return (
    <div className="max-w-[66ch] [&_.sv-article]:text-[18px] [&_.sv-article]:leading-[1.7]">
      <NoteBody markdown={markdown} />
    </div>
  );
}

const GRID = "grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_92px] gap-[18px]";

function Points({ items, color }: { items: string[]; color: string }): ReactElement {
  return (
    <div className="flex flex-col gap-[7px]">
      {items.map((p) => (
        <div key={p} className="flex items-start gap-[9px]">
          <span className="mt-[7px] size-[7px] flex-none rounded-full" style={{ background: color }} />
          <span className="text-soft text-sm font-medium leading-[1.45]">{p}</span>
        </div>
      ))}
    </div>
  );
}

export function OptionsTable({
  options,
  chosen,
  canPick,
  onPick,
}: {
  options: SheetOption[];
  chosen: string | null;
  canPick: boolean;
  onPick: (name: string) => void;
}): ReactElement {
  return (
    <div className="bg-surface overflow-hidden rounded-3xl shadow-ring">
      <div className={`${GRID} px-5 py-3.5 font-mono text-[11px] leading-none tracking-[0.14em] text-muted`}>
        <span>OPTION</span>
        <span>POUR</span>
        <span>CONTRE</span>
        <span />
      </div>
      {options.map((o) => {
        const isChosen = !!chosen && chosen.startsWith(o.name);
        return (
          <div key={o.name} className={`${GRID} border-line border-t px-5 py-[18px] ${isChosen ? "bg-active" : ""}`}>
            <div className="flex flex-col gap-2">
              <span className="text-text text-[15px] font-bold leading-[1.35]">{o.name}</span>
              {isChosen && (
                <span className="text-accent-ink font-mono text-[10.5px] leading-none tracking-[0.14em]">RETENUE</span>
              )}
            </div>
            <Points items={o.pros} color="var(--hl-green)" />
            <Points items={o.cons} color="var(--hl-red)" />
            <div className="flex items-start justify-end">
              {canPick && (
                <button
                  type="button"
                  onClick={() => onPick(o.name)}
                  className="bg-surface-2 text-text hover:bg-surface-3 h-8 cursor-pointer rounded-[10px] border-0 px-3 text-[13px] font-bold"
                >
                  Retenir
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LinkedSources({ sources }: { sources: SheetSource[] }): ReactElement {
  const { go } = useNavigation();
  const highlights = useAllHighlights();
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {sources.map((s) => {
        const quote = s.bookmarkId ? highlights.byBookmark.get(s.bookmarkId)?.[0] : undefined;
        return (
          <button
            key={s.url}
            type="button"
            onClick={() =>
              s.bookmarkId &&
              go({
                screen: "reader",
                bookmarkId: s.bookmarkId,
                highlightId: quote?.id,
              })
            }
            className="bg-surface hover:shadow-lift flex cursor-pointer flex-col gap-3 rounded-3xl border-0 px-5 py-[18px] text-left shadow-ring transition-[transform,box-shadow] duration-200 hover:-translate-y-1"
          >
            <span className="text-text text-[15px] font-medium leading-[1.55]">
              {quote ? (
                <span
                  className="rounded-[3px] py-px [box-decoration-break:clone]"
                  style={{ background: tintColor(quote.color) }}
                >
                  {quote.text}
                </span>
              ) : (
                s.title
              )}
            </span>
            <span className="flex items-center gap-2 font-mono text-[12px] leading-[1.3] text-muted">
              <span className="min-w-0 flex-1 truncate">{s.title}</span>
              <Icon name="forward" size={14} stroke={2} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Recommendation({ text, byClaude }: { text: string; byClaude: boolean }): ReactElement {
  return (
    <div className="bg-surface-2 relative flex flex-col gap-2.5 rounded-[18px] px-[18px] py-4">
      {byClaude ? (
        <span className="self-start">
          <ClaudeBadge label="PROPOSITION DE CLAUDE" />
        </span>
      ) : (
        <span className="text-accent-ink font-mono text-[10.5px] tracking-[0.14em]">PROPOSITION</span>
      )}
      <span className="text-text text-base font-medium leading-[1.6]">{text}</span>
    </div>
  );
}
