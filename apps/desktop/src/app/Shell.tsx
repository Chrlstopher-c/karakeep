import type { ReactElement } from "react";
import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";

import { useFollow } from "../claude/useFollow";
import { useAgentActivity } from "../claude/useAgentActivity";
import {
  serverLabel,
  useActiveConnection,
} from "../connection/ConnectionContext";
import { FollowBanner } from "./FollowBanner";
import { useNavigation } from "./navigation";
import { OfflineBanner } from "./OfflineBanner";
import { Screens } from "./Screens";
import { ScrollContext } from "./scroll";
import { Sidebar } from "./Sidebar";
import { Titlebar } from "./Titlebar";
import { useServerHealth } from "./useServerHealth";
import { useShortcuts } from "./useShortcuts";

export function Shell(): ReactElement {
  const connection = useActiveConnection();
  const { route } = useNavigation();
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activity = useAgentActivity();
  const follow = useFollow(activity.items);
  const health = useServerHealth(connection.address);
  const label = serverLabel(connection.address);
  const openCapture = (): void => undefined;
  const openPalette = (): void => undefined;

  useShortcuts({
    openPalette,
    openCapture,
    toggleFollow: follow.toggle,
    escape: () => (follow.following ? (follow.stop(), true) : false),
  });

  return (
    <div className="bg-bg text-text relative flex h-screen min-h-[640px] min-w-[960px] overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        activity={activity}
        dimmed={route.screen === "reader" || route.screen === "sheet"}
        serverLabel={label}
        online={health.online}
      />
      <main className="relative flex min-w-0 flex-1 flex-col">
        <Titlebar onOpenPalette={openPalette} />
        <AnimatePresence>
          {!health.online && (
            <OfflineBanner
              key="offline"
              serverLabel={label}
              retrying={health.retrying}
              onRetry={health.retry}
            />
          )}
          {follow.following && (
            <FollowBanner
              key="follow"
              status={follow.status}
              busy={activity.busy}
              onStop={() => follow.stop()}
            />
          )}
        </AnimatePresence>
        <div
          ref={scrollRef}
          className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
        >
          <ScrollContext.Provider value={scrollRef}>
            <Screens
              activity={activity}
              onFollow={follow.start}
              onCapture={openCapture}
            />
          </ScrollContext.Provider>
        </div>
      </main>
    </div>
  );
}
