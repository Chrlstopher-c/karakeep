import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";

import { TRPCSettingsProvider } from "@karakeep/shared-react/providers/trpc-provider";

import { ConnectionContext } from "../connection/ConnectionContext";
import { ConnectionScreen } from "../connection/ConnectionScreen";
import type { Connection } from "../connection/connection-store";
import { useConnection } from "../connection/useConnection";
import { LaunchScreen } from "./LaunchScreen";
import { NavigationProvider } from "./navigation";
import { Shell } from "./Shell";
import { ThemeContext, useTheme } from "./useTheme";

function ConnectedApp({
  connection,
  onDisconnect,
}: {
  connection: Connection;
  onDisconnect: () => void;
}): ReactElement {
  const { address, apiKey } = connection;
  // Un seul client tRPC par couple adresse/clé, même si la connexion est relue.
  const settings = useMemo(() => ({ address, apiKey }), [address, apiKey]);
  const active = useMemo(
    () => ({ ...settings, disconnect: onDisconnect }),
    [settings, onDisconnect],
  );
  return (
    <ConnectionContext.Provider value={active}>
      <TRPCSettingsProvider settings={settings}>
        <NavigationProvider>
          <Shell />
        </NavigationProvider>
      </TRPCSettingsProvider>
    </ConnectionContext.Provider>
  );
}

export function App(): ReactElement {
  const { state, connect, disconnect } = useConnection();
  const onDisconnect = useCallback(() => void disconnect(), [disconnect]);
  const theme = useTheme();
  const [launching, setLaunching] = useState(true);
  const endLaunch = useCallback(() => setLaunching(false), []);
  return (
    <ThemeContext.Provider value={theme}>
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait">
          {state.status === "missing" && (
            <ConnectionScreen key="connexion" onConnect={connect} />
          )}
          {state.status === "ready" && (
            <ConnectedApp
              key="app"
              connection={state.connection}
              onDisconnect={onDisconnect}
            />
          )}
        </AnimatePresence>
        {launching && <LaunchScreen onDone={endLaunch} />}
      </MotionConfig>
    </ThemeContext.Provider>
  );
}
