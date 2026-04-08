import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  createTributePage,
  getTributePageBySlug,
  getTributePagesByUserId,
  getTributePageById,
  updateTributePage,
  deleteTributePage,
  createPayment,
  getPaymentsByUserId,
} from "./db";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";
import { PRODUCTS } from "./products";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

function generateSlug(): string {
  return nanoid(10);
}

function getPlanExpiry(planType: "essential" | "premium"): Date | null {
  if (planType === "premium") return null;
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);
  return expiry;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  tribute: router({
    myPages: protectedProcedure.query(async ({ ctx }) => {
      return getTributePagesByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const page = await getTributePageById(input.id);
        if (!page || page.userId !== ctx.user.id) return null;
        return page;
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const page = await getTributePageBySlug(input.slug);
        if (!page) return null;
        const isExpired = !!(page.planExpiresAt && new Date() > page.planExpiresAt);
        return { ...page, isExpired };
      }),

    create: protectedProcedure
      .input(
        z.object({
          partner1Name: z.string().min(1),
          partner2Name: z.string().min(1),
          relationshipStartDate: z.string(),
          photoUrls: z.array(z.string()),
          musicYoutubeUrl: z.string().optional(),
          planType: z.enum(["essential", "premium"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const plan = PRODUCTS[input.planType];
        const photos = input.photoUrls.slice(0, plan.features.maxPhotos);
        const slug = generateSlug();
        const planExpiresAt = getPlanExpiry(input.planType);

        const page = await createTributePage({
          userId: ctx.user.id,
          uniqueSlug: slug,
          partner1Name: input.partner1Name,
          partner2Name: input.partner2Name,
          relationshipStartDate: new Date(input.relationshipStartDate),
          photoUrls: JSON.stringify(photos),
          musicYoutubeUrl: input.musicYoutubeUrl || null,
          planType: input.planType,
          planExpiresAt: planExpiresAt,
          isActive: true,
        });

        await notifyOwner({
          title: "Nova página de homenagem criada!",
          content: `${input.partner1Name} & ${input.partner2Name} criaram uma página (Plano: ${input.planType === "premium" ? "Premium" : "Essencial"})`,
        }).catch(() => {});

        return page;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          partner1Name: z.string().min(1).optional(),
          partner2Name: z.string().min(1).optional(),
          relationshipStartDate: z.string().optional(),
          photoUrls: z.array(z.string()).optional(),
          musicYoutubeUrl: z.string().optional().nullable(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const page = await getTributePageById(input.id);
        if (!page || page.userId !== ctx.user.id) throw new Error("Page not found or unauthorized");
        const plan = PRODUCTS[page.planType];
        const updateData: Record<string, unknown> = {};
        if (input.partner1Name) updateData.partner1Name = input.partner1Name;
        if (input.partner2Name) updateData.partner2Name = input.partner2Name;
        if (input.relationshipStartDate) updateData.relationshipStartDate = new Date(input.relationshipStartDate);
        if (input.photoUrls) updateData.photoUrls = JSON.stringify(input.photoUrls.slice(0, plan.features.maxPhotos));
        if (input.musicYoutubeUrl !== undefined) updateData.musicYoutubeUrl = input.musicYoutubeUrl;
        return updateTributePage(input.id, updateData as any);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteTributePage(input.id, ctx.user.id);
        return { success: true };
      }),

    uploadPhoto: protectedProcedure
      .input(
        z.object({
          fileBase64: z.string(),
          fileName: z.string(),
          mimeType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileBase64, "base64");
        const ext = input.fileName.split(".").pop() || "jpg";
        const key = `tributes/${ctx.user.id}/${nanoid(12)}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url };
      }),
  }),

  payment: router({
    createCheckout: protectedProcedure
      .input(
        z.object({
          planType: z.enum(["essential", "premium"]),
          tributePageId: z.number().optional(),
          origin: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const plan = PRODUCTS[input.planType];
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "brl",
                product_data: {
                  name: plan.name,
                  description: plan.description,
                },
                unit_amount: plan.priceInCents,
              },
              quantity: 1,
            },
          ],
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            plan_type: input.planType,
            tribute_page_id: input.tributePageId?.toString() || "",
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
          },
          allow_promotion_codes: true,
          success_url: `${input.origin}/dashboard?payment=success&plan=${input.planType}`,
          cancel_url: `${input.origin}/dashboard?payment=cancelled`,
        });

        await createPayment({
          userId: ctx.user.id,
          tributePageId: input.tributePageId || null,
          planType: input.planType,
          amount: (plan.priceInCents / 100).toString() as any,
          stripePaymentIntentId: session.payment_intent?.toString() || session.id,
          status: "pending",
        });

        await notifyOwner({
          title: "Novo pagamento iniciado!",
          content: `Usuário ${ctx.user.name || ctx.user.email} iniciou pagamento do Plano ${input.planType === "premium" ? "Premium" : "Essencial"}`,
        }).catch(() => {});

        return { checkoutUrl: session.url };
      }),

    myPayments: protectedProcedure.query(async ({ ctx }) => {
      return getPaymentsByUserId(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
