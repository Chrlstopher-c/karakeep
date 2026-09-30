import type { ReactElement } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Icon } from "../shared/Icon";
import { EASE_OUT_SOFT } from "../shared/motion";
import { MCP_TOOL_COUNT, MCP_TOOLS } from "./claudeCode";

export function ToolsCard(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-surface rounded-[28px] p-2 shadow-ring">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-text hover:bg-surface-2 flex h-14 w-full cursor-pointer items-center gap-3 rounded-[22px] border-0 bg-transparent px-5 text-left"
      >
        <span className="flex-1 text-base font-bold leading-none">
          Outils disponibles pour Claude
        </span>
        <span className="font-mono text-[12px] leading-none text-muted">
          {MCP_TOOL_COUNT} OUTILS
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT_SOFT }}
          className="text-muted"
        >
          <Icon name="chevronDown" size={16} stroke={2} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT_SOFT }}
            className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px] px-5 pb-5 pt-2"
          >
            {MCP_TOOLS.map((g) => (
              <div key={g.group} className="flex flex-col gap-2">
                <span className="text-accent-ink font-mono text-[11px] leading-none tracking-[0.14em]">
                  {g.group}
                </span>
                {g.items.map((t) => (
                  <span
                    key={t}
                    className="text-soft font-mono text-[12.5px] leading-[1.3]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
