import { and, desc, eq, lt } from "drizzle-orm";
import { z } from "zod";

import { userReadingProgress } from "@karakeep/db/schema";

import { authedProcedure, router } from "../index";

// Echo fork: read side of reading progress (the upstream router only writes it),
// used by the desktop client for « Reprendre la lecture ».

const FINISHED_PERCENT = 95;

const zProgressSchema = z.object({
  bookmarkId: z.string(),
  offset: z.number(),
  anchor: z.string().nullable(),
  percent: z.number().nullable(),
  modifiedAt: z.date().nullable(),
});

function toProgress(
  row: typeof userReadingProgress.$inferSelect,
): z.infer<typeof zProgressSchema> {
  return {
    bookmarkId: row.bookmarkId,
    offset: row.readingProgressOffset,
    anchor: row.readingProgressAnchor,
    percent: row.readingProgressPercent,
    modifiedAt: row.modifiedAt,
  };
}

export const readingProgressAppRouter = router({
  get: authedProcedure
    .input(z.object({ bookmarkId: z.string() }))
    .output(zProgressSchema.nullable())
    .query(async ({ input, ctx }) => {
      const row = await ctx.db.query.userReadingProgress.findFirst({
        where: and(
          eq(userReadingProgress.userId, ctx.user.id),
          eq(userReadingProgress.bookmarkId, input.bookmarkId),
        ),
      });
      return row ? toProgress(row) : null;
    }),

  // Most recently read bookmark that is not finished yet.
  current: authedProcedure
    .output(zProgressSchema.nullable())
    .query(async ({ ctx }) => {
      const row = await ctx.db.query.userReadingProgress.findFirst({
        where: and(
          eq(userReadingProgress.userId, ctx.user.id),
          lt(userReadingProgress.readingProgressPercent, FINISHED_PERCENT),
        ),
        orderBy: desc(userReadingProgress.modifiedAt),
      });
      return row ? toProgress(row) : null;
    }),
});
