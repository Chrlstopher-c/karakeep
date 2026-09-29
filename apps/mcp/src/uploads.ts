import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import type { CallToolResult } from "@modelcontextprotocol/server";
import { z } from "zod";

import { addr, apiKey, karakeepClient, registerTool } from "./shared";
import { compactBookmark, toMcpToolError } from "./utils";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".html": "text/html",
  ".mp4": "video/mp4",
};

interface UploadedAsset {
  assetId: string;
  contentType: string;
  fileName: string;
}

async function uploadFile(filePath: string): Promise<UploadedAsset> {
  const contentType = CONTENT_TYPES[extname(filePath).toLowerCase()];
  if (!contentType) {
    throw new Error(
      `Unsupported file type. Allowed: ${Object.keys(CONTENT_TYPES).join(", ")} (convert SVG to PNG first).`,
    );
  }
  const form = new FormData();
  const bytes = await readFile(filePath);
  form.append(
    "file",
    new Blob([bytes], { type: contentType }),
    basename(filePath),
  );
  const res = await fetch(`${addr}/api/v1/assets`, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as UploadedAsset;
}

export const uploadAssetInputSchema = {
  filePath: z
    .string()
    .min(1)
    .describe(
      `Absolute path of a local file (png, jpg, webp, gif, pdf, html, mp4) readable by the MCP server.`,
    ),
  attachToBookmarkId: z
    .string()
    .optional()
    .describe(`Attach the uploaded file to this bookmark.`),
  attachAs: z
    .enum(["bannerImage", "userUploaded"])
    .optional()
    .describe(
      `How to attach it: bannerImage shows as the bookmark cover, userUploaded as an attachment. Defaults to userUploaded.`,
    ),
  createBookmark: z
    .boolean()
    .optional()
    .describe(`Create a standalone image/pdf bookmark from the file.`),
  title: z.string().optional().describe(`Title of the created bookmark.`),
};

export async function uploadAssetHandler(input: {
  filePath: string;
  attachToBookmarkId?: string;
  attachAs?: "bannerImage" | "userUploaded";
  createBookmark?: boolean;
  title?: string;
}): Promise<CallToolResult> {
  let asset: UploadedAsset;
  try {
    asset = await uploadFile(input.filePath);
  } catch (e) {
    console.error("[upload-asset]", e);
    return toMcpToolError(e instanceof Error ? e.message : String(e));
  }
  const lines = [
    `Asset: ${asset.assetId} (${asset.contentType})`,
    `Embed in a note: ![${asset.fileName}](/api/assets/${asset.assetId})`,
  ];
  if (input.attachToBookmarkId) {
    const res = await karakeepClient.POST(`/bookmarks/{bookmarkId}/assets`, {
      params: { path: { bookmarkId: input.attachToBookmarkId } },
      body: { id: asset.assetId, assetType: input.attachAs ?? "userUploaded" },
    });
    if (!res.data) {
      return toMcpToolError(res.error);
    }
    lines.push(`Attached to bookmark ${input.attachToBookmarkId}.`);
  }
  if (input.createBookmark) {
    const isPdf = asset.contentType === "application/pdf";
    const res = await karakeepClient.POST(`/bookmarks`, {
      body: {
        type: "asset",
        assetType: isPdf ? "pdf" : "image",
        assetId: asset.assetId,
        fileName: asset.fileName,
        title: input.title,
      },
    });
    if (!res.data) {
      return toMcpToolError(res.error);
    }
    lines.push(compactBookmark(res.data));
  }
  return { content: [{ type: "text", text: lines.join("\n") }] };
}

registerTool(
  "upload-asset",
  {
    description: `Upload a local image, PDF, HTML or video to Karakeep to illustrate the knowledge base: embed it in a note, attach it to a bookmark (cover or attachment), or save it as its own bookmark.`,
    inputSchema: z.object(uploadAssetInputSchema),
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  uploadAssetHandler,
);
