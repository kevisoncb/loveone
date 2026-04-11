import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  stripePublicKey: process.env.STRIPE_PUBLIC_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  publicUrl: process.env.PUBLIC_URL ?? "",
  // AWS S3 Configuration
  S3_BUCKET_NAME: process.env.AWS_BUCKET_NAME ?? "",
  S3_REGION: process.env.AWS_BUCKET_REGION ?? "",
};
