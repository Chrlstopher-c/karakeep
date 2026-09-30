import type { ReactElement } from "react";

import { ClaudeMark } from "./Icon";

// Marque de provenance : ce que Claude a fait porte cette pastille, jamais ce que fait Chris.
export function ClaudeBadge({
  label = "CLAUDE",
}: {
  label?: string;
}): ReactElement {
  return (
    <span className="bg-claude-bg text-accent-ink inline-flex h-[22px] flex-none items-center gap-[5px] rounded-full px-2 font-mono text-[10.5px] leading-none tracking-[0.08em]">
      <ClaudeMark />
      {label}
    </span>
  );
}
