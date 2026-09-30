import type { ReactElement } from "react";
import { motion } from "motion/react";

import { Kbd } from "../shared/Kbd";
import { EASE_OUT_SOFT } from "../shared/motion";

export function FollowBanner({
  status,
  busy,
  onStop,
}: {
  status: string;
  busy: boolean;
  onStop: () => void;
}): ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: EASE_OUT_SOFT }}
      className="border-line bg-active flex flex-none items-center gap-3.5 border-b py-2.5 pl-5 pr-3"
    >
      <span className="relative size-2.5 flex-none">
        <span className="absolute inset-0 rounded-full bg-accent" />
        {busy && (
          <span className="absolute inset-0 animate-[sv-ping_1.4s_cubic-bezier(.2,.7,.2,1)_infinite] rounded-full border-[1.5px] border-accent" />
        )}
      </span>
      <span className="text-accent-ink font-mono text-[12px] leading-none tracking-[0.14em]">
        SUIVI DE CLAUDE
      </span>
      <span className="text-text min-w-0 flex-1 truncate text-sm font-semibold leading-[1.3]">
        {status}
      </span>
      <button
        type="button"
        onClick={onStop}
        className="bg-surface-2 text-text hover:bg-surface-3 flex h-8 flex-none cursor-pointer items-center gap-2 rounded-[10px] border-0 pl-3 pr-2 text-[13px] font-bold"
      >
        Arrêter le suivi <Kbd>F</Kbd>
      </button>
    </motion.div>
  );
}
