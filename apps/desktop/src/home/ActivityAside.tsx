import type { ReactElement } from "react";

import { useNavigation } from "../app/navigation";
import { useOpenBookmark } from "../knowledge/useOpenBookmark";
import { activityTarget, activityVerb } from "../claude/describeActivity";
import type { AgentActivity } from "../claude/useAgentActivity";
import { clockTime, relativeTime } from "../shared/time";

const SHOWN = 6;

export function ActivityAside({
  activity,
}: {
  activity: AgentActivity;
}): ReactElement {
  const { go } = useNavigation();
  const { open } = useOpenBookmark();
  const status = activity.busy
    ? "au travail…"
    : activity.lastAt
      ? `au repos · ${relativeTime(activity.lastAt)}`
      : "";
  return (
    <aside className="bg-surface flex min-w-0 max-w-[440px] flex-[1_1_300px] flex-col gap-1 rounded-[28px] px-3.5 pb-3.5 pt-[22px] shadow-ring">
      <div className="flex items-center gap-3 px-2.5 pb-3">
        <span className="relative size-2.5 flex-none">
          <span className="absolute inset-0 rounded-full bg-accent" />
          {activity.busy && (
            <span className="absolute inset-0 animate-[sv-ping_1.4s_cubic-bezier(.2,.7,.2,1)_infinite] rounded-full border-[1.5px] border-accent" />
          )}
        </span>
        <h2 className="text-text m-0 flex-1 text-[19px] font-extrabold leading-[1.2] tracking-[-0.025em]">
          Activité de Claude
        </h2>
        <span className="font-mono text-[11px] leading-none text-muted">
          {status}
        </span>
      </div>
      {activity.items.length === 0 && (
        <p className="m-0 px-2.5 pb-2 text-sm text-muted">
          Claude n’a encore rien fait dans la base.
        </p>
      )}
      {activity.items.slice(0, SHOWN).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() =>
            item.bookmarkId &&
            open(item.bookmarkId, item.highlightId ?? undefined)
          }
          className="text-soft hover:bg-surface-2 flex cursor-pointer items-start gap-3.5 rounded-[14px] border-0 bg-transparent p-2.5 text-left"
        >
          <span className="w-11 flex-none pt-0.5 font-mono text-[12px] leading-[1.4] text-muted">
            {clockTime(item.createdAt)}
          </span>
          <span className="min-w-0 flex-1 text-pretty text-sm font-medium leading-[1.45]">
            {activityVerb(item)}{" "}
            <span className="text-text font-bold">{activityTarget(item)}</span>
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => go({ screen: "claude" })}
        className="bg-surface-2 text-soft hover:bg-surface-3 hover:text-text mx-2.5 mb-1 mt-2 h-10 cursor-pointer rounded-[10px] border-0 text-sm font-bold"
      >
        Voir le journal complet
      </button>
    </aside>
  );
}
