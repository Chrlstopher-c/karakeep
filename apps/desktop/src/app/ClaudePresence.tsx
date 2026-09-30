import type { ReactElement } from "react";

import { Kbd } from "../shared/Kbd";
import { relativeTime } from "../shared/time";
import type { AgentActivity } from "../claude/useAgentActivity";

export function ClaudePresence({
  activity,
  collapsed,
  onOpen,
}: {
  activity: AgentActivity;
  collapsed: boolean;
  onOpen: () => void;
}): ReactElement {
  const status = activity.busy
    ? "au travail…"
    : activity.lastAt
      ? `au repos · ${relativeTime(activity.lastAt)}`
      : "aucune action pour l'instant";
  return (
    <button
      type="button"
      onClick={onOpen}
      title="Activité de Claude"
      className={`mb-2 flex flex-none cursor-pointer items-center gap-3 rounded-[14px] border-0 bg-[#251E38] text-left text-[#F3F1F6] shadow-[0_0_0_1px_#362D4D] hover:bg-[#2E2644] ${collapsed ? "px-[13px] py-3.5" : "p-3"}`}
    >
      <span className="relative mx-0.5 size-2.5 flex-none">
        <span className="absolute inset-0 rounded-full bg-[#A774D4]" />
        {activity.busy && (
          <span className="absolute inset-0 animate-[sv-ping_1.4s_cubic-bezier(.2,.7,.2,1)_infinite] rounded-full border-[1.5px] border-[#A774D4]" />
        )}
      </span>
      {!collapsed && (
        <>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-sm font-bold leading-none">Claude</span>
            <span className="truncate font-mono text-[11px] leading-[1.3] text-[#A39DB5]">
              {status}
            </span>
          </span>
          <Kbd>F</Kbd>
        </>
      )}
    </button>
  );
}
