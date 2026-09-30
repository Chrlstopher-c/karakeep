import { invoke } from "@tauri-apps/api/core";

import { log } from "../shared/log";

export interface Connection {
  address: string;
  apiKey: string;
}

export function normalizeAddress(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

export async function loadConnection(): Promise<Connection | null> {
  try {
    return await invoke<Connection | null>("load_connection");
  } catch (cause) {
    log.error("lecture de la connexion", cause);
    return null;
  }
}

export async function saveConnection(connection: Connection): Promise<void> {
  await invoke("save_connection", { connection });
}

export async function forgetConnection(): Promise<void> {
  await invoke("forget_connection");
}

// Vérifie l'adresse et la clé avant de les enregistrer (API REST : GET /api/v1/users/me).
export async function checkConnection(
  connection: Connection,
): Promise<string | null> {
  try {
    const res = await fetch(`${connection.address}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${connection.apiKey}` },
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status === 401 || res.status === 403)
      return "Clé API refusée par le serveur.";
    if (!res.ok) return `Le serveur répond ${res.status}.`;
    return null;
  } catch (cause) {
    log.warn(`serveur injoignable (${connection.address}) : ${String(cause)}`);
    return "Serveur injoignable à cette adresse.";
  }
}
