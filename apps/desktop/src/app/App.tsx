import type { ReactElement } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";

import { TRPCSettingsProvider } from "@karakeep/shared-react/providers/trpc-provider";

import { ConnectionScreen } from "../connection/ConnectionScreen";
import { useConnection } from "../connection/useConnection";
import { LibraryHome } from "../library/LibraryHome";

export function App(): ReactElement {
  const { state, connect, disconnect } = useConnection();
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {state.status === "missing" && (
          <ConnectionScreen key="connexion" onConnect={connect} />
        )}
        {state.status === "ready" && (
          <TRPCSettingsProvider key="bibliotheque" settings={state.connection}>
            <LibraryHome onDisconnect={() => void disconnect()} />
          </TRPCSettingsProvider>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
