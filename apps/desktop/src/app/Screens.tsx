import type { ReactElement } from "react";
import { AnimatePresence, motion } from "motion/react";

import type { AgentActivity } from "../claude/useAgentActivity";
import { ClaudeScreen } from "../claude/ClaudeScreen";
import { DecisionsScreen } from "../decisions/DecisionsScreen";
import { SheetScreen } from "../decisions/SheetScreen";
import { HomeScreen } from "../home/HomeScreen";
import { ReaderScreen } from "../reader/ReaderScreen";
import { SourcesScreen } from "../sources/SourcesScreen";
import { Eyebrow } from "../shared/Eyebrow";
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

// Écrans pas encore portés depuis la maquette.
function Pending({ title }: { title: string }): ReactElement {
  return (
    <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-10 pt-9">
      <Eyebrow>EN COURS DE PORTAGE</Eyebrow>
      <h1 className="text-text m-0 text-[28px] font-extrabold tracking-[-0.035em]">
        {title}
      </h1>
    </div>
  );
}

function renderScreen(route: Route, actions: ScreenActions): ReactElement {
  switch (route.screen) {
    case "home":
      return <HomeScreen {...actions} />;
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
      return (
        <ReaderScreen
          bookmarkId={route.bookmarkId}
          highlightId={route.highlightId}
        />
      );
    case "sources":
      return <SourcesScreen onCapture={actions.onCapture} />;
    default:
      return <Pending title={route.screen} />;
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
