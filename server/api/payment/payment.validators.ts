
import { z } from 'zod';

export const refundPaymentSchema = z.object({
  paymentIntentId: z.string(),
});
