import type { ReactElement } from "react";
import { useMemo } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";

import { TRPCSettingsProvider } from "@karakeep/shared-react/providers/trpc-provider";

import { ConnectionContext } from "../connection/ConnectionContext";
import { ConnectionScreen } from "../connection/ConnectionScreen";
import type { Connection } from "../connection/connection-store";
import { useConnection } from "../connection/useConnection";
import { NavigationProvider } from "./navigation";
import { Shell } from "./Shell";
import { useTheme } from "./useTheme";

function ConnectedApp({
  connection,
  onDisconnect,
}: {
  connection: Connection;
  onDisconnect: () => void;
}): ReactElement {
  const active = useMemo(
    () => ({ ...connection, disconnect: onDisconnect }),
    [connection, onDisconnect],
  );
  return (
    <ConnectionContext.Provider value={active}>
      <TRPCSettingsProvider settings={connection}>
        <NavigationProvider>
          <Shell />
        </NavigationProvider>
      </TRPCSettingsProvider>
    </ConnectionContext.Provider>
  );
}

export function App(): ReactElement {
  const { state, connect, disconnect } = useConnection();
  useTheme();
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {state.status === "missing" && (
          <ConnectionScreen key="connexion" onConnect={connect} />
        )}
        {state.status === "ready" && (
          <ConnectedApp
            key="app"
            connection={state.connection}
            onDisconnect={() => void disconnect()}
          />
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
