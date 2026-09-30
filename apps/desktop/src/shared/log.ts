import { error, info, warn } from "@tauri-apps/plugin-log";

// Journal unifié : les messages du webview partent dans le fichier de logs Rust.
function send(
  write: (message: string) => Promise<void>,
  message: string,
): void {
  write(message).catch((cause: unknown) => {
    console.error("[savoir] journal indisponible", cause, message);
  });
}

export const log = {
  info: (message: string): void => send(info, message),
  warn: (message: string): void => send(warn, message),
  error: (message: string, cause?: unknown): void =>
    send(error, cause ? `${message} : ${String(cause)}` : message),
};
