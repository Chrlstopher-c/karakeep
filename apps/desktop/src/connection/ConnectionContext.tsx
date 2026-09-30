import { createContext, useContext } from "react";

import type { Connection } from "./connection-store";

export interface ActiveConnection extends Connection {
  disconnect: () => void;
}

export const ConnectionContext = createContext<ActiveConnection | null>(null);

export function useActiveConnection(): ActiveConnection {
  const connection = useContext(ConnectionContext);
  if (!connection) throw new Error("useActiveConnection hors d'une connexion active");
  return connection;
}

export function serverLabel(address: string): string {
  try {
    return new URL(address).host;
  } catch {
    return address;
  }
}
