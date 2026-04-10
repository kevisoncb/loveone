
import Stripe from "stripe";
import { Response } from "express";
import { getTributePageById, updatePaymentStatusBySessionId, updatePaymentStatusByPaymentIntentId } from "../db"; // Updated DB functions
import { notifyOwner } from "./notification";
import { ENV } from "./env";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2026-03-25.dahlia",
});

export async function handleStripeWebhook(req: any, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, ENV.stripeWebhookSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      // This event is triggered for both Card and Pix payments when the session is completed.
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // For Pix, the payment_intent is created after the session is completed.
        // For Cards, it's created immediately.
        const paymentIntentId = session.payment_intent as string;

        if (session.id) {
           // We use the session ID to find our internal payment record and update its status.
           await updatePaymentStatusBySessionId(session.id, "completed", paymentIntentId);
        }

        // Notify the owner about the new purchase
        if (session.metadata?.tributeId && session.metadata?.plan) {
          const tributePage = await getTributePageById(parseInt(session.metadata.tributeId));
          if (tributePage) {
            await notifyOwner({
              title: "Pagamento recebido! 🎉",
              content: `${tributePage.name} adquiriu o Plano ${session.metadata.plan === "premium" ? "Premium" : "Essencial"}`,
            }).catch(() => {});
          }
        }
        break;
      }

      // This event is an additional confirmation, especially for asynchronous payments like Pix.
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        if (paymentIntent.id) {
          await updatePaymentStatusByPaymentIntentId(paymentIntent.id, "completed");
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        if (paymentIntent.id) {
          await updatePaymentStatusByPaymentIntentId(paymentIntent.id, "failed");
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
