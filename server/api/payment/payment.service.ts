
import Stripe from 'stripe';
import { updatePaymentStatus } from '../../db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

export async function refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    // Update payment status in the database
    await updatePaymentStatus(paymentIntentId, 'refunded', '');

    return refund;
  } catch (error: any) {
    console.error('Error refunding payment:', error);
    throw new Error('Failed to refund payment.');
  }
}
