import type { ReactElement } from "react";

export function Shimmer(): ReactElement {
  return (
    <div className="pointer-events-none absolute inset-0 animate-[sv-shimmer_1.8s_cubic-bezier(.4,0,.2,1)_infinite] bg-[linear-gradient(90deg,transparent,var(--fresh),transparent)]" />
  );
}

export function CardSkeleton({ height = 300 }: { height?: number }): ReactElement {
  return (
    <div className="bg-surface relative overflow-hidden rounded-3xl shadow-ring" style={{ height }}>
      <div className="bg-surface-2 h-[148px]" />
      <div className="flex flex-col gap-2.5 px-5 py-4">
        <div className="bg-surface-2 h-2.5 w-2/5 rounded-[5px]" />
        <div className="bg-surface-2 h-3.5 w-[86%] rounded-md" />
        <div className="bg-surface-2 h-3.5 w-[64%] rounded-md" />
      </div>
      <Shimmer />
    </div>
  );
}
