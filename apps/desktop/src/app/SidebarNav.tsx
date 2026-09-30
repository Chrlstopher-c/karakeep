import type { ReactElement } from "react";
import { motion } from "motion/react";

import type { IconName } from "../shared/Icon";
import { Icon } from "../shared/Icon";
import { DAMPED } from "../shared/motion";
import type { ScreenId } from "./navigation";
import { activeNavId, useNavigation } from "./navigation";
import type { NavCounts } from "./useNavCounts";

interface NavItem {
  id: ScreenId;
  label: string;
  tip: string;
  count?: keyof NavCounts;
}

const GROUPS: { label?: string; items: NavItem[] }[] = [
  { items: [{ id: "home", label: "Accueil", tip: "Accueil" }] },
  {
    label: "LISTES",
    items: [
      {
        id: "decisions",
        label: "Décisions",
        tip: "Décisions · G D",
        count: "decisions",
      },
      {
        id: "sources",
        label: "Sources",
        tip: "Sources · G S",
        count: "sources",
      },
      { id: "projects", label: "Projets", tip: "Projets · G P" },
    ],
  },
  {
    label: "BASE",
    items: [
      {
        id: "highlights",
        label: "Surlignages",
        tip: "Surlignages · G H",
        count: "highlights",
      },
      { id: "tags", label: "Tags", tip: "Tags" },
    ],
  },
  {
    items: [{ id: "claude", label: "Claude", tip: "Claude et journal d'activité" }],
  },
];

export function NavButton({
  item,
  collapsed,
  counts,
  busy,
}: {
  item: NavItem;
  collapsed: boolean;
  counts: NavCounts;
  busy?: boolean;
}): ReactElement {
  const { route, go } = useNavigation();
  const active = activeNavId(route) === item.id;
  const count = item.count ? counts[item.count] : undefined;
  return (
    <button
      type="button"
      title={item.tip}
      onClick={() => go({ screen: item.id })}
      className={`relative flex h-10 flex-none cursor-pointer items-center gap-3 rounded-[10px] border-0 bg-transparent px-[11px] text-left text-sm font-semibold transition-colors hover:text-[#F3F1F6] ${active ? "text-[#F3F1F6]" : "text-[#C8C4D0]"}`}
    >
      {active && (
        <motion.span
          layoutId="nav-indicator"
          transition={DAMPED}
          className="absolute inset-0 rounded-[10px] bg-[#342B4A]"
        >
          <span className="absolute bottom-[9px] left-0 top-[9px] w-[3px] rounded-r-[3px] bg-[#A774D4]" />
        </motion.span>
      )}
      <span className="relative flex items-center">
        <Icon name={item.id as IconName} />
      </span>
      {!collapsed && <span className="relative flex-1 whitespace-nowrap">{item.label}</span>}
      {!collapsed && count !== undefined && (
        <span className="relative rounded-full bg-[#2E2644] px-[7px] py-1 font-mono text-[11px] leading-none text-[#A39DB5]">
          {count}
        </span>
      )}
      {busy && (
        <span className="absolute left-[25px] top-[9px] size-[7px] rounded-full bg-[#A774D4] shadow-[0_0_0_2px_#1E1830]" />
      )}
    </button>
  );
}

export function SidebarNav({
  collapsed,
  counts,
  claudeBusy,
}: {
  collapsed: boolean;
  counts: NavCounts;
  claudeBusy: boolean;
}): ReactElement {
  return (
    <>
      {GROUPS.map((group, i) => (
        <div key={i} className={`flex flex-col gap-1 ${i > 0 ? "mt-2.5" : ""}`}>
          {group.label && !collapsed && (
            <div className="flex h-[26px] items-end px-3 pb-1.5 font-mono text-[11px] leading-none tracking-[0.14em] text-[#8E86A3]">
              {group.label}
            </div>
          )}
          {group.items.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              collapsed={collapsed}
              counts={counts}
              busy={item.id === "claude" && claudeBusy}
            />
          ))}
        </div>
      ))}
    </>
  );
}

export const SETTINGS_ITEM: NavItem = {
  id: "settings",
  label: "Réglages",
  tip: "Réglages · ⌘/",
};
