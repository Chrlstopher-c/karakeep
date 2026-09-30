import type { ReactElement } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useOpenBookmark } from "../knowledge/useOpenBookmark";
import { Kbd } from "../shared/Kbd";
import { EASE_SPRING } from "../shared/motion";
import { clockTime, dayLabel } from "../shared/time";
import { activityTarget, activityVerb } from "./describeActivity";
import type { AgentActivityItem } from "./useAgentActivity";

function groupByDay(items: AgentActivityItem[]): { day: string; items: AgentActivityItem[] }[] {
  const groups: { day: string; items: AgentActivityItem[] }[] = [];
  for (const item of items) {
    const day = dayLabel(item.createdAt);
    const last = groups[groups.length - 1];
    if (last?.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }
  return groups;
}

export function ActivityJournal({
  items,
  following,
  onToggleFollow,
}: {
  items: AgentActivityItem[];
  following: boolean;
  onToggleFollow: () => void;
}): ReactElement {
  const { open } = useOpenBookmark();
  return (
    <div className="bg-surface flex min-w-0 max-w-[480px] flex-[1_1_360px] flex-col gap-1 rounded-[28px] px-3.5 pb-3.5 pt-[22px] shadow-ring">
      <div className="flex items-center gap-3 px-2.5 pb-2.5">
        <h2 className="text-text m-0 flex-1 text-[19px] font-extrabold leading-[1.2] tracking-[-0.025em]">
          Journal d’activité
        </h2>
        <button
          type="button"
          onClick={onToggleFollow}
          className="bg-surface-2 text-text hover:bg-surface-3 flex h-[34px] cursor-pointer items-center gap-2 rounded-[10px] border-0 pl-3 pr-2 text-[13px] font-bold"
        >
          {following ? "Arrêter le suivi" : "Suivre Claude"}
          <Kbd>F</Kbd>
        </button>
      </div>
      {items.length === 0 && (
        <p className="m-0 px-2.5 py-2 text-sm text-muted">Aucune action de Claude pour l’instant.</p>
      )}
      {groupByDay(items).map((g) => (
        <div key={g.day} className="flex flex-col gap-1">
          <div className="px-2.5 pb-1.5 pt-3.5 font-mono text-[11px] leading-none tracking-[0.14em] text-muted">
            {g.day}
          </div>
          <AnimatePresence initial={false}>
            {g.items.map((a) => (
              <motion.button
                key={a.id}
                type="button"
                layout
                initial={{ opacity: 0, y: -14, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.56, ease: EASE_SPRING }}
                onClick={() => a.bookmarkId && open(a.bookmarkId, a.highlightId ?? undefined)}
                className="text-soft hover:bg-surface-2 flex cursor-pointer items-start gap-3.5 rounded-[14px] border-0 bg-transparent p-2.5 text-left"
              >
                <span className="w-11 flex-none pt-0.5 font-mono text-[12px] leading-[1.4] text-muted">
                  {clockTime(a.createdAt)}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium leading-[1.45]">
                  {activityVerb(a)} <span className="text-text font-bold">{activityTarget(a)}</span>
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
