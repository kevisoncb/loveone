import { router } from "../_core/trpc";
import { authRouter } from "./auth/auth.router";
import { tributeRouter } from "./tribute/tribute.router";
import { paymentRouter } from "./payment/payment.router";

/**
 * This is the primary router for your entire server.
 *
 * All routers added in /api must be manually added here.
 */
export const appRouter = router({
  auth: authRouter,
  tribute: tributeRouter,
  payment: paymentRouter,
});

// Export type signature to be used in the client.
export type AppRouter = typeof appRouter;
