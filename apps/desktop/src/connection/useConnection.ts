import { useCallback, useEffect, useState } from "react";

import type { Connection } from "./connection-store";
import {
  forgetConnection,
  loadConnection,
  saveConnection,
} from "./connection-store";

export type ConnectionState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "ready"; connection: Connection };

export interface UseConnection {
  state: ConnectionState;
  connect: (connection: Connection) => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useConnection(): UseConnection {
  const [state, setState] = useState<ConnectionState>({ status: "loading" });

  useEffect(() => {
    void loadConnection().then((connection) =>
      setState(
        connection ? { status: "ready", connection } : { status: "missing" },
      ),
    );
  }, []);

  const connect = useCallback(async (connection: Connection) => {
    await saveConnection(connection);
    setState({ status: "ready", connection });
  }, []);

  const disconnect = useCallback(async () => {
    await forgetConnection();
    setState({ status: "missing" });
  }, []);

  return { state, connect, disconnect };
}
