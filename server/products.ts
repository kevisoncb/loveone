/**
 * Stripe Products and Prices for Love365
 */

export const PRODUCTS = {
  essential: {
    name: "Plano Essencial",
    priceInCents: 2990, // R$ 29,90
    currency: "BRL",
    interval: "year" as const,
    features: {
      maxPhotos: 3,
      playerStyle: "simple" as const,
      heartsAnimation: false,
    },
    description: "3 fotos, player simples, design clean - válido por 1 ano",
  },
  premium: {
    name: "Plano Premium",
    priceInCents: 4990, // R$ 49,90
    currency: "BRL",
    interval: "lifetime" as const,
    features: {
      maxPhotos: 5,
      playerStyle: "spotify" as const,
      heartsAnimation: true,
    },
    description: "5 fotos, estilo Spotify, chuva de corações - acesso vitalício",
  },
} as const;

export type PlanType = keyof typeof PRODUCTS;
