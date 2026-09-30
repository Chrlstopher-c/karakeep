import type { ReactElement } from "react";
import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";

import { CaptureDialog } from "../capture/CaptureDialog";
import { useAgentActivity } from "../claude/useAgentActivity";
import { useFollow } from "../claude/useFollow";
import {
  serverLabel,
  useActiveConnection,
} from "../connection/ConnectionContext";
import { Palette } from "../palette/Palette";
import { ErrorBoundary } from "./ErrorBoundary";
import { FollowBanner } from "./FollowBanner";
import { useNavigation } from "./navigation";
import { OfflineBanner } from "./OfflineBanner";
import { Screens } from "./Screens";
import { ScrollContext } from "./scroll";
import { Sidebar } from "./Sidebar";
import { Titlebar } from "./Titlebar";
import { Toasts, useToasts } from "./Toasts";
import { useCaptureShortcut } from "./useCaptureShortcut";
import { useOverlays } from "./useOverlays";
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
  const { toasts, notify, dismiss } = useToasts();
  const o = useOverlays(follow, notify);
  useShortcuts({
    openPalette: o.openPalette,
    openCapture: o.openCapture,
    toggleFollow: o.toggleFollow,
    escape: o.escape,
  });
  useCaptureShortcut(o.openCapture);

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
        <Titlebar onOpenPalette={o.openPalette} />
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
              onStop={o.stopFollow}
            />
          )}
        </AnimatePresence>
        <div
          ref={scrollRef}
          className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
        >
          <ScrollContext.Provider value={scrollRef}>
            <ErrorBoundary resetKey={JSON.stringify(route)}>
              <Screens
                activity={activity}
                onFollow={follow.start}
                onCapture={o.openCapture}
                following={follow.following}
                onToggleFollow={o.toggleFollow}
              />
            </ErrorBoundary>
          </ScrollContext.Provider>
        </div>
        <Toasts toasts={toasts} dismiss={dismiss} />
      </main>
      <AnimatePresence>
        {o.palette && (
          <ErrorBoundary key="palette">
            <Palette
              onClose={o.closePalette}
              onCapture={o.openCapture}
              onToggleFollow={o.toggleFollow}
            />
          </ErrorBoundary>
        )}
        {o.capture && (
          <CaptureDialog
            key="capture"
            onClose={o.closeCapture}
            onSaved={(m) => notify(m)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
