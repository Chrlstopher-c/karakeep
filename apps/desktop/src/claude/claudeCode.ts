import { invoke } from "@tauri-apps/api/core";

export interface McpStatus {
  configured: boolean;
  command: string | null;
  address: string | null;
  managedBySavoir: boolean;
  cliAvailable: boolean;
}

const IN_TAURI = "__TAURI_INTERNALS__" in window;

// Hors de Tauri (test de l'interface dans un navigateur) : rien n'est lu ni écrit.
export async function mcpStatus(): Promise<McpStatus> {
  if (!IN_TAURI)
    return {
      configured: false,
      command: null,
      address: null,
      managedBySavoir: false,
      cliAvailable: false,
    };
  return invoke<McpStatus>("claude_mcp_status");
}

export async function installMcp(
  address: string,
  apiKey: string,
): Promise<void> {
  if (!IN_TAURI) throw new Error("Disponible seulement dans l'app Savoir.");
  await invoke("claude_mcp_install", { address, apiKey });
}

export const MCP_TOOLS: { group: string; items: string[] }[] = [
  {
    group: "LECTURE",
    items: [
      "search-bookmarks",
      "get-bookmark",
      "get-bookmark-content",
      "get-asset",
    ],
  },
  {
    group: "AJOUT",
    items: [
      "create-bookmark",
      "update-bookmark",
      "upload-asset",
      "delete-bookmark",
    ],
  },
  {
    group: "SURLIGNAGE",
    items: [
      "highlight-quote",
      "create-highlight",
      "update-highlight",
      "delete-highlight",
      "get-highlight",
      "get-bookmark-highlights",
      "list-highlights",
    ],
  },
  {
    group: "LISTES",
    items: [
      "get-lists",
      "get-list",
      "get-list-bookmarks",
      "get-bookmark-lists",
      "create-list",
      "update-list",
      "delete-list",
      "add-bookmark-to-list",
      "remove-bookmark-from-list",
    ],
  },
  {
    group: "TAGS",
    items: [
      "get-tags",
      "get-tag",
      "get-tag-bookmarks",
      "attach-tag-to-bookmark",
      "detach-tag-from-bookmark",
      "update-tag",
      "delete-tag",
    ],
  },
];

export const MCP_TOOL_COUNT = MCP_TOOLS.reduce((n, g) => n + g.items.length, 0);
