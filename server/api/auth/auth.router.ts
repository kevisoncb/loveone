import { publicProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import { syncUserWithFirebase } from "./auth.service";

export const authRouter = router({
  /**
   * Returns the currently authenticated user's data.
   */
  me: publicProcedure.query(opts => opts.ctx.user),

  /**
   * Synchronizes the user from the provided Firebase ID token with the database.
   */
  syncUser: publicProcedure
    .input(z.object({ idToken: z.string() }))
    .mutation(async ({ input }) => {
      // The service layer handles the complex logic of safely creating/updating the user.
      const user = await syncUserWithFirebase(input.idToken);
      return user;
    }),
});
