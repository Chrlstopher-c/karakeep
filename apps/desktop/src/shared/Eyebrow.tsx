import type { ReactElement, ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }): ReactElement {
  return (
    <span className="text-accent-ink flex items-center gap-2.5 font-mono text-[12px] uppercase leading-none tracking-[0.14em]">
      <span className="size-2 rounded-[2px] bg-accent" />
      {children}
    </span>
  );
}
