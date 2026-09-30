import type { ReactElement } from "react";

export function TagChip({ children }: { children: string }): ReactElement {
  return (
    <span className="bg-tag-bg text-tag-fg h-6 flex-none rounded-full px-2.5 text-[12px] font-semibold leading-6">
      {children}
    </span>
  );
}
