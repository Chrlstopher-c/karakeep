import type { ReactElement } from "react";
import { motion } from "motion/react";

import { EASE_SWEEP } from "../shared/motion";
import type { Sweep } from "./useSweeps";

const CHRIS_MS = 0.42;
const CLAUDE_MS = 0.68;

export function SweepLayer({ sweeps, onFinish }: { sweeps: Sweep[]; onFinish: (id: string) => void }): ReactElement {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {sweeps.map((sweep) => {
        const total = sweep.byClaude ? CLAUDE_MS : CHRIS_MS;
        const perLine = total / Math.max(1, sweep.rects.length);
        return sweep.rects.map((r, i) => (
          <motion.div
            key={`${sweep.id}-${i}`}
            className="absolute origin-left rounded-[3px]"
            style={{
              left: r.x,
              top: r.y,
              width: r.w,
              height: r.h,
              background: `var(--hl-${sweep.color}-bg)`,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: perLine,
              delay: i * perLine,
              ease: EASE_SWEEP,
            }}
            onAnimationComplete={i === sweep.rects.length - 1 ? () => onFinish(sweep.id) : undefined}
          />
        ));
      })}
    </div>
  );
}
