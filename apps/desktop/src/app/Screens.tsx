import type { ReactElement } from "react";
import { AnimatePresence, motion } from "motion/react";

import type { AgentActivity } from "../claude/useAgentActivity";
import { ClaudeScreen } from "../claude/ClaudeScreen";
import { DecisionsScreen } from "../decisions/DecisionsScreen";
import { SheetScreen } from "../decisions/SheetScreen";
import { HighlightsScreen } from "../highlights/HighlightsScreen";
import { HomeScreen } from "../home/HomeScreen";
import { ProjectsScreen } from "../projects/ProjectsScreen";
import { SettingsScreen } from "../settings/SettingsScreen";
import { TagsScreen } from "../tags/TagsScreen";
import { ReaderScreen } from "../reader/ReaderScreen";
import { SourcesScreen } from "../sources/SourcesScreen";
import { EASE_OUT_SOFT } from "../shared/motion";
import type { Route } from "./navigation";
import { useNavigation } from "./navigation";

export interface ScreenActions {
  activity: AgentActivity;
  onFollow: () => void;
  onCapture: () => void;
  following: boolean;
  onToggleFollow: () => void;
}

function renderScreen(route: Route, actions: ScreenActions): ReactElement {
  switch (route.screen) {
    case "home":
      return <HomeScreen {...actions} />;
    case "highlights":
      return <HighlightsScreen />;
    case "projects":
      return <ProjectsScreen />;
    case "tags":
      return <TagsScreen />;
    case "settings":
      return <SettingsScreen />;
    case "claude":
      return (
        <ClaudeScreen
          activity={actions.activity}
          following={actions.following}
          onToggleFollow={actions.onToggleFollow}
        />
      );
    case "decisions":
      return <DecisionsScreen />;
    case "sheet":
      return <SheetScreen bookmarkId={route.bookmarkId} />;
    case "reader":
      return <ReaderScreen bookmarkId={route.bookmarkId} highlightId={route.highlightId} />;
    case "sources":
      return <SourcesScreen onCapture={actions.onCapture} />;
  }
}

export function Screens(actions: ScreenActions): ReactElement {
  const { route } = useNavigation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={JSON.stringify(route)}
        className="min-h-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.36, ease: EASE_OUT_SOFT }}
      >
        {renderScreen(route, actions)}
      </motion.div>
    </AnimatePresence>
  );
}
