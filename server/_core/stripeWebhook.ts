import Stripe from "stripe";
import { Response } from "express";
import { updatePaymentStatus } from "../db";
import { notifyOwner } from "./notification";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function handleStripeWebhook(req: any, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Stripe] Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Test event detection
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[Stripe] Checkout session completed:", session.id);

        // Update payment status using session ID
        if (session.id) {
          await updatePaymentStatus(session.id, "completed", session.customer_email || "");
          
          // Notify owner about successful payment
          if (session.metadata?.customer_name && session.metadata?.plan_type) {
            await notifyOwner({
              title: "Pagamento recebido! 🎉",
              content: `${session.metadata.customer_name} adquiriu o Plano ${session.metadata.plan_type === "premium" ? "Premium" : "Essencial"}`,
            }).catch(() => {});
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Stripe] Payment intent succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Stripe] Payment intent failed:", paymentIntent.id);

        if (paymentIntent.id) {
          await updatePaymentStatus(paymentIntent.id, "failed", "");
        }
        break;
      }

      default:
        console.log("[Stripe] Unhandled event type:", event.type);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("[Stripe] Webhook processing error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
