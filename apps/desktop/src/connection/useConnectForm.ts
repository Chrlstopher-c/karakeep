import type { FormEvent } from "react";
import { useState } from "react";

import type { Connection } from "./connection-store";
import { checkConnection, normalizeAddress } from "./connection-store";

export interface ConnectForm {
  address: string;
  apiKey: string;
  error: string | null;
  busy: boolean;
  setAddress: (value: string) => void;
  setApiKey: (value: string) => void;
  submit: (event: FormEvent) => Promise<void>;
}

export function useConnectForm(onConnect: (c: Connection) => Promise<void>): ConnectForm {
  const [address, setAddress] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const connection = {
      address: normalizeAddress(address),
      apiKey: apiKey.trim(),
    };
    setBusy(true);
    setError(null);
    const problem = await checkConnection(connection);
    if (problem) setError(problem);
    else await onConnect(connection).catch(() => setError("Impossible d'enregistrer la connexion."));
    setBusy(false);
  }

  return { address, apiKey, error, busy, setAddress, setApiKey, submit };
}
