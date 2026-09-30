import type { ReactElement, ReactNode } from "react";

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  title?: string;
}

// Contrôle segmenté du prototype : fond surface-2, option active surélevée.
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  square = false,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  square?: boolean;
}): ReactElement {
  return (
    <div className={`bg-surface-2 flex rounded-xl p-[3px] ${square ? "gap-1" : "gap-0.5"}`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            title={o.title}
            onClick={() => onChange(o.value)}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-[9px] border-0 text-[13px] font-bold leading-none transition-colors ${square ? "h-[34px] w-10" : "h-8 px-3"} ${active ? "bg-surface text-text shadow-ring" : "hover:text-text bg-transparent text-muted"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
