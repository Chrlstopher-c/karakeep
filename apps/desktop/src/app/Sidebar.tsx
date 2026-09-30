import type { ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";

import type { AgentActivity } from "../claude/useAgentActivity";
import { Icon } from "../shared/Icon";
import { ClaudePresence } from "./ClaudePresence";
import { useNavigation } from "./navigation";
import { NavButton, SETTINGS_ITEM, SidebarNav } from "./SidebarNav";
import { useNavCounts } from "./useNavCounts";

function initials(name: string | null | undefined): string {
  return (name ?? "?").slice(0, 2).toUpperCase();
}

function UserFooter({
  collapsed,
  serverLabel,
  online,
}: {
  collapsed: boolean;
  serverLabel: string;
  online: boolean;
}): ReactElement {
  const trpc = useTRPC();
  const me = useQuery(trpc.users.whoami.queryOptions());
  return (
    <div className="flex h-[60px] flex-none items-center gap-2.5 border-t border-[#362D4D] px-[18px]">
      <span className="grid size-[30px] flex-none place-items-center rounded-full bg-[#A774D4] text-[11px] font-extrabold text-white">
        {initials(me.data?.name)}
      </span>
      {!collapsed && (
        <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
          <span className="text-[13px] font-bold leading-none text-[#F3F1F6]">
            {me.data?.name ?? ""}
          </span>
          <span className="flex items-center gap-1.5 truncate font-mono text-[11px] leading-none text-[#A39DB5]">
            <span
              className={`size-1.5 flex-none rounded-full ${online ? "bg-[#3FB785]" : "bg-[#E0A94A]"}`}
            />
            {online ? serverLabel : `${serverLabel} · injoignable`}
          </span>
        </span>
      )}
    </div>
  );
}

export function Sidebar({
  collapsed,
  dimmed,
  onToggle,
  activity,
  serverLabel,
  online,
}: {
  collapsed: boolean;
  dimmed: boolean;
  onToggle: () => void;
  activity: AgentActivity;
  serverLabel: string;
  online: boolean;
}): ReactElement {
  const counts = useNavCounts();
  const { go } = useNavigation();
  return (
    <aside
      className={`relative z-[3] flex flex-none flex-col overflow-hidden border-r border-[#362D4D] bg-[#1E1830] ${collapsed ? "w-16" : "w-[248px]"}`}
    >
      <div
        className={`flex h-full flex-col transition-opacity duration-300 hover:opacity-100 ${dimmed ? "opacity-50" : "opacity-100"}`}
      >
        <div
          data-tauri-drag-region
          className="flex h-16 flex-none items-center gap-2.5 pl-[22px] pr-3"
        >
          {!collapsed && (
            <span
              data-tauri-drag-region
              className="flex-1 text-[22px] font-extrabold leading-none tracking-[-0.045em] text-[#F3F1F6]"
            >
              Savoir
            </span>
          )}
          <button
            type="button"
            onClick={onToggle}
            title="Replier ou déplier la barre latérale"
            className={`grid size-[30px] flex-none cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-[#A39DB5] hover:bg-[#2E2644] hover:text-[#F3F1F6] ${collapsed ? "-ml-[5px]" : ""}`}
          >
            <Icon name="sidebar" size={16} />
          </button>
        </div>
        <nav className="relative flex min-h-0 flex-1 flex-col gap-1 px-3 pb-3 pt-1">
          <SidebarNav
            collapsed={collapsed}
            counts={counts}
            claudeBusy={activity.busy}
          />
          <div className="flex-1" />
          <ClaudePresence
            activity={activity}
            collapsed={collapsed}
            onOpen={() => go({ screen: "claude" })}
          />
          <NavButton
            item={SETTINGS_ITEM}
            collapsed={collapsed}
            counts={counts}
          />
        </nav>
        <UserFooter
          collapsed={collapsed}
          serverLabel={serverLabel}
          online={online}
        />
      </div>
    </aside>
  );
}
