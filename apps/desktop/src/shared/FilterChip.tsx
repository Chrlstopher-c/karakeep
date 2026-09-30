import type { ReactElement, ReactNode } from "react";

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-full border-0 px-3 text-[13px] font-semibold leading-none transition-colors ${active ? "bg-active text-text shadow-[inset_0_0_0_1.5px_var(--accent)]" : "hover:text-text bg-transparent text-muted shadow-ring"}`}
    >
      {children}
    </button>
  );
}
