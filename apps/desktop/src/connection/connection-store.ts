import { invoke } from "@tauri-apps/api/core";

import { log } from "../shared/log";

export interface Connection {
  address: string;
  apiKey: string;
}

export function normalizeAddress(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

// Hors de Tauri (vite dev ouvert dans un navigateur, pour tester l'interface) :
// la connexion vit dans le stockage du navigateur. Jamais en build de production.
const BROWSER_DEV = import.meta.env.DEV && !("__TAURI_INTERNALS__" in window);
const DEV_KEY = "savoir.dev.connection";

function readDevConnection(): Connection | null {
  try {
    const raw = localStorage.getItem(DEV_KEY);
    return raw ? (JSON.parse(raw) as Connection) : null; // écrit par saveConnection ci-dessous
  } catch {
    return null;
  }
}

async function fetchDevConnection(): Promise<Connection | null> {
  try {
    const res = await fetch("/__savoir/dev-connection");
    return res.ok ? ((await res.json()) as Connection) : null; // fichier écrit par save_connection (Rust)
  } catch {
    return null;
  }
}

export async function loadConnection(): Promise<Connection | null> {
  if (BROWSER_DEV) return readDevConnection() ?? (await fetchDevConnection());
  try {
    return await invoke<Connection | null>("load_connection");
  } catch (cause) {
    log.error("lecture de la connexion", cause);
    return null;
  }
}

export async function saveConnection(connection: Connection): Promise<void> {
  if (BROWSER_DEV) return localStorage.setItem(DEV_KEY, JSON.stringify(connection));
  await invoke("save_connection", { connection });
}

export async function forgetConnection(): Promise<void> {
  if (BROWSER_DEV) return localStorage.removeItem(DEV_KEY);
  await invoke("forget_connection");
}

// Vérifie l'adresse et la clé avant de les enregistrer (API REST : GET /api/v1/users/me).
export async function checkConnection(connection: Connection): Promise<string | null> {
  try {
    const res = await fetch(`${connection.address}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${connection.apiKey}` },
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status === 401 || res.status === 403) return "Clé API refusée par le serveur.";
    if (!res.ok) return `Le serveur répond ${res.status}.`;
    return null;
  } catch (cause) {
    log.warn(`serveur injoignable (${connection.address}) : ${String(cause)}`);
    return "Serveur injoignable à cette adresse.";
  }
}
