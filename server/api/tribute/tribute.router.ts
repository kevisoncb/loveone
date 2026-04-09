import { protectedProcedure, router } from "../../_core/trpc";
import { createTributePageValidator } from "./tribute.validators";
import { createTributePageWithRetry } from "./tribute.service";
import { getTributePageBySlug, getTributePagesByUserId } from "../../db";
import { z } from "zod";

export const tributeRouter = router({
  /**
   * Creates a new tribute page for the authenticated user.
   */
  create: protectedProcedure
    .input(createTributePageValidator)
    .mutation(async ({ ctx, input }) => {
      const newPage = await createTributePageWithRetry(ctx.user.id, input);
      return newPage;
    }),

  /**
   * Gets all tribute pages belonging to the authenticated user.
   */
  myPages: protectedProcedure.query(async ({ ctx }) => {
    const pages = await getTributePagesByUserId(ctx.user.id);
    return pages;
  }),

  /**
   * Gets a single tribute page by its public slug.
   */
  getBySlug: protectedProcedure // Or `publicProcedure` if pages can be viewed by anyone
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const page = await getTributePageBySlug(input.slug);
      if (!page) {
        // Handle not found case
        return null;
      }
      // Here you might want to transform the data, e.g., parsing photoUrls
      return {
        ...page,
        photoUrls: JSON.parse(page.photoUrls || '[]'),
      };
    }),

  // NOTE: Other routes like `update`, `delete`, `uploadPhoto` would go here
});
