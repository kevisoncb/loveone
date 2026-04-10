
import Stripe from "stripe";
import { Response } from "express";
import { getTributePageById, updatePaymentStatus } from "../db";
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
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.id) {
          await updatePaymentStatus(session.id, "completed");

          if (session.metadata?.tributeId && session.metadata?.plan) {
            const tributePage = await getTributePageById(session.metadata.tributeId);
            if (tributePage) {
              await notifyOwner({
                title: "Pagamento recebido! 🎉",
                content: `${tributePage.name} adquiriu o Plano ${session.metadata.plan === "premium" ? "Premium" : "Essencial"}`,
              }).catch(() => {});
            }
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        if (paymentIntent.id) {
          await updatePaymentStatus(paymentIntent.id, "failed");
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
