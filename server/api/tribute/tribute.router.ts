import { z } from "zod";
import {
  router,
  protectedProcedure,
  adminProcedure,
} from "../../_core/trpc";
import {
  createTributePageSchema,
  updateTributePageSchema,
} from "./tribute.validators";
import {
  createTributePage,
  getTributePageBySlug,
  getTributePagesByUserId,
  getTributePageById,
  updateTributePage,
  deleteTributePage,
  adminDeleteTributePage,
  getAllTributePages, // Import this
} from "../../db";

export const tributeRouter = router({
  create: protectedProcedure
    .input(createTributePageSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const page = await createTributePage({ ...input, userId: user.id });
      return page;
    }),

  myPages: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const pages = await getTributePagesByUserId(user.id);
    return pages;
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const page = await getTributePageById(input.id);
      return page;
    }),

  bySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const page = await getTributePageBySlug(input.slug);
      return page;
    }),

  update: protectedProcedure
    .input(updateTributePageSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { id, ...data } = input;

      // Allow update if user is admin
      if (user.role !== 'admin') {
        const page = await getTributePageById(id);
        if (page?.userId !== user.id) {
          throw new Error("Unauthorized");
        }
      }

      const updatedPage = await updateTributePage(id, data);
      return updatedPage;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      await deleteTributePage(input.id, user.id);
      return { success: true };
    }),

  // Admin routes
  adminGetAll: adminProcedure.query(async () => {
    const pages = await getAllTributePages();
    return pages;
  }),

  adminDelete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await adminDeleteTributePage(input.id);
      return { success: true };
    }),

  adminPromote: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const updatedPage = await updateTributePage(input.id, { planType: "premium" });
      return updatedPage;
    }),
});
