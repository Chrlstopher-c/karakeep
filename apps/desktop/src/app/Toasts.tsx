import type { ReactElement } from "react";
import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { EASE_OUT_SOFT } from "../shared/motion";

export interface Toast {
  id: number;
  text: string;
  action?: { label: string; run: () => void };
}

const TOAST_MS = 6_000;

export function useToasts(): {
  toasts: Toast[];
  notify: (text: string, action?: Toast["action"]) => void;
  dismiss: (id: number) => void;
} {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(0);
  const dismiss = useCallback(
    (id: number) => setToasts((t) => t.filter((x) => x.id !== id)),
    [],
  );
  const notify = useCallback(
    (text: string, action?: Toast["action"]) => {
      next.current += 1;
      const id = next.current;
      setToasts((t) => [...t.slice(-2), { id, text, action }]);
      setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss],
  );
  return { toasts, notify, dismiss };
}

export function Toasts({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: number) => void;
}): ReactElement {
  return (
    <div className="pointer-events-none absolute bottom-5 right-5 z-[7] flex flex-col items-end gap-2.5">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            role="status"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: EASE_OUT_SOFT }}
            className="bg-pop shadow-menu pointer-events-auto flex max-w-[420px] items-center gap-3 rounded-[18px] py-3 pl-4 pr-3"
          >
            <span className="size-2 flex-none rounded-full bg-accent" />
            <span className="text-text flex-1 text-sm font-semibold leading-[1.4]">
              {t.text}
            </span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.run();
                  dismiss(t.id);
                }}
                className="bg-surface-3 text-text h-8 cursor-pointer rounded-[10px] border-0 px-3 text-[13px] font-bold"
              >
                {t.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
