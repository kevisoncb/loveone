import { z } from "zod";

const PHOTO_LIMIT_ESSENTIAL = 3;
const PHOTO_LIMIT_PREMIUM = 5;

// Validator for creating a new tribute page
export const createTributePageValidator = z.object({
  partner1Name: z.string().min(1, "Partner 1 name cannot be empty."),
  partner2Name: z.string().min(1, "Partner 2 name cannot be empty."),
  relationshipStartDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format for relationship start date.",
  }),
  photoUrls: z.array(z.string().url()),
  // CORREÇÃO: Adicionado .nullable() para ser explícito sobre valores nulos
  musicYoutubeUrl: z.string().url().optional().nullable(),
  planType: z.enum(["essential", "premium"]),
}).superRefine((data, ctx) => {
  if (data.planType === 'essential' && data.photoUrls.length > PHOTO_LIMIT_ESSENTIAL) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: PHOTO_LIMIT_ESSENTIAL,
      type: "array",
      inclusive: true,
      path: ['photoUrls'],
      message: `O plano Essencial permite no máximo ${PHOTO_LIMIT_ESSENTIAL} fotos.`,
    });
  }
  if (data.planType === 'premium' && data.photoUrls.length > PHOTO_LIMIT_PREMIUM) {
     ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: PHOTO_LIMIT_PREMIUM,
      type: "array",
      inclusive: true,
      path: ['photoUrls'],
      message: `O plano Premium permite no máximo ${PHOTO_LIMIT_PREMIUM} fotos.`,
    });
  }
});

export type CreateTributePageInput = z.infer<typeof createTributePageValidator>;

// Validator for updating an existing tribute page
export const updateTributePageValidator = z.object({
  id: z.number(),
  partner1Name: z.string().min(1).optional(),
  partner2Name: z.string().min(1).optional(),
  relationshipStartDate: z.string().refine(val => !isNaN(Date.parse(val))).optional(),
  photoUrls: z.array(z.string().url()).optional(),
  musicYoutubeUrl: z.string().url().optional().nullable(),
});

export type UpdateTributePageInput = z.infer<typeof updateTributePageValidator>;

// Validator for photo uploads
export const uploadPhotoValidator = z.object({
  fileBase64: z.string(),
  fileName: z.string(),
});
