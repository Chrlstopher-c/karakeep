import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, inArray, isNotNull, sql } from "drizzle-orm";
import { z } from "zod";

import {
  agentActivity,
  apiKeys,
  bookmarkLinks,
  bookmarks,
} from "@karakeep/db/schema";
import {
  API_KEY_FULL_ACCESS_SCOPE,
  apiKeyScopesGrantScope,
} from "@karakeep/shared/types/apiKeys";

import { generateApiKey } from "../auth";
import type { AuthedContext } from "../index";
import { authedProcedure, router } from "../index";

// Echo fork: read side of the agent activity log, and management of the API
// keys that act as an agent (their mutations are logged, see lib/agentActivity).

const CREATION_PATHS = ["bookmarks.createBookmark", "highlights.create"];

const zAgentName = z
  .string()
  .min(1)
  .max(32)
  .regex(/^[a-z0-9-]+$/);

export const zAgentActivitySchema = z.object({
  id: z.string(),
  agent: z.string(),
  path: z.string(),
  bookmarkId: z.string().nullable(),
  bookmarkTitle: z.string().nullable(),
  highlightId: z.string().nullable(),
  listId: z.string().nullable(),
  detail: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.date(),
});

function assertFullAccess(ctx: AuthedContext): void {
  const auth = ctx.auth;
  if (
    auth?.type === "apiKey" &&
    !apiKeyScopesGrantScope(auth.scopes, API_KEY_FULL_ACCESS_SCOPE)
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "A full access key is required to manage agent keys",
    });
  }
}

export const agentActivityAppRouter = router({
  list: authedProcedure
    .input(
      z.object({
        since: z.date().optional(),
        limit: z.number().int().min(1).max(200).default(50),
      }),
    )
    .output(z.object({ items: z.array(zAgentActivitySchema) }))
    .query(async ({ input, ctx }) => {
      const rows = await ctx.db
        .select({
          activity: agentActivity,
          title: bookmarks.title,
          linkTitle: bookmarkLinks.title,
        })
        .from(agentActivity)
        .leftJoin(bookmarks, eq(bookmarks.id, agentActivity.bookmarkId))
        .leftJoin(bookmarkLinks, eq(bookmarkLinks.id, agentActivity.bookmarkId))
        .where(
          and(
            eq(agentActivity.userId, ctx.user.id),
            // Timestamps have a one-second resolution: clients dedupe by id.
            input.since ? gte(agentActivity.createdAt, input.since) : undefined,
          ),
        )
        .orderBy(
          desc(agentActivity.createdAt),
          desc(sql`"agentActivity"."rowid"`),
        )
        .limit(input.limit);
      return {
        items: rows.map(({ activity, title, linkTitle }) => ({
          ...activity,
          bookmarkTitle: title ?? linkTitle ?? null,
          detail: activity.detail ?? null,
        })),
      };
    }),

  // Ids of what an agent created, so clients can mark it with the agent badge.
  provenance: authedProcedure
    .output(
      z.object({
        bookmarkIds: z.array(z.string()),
        highlightIds: z.array(z.string()),
      }),
    )
    .query(async ({ ctx }) => {
      const rows = await ctx.db
        .select({
          path: agentActivity.path,
          bookmarkId: agentActivity.bookmarkId,
          highlightId: agentActivity.highlightId,
        })
        .from(agentActivity)
        .where(
          and(
            eq(agentActivity.userId, ctx.user.id),
            inArray(agentActivity.path, CREATION_PATHS),
          ),
        );
      const bookmarkIds = new Set<string>();
      const highlightIds = new Set<string>();
      for (const row of rows) {
        if (row.path === "highlights.create" && row.highlightId) {
          highlightIds.add(row.highlightId);
        } else if (row.bookmarkId) {
          bookmarkIds.add(row.bookmarkId);
        }
      }
      return { bookmarkIds: [...bookmarkIds], highlightIds: [...highlightIds] };
    }),

  keys: authedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          agent: z.string().nullable(),
          createdAt: z.date(),
          lastUsedAt: z.date().nullable(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      return ctx.db
        .select({
          id: apiKeys.id,
          name: apiKeys.name,
          agent: apiKeys.agent,
          createdAt: apiKeys.createdAt,
          lastUsedAt: apiKeys.lastUsedAt,
        })
        .from(apiKeys)
        .where(eq(apiKeys.userId, ctx.user.id))
        .orderBy(desc(apiKeys.createdAt));
    }),

  setAgent: authedProcedure
    .input(z.object({ id: z.string(), agent: zAgentName.nullable() }))
    .mutation(async ({ input, ctx }) => {
      assertFullAccess(ctx);
      const res = await ctx.db
        .update(apiKeys)
        .set({ agent: input.agent })
        .where(and(eq(apiKeys.id, input.id), eq(apiKeys.userId, ctx.user.id)));
      if (res.changes === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
    }),

  revokeAgentKey: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      assertFullAccess(ctx);
      const res = await ctx.db
        .delete(apiKeys)
        .where(
          and(
            eq(apiKeys.id, input.id),
            eq(apiKeys.userId, ctx.user.id),
            isNotNull(apiKeys.agent),
          ),
        );
      if (res.changes === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
    }),

  createAgentKey: authedProcedure
    .input(z.object({ name: z.string().min(1).max(64), agent: zAgentName }))
    .output(z.object({ id: z.string(), name: z.string(), key: z.string() }))
    .mutation(async ({ input, ctx }) => {
      assertFullAccess(ctx);
      const created = await generateApiKey(input.name, ctx.user.id, ctx.db, [
        API_KEY_FULL_ACCESS_SCOPE,
      ]);
      await ctx.db
        .update(apiKeys)
        .set({ agent: input.agent })
        .where(eq(apiKeys.id, created.id));
      return { id: created.id, name: created.name, key: created.key };
    }),
});
