import type { ReactElement } from "react";

import { Kbd } from "./Kbd";

export function SectionHeader({
  title,
  action,
  kbd,
  onAction,
}: {
  title: string;
  action?: string;
  kbd?: string;
  onAction?: () => void;
}): ReactElement {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="text-text m-0 flex-1 text-[19px] font-extrabold leading-[1.2] tracking-[-0.025em]">
        {title}
      </h2>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="hover:text-text flex cursor-pointer items-center gap-2 border-0 bg-transparent text-[13px] font-semibold text-muted"
        >
          {action}
          {kbd && <Kbd>{kbd}</Kbd>}
        </button>
      )}
    </div>
  );
}
