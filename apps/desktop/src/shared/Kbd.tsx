import type { ReactElement, ReactNode } from "react";

export function Kbd({ children }: { children: ReactNode }): ReactElement {
  return (
    <span className="bg-surface-3 rounded-md px-1.5 py-1 font-mono text-[11px] leading-none text-muted">
      {children}
    </span>
  );
}
