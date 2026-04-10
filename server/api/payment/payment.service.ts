
import Stripe from 'stripe';
import { updatePaymentStatus, createPayment } from '../../db';
import { ENV } from '../../_core/env';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

// New function to calculate price based on plan and payment method
const calculatePrice = (plan: string, paymentMethod: 'card' | 'pix'): { unitAmount: number, dbAmount: number } => {
  const basePrice = plan === 'essential' ? 2990 : 4990; // 29.90 and 49.90 in cents

  if (paymentMethod === 'pix') {
    const discountedPrice = basePrice * 0.9;
    return {
      unitAmount: Math.round(discountedPrice), // Stripe needs an integer
      dbAmount: discountedPrice / 100, // Store as float in DB
    };
  }

  return {
    unitAmount: basePrice,
    dbAmount: basePrice / 100,
  };
};

export async function createCheckoutSession(
  plan: string,
  tributeId: string,
  paymentMethod: 'card' | 'pix'
): Promise<Stripe.Checkout.Session> {

  const { unitAmount, dbAmount } = calculatePrice(plan, paymentMethod);

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: [paymentMethod],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: `Plano ${plan === 'essential' ? 'Essencial' : 'Premium'} ${paymentMethod === 'pix' ? '(Pix)' : ''}`.trim(),
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${ENV.publicUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${ENV.publicUrl}/payment/cancel`,
    metadata: {
      tributeId,
      plan,
    },
  };

  // Add specific options for Pix
  if (paymentMethod === 'pix') {
    sessionConfig.payment_method_options = {
      pix: {
        expires_after_seconds: 3600, // QR code valid for 1 hour
      },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  // Create a pending payment record in the database
  await createPayment({
    paymentIntentId: session.id, // Using session ID as the initial reference
    tributeId,
    amount: dbAmount,
    status: 'pending',
    planType: plan,
    paymentMethod: paymentMethod, // Store the selected payment method
  });

  return session;
}

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
