
import { z } from "zod";

export const refundPaymentSchema = z.object({
  paymentIntentId: z.string(),
});

export const createCheckoutSessionSchema = z.object({
  plan: z.string(),
  tributeId: z.string(),
});
