import { openUrl } from "@tauri-apps/plugin-opener";

import { log } from "./log";

export function openExternal(url: string): void {
  if (!/^https?:\/\//i.test(url)) return;
  openUrl(url).catch((cause: unknown) =>
    log.error(`ouverture de ${url}`, cause),
  );
}
