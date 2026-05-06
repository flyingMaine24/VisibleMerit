export const featureFlags = {
  checkout: process.env.ENABLE_CHECKOUT !== "false",
  previewGeneration: process.env.ENABLE_PREVIEW_GENERATION !== "false",
  fullPackGeneration: process.env.ENABLE_FULL_PACK_GENERATION !== "false",
  emailDelivery: process.env.ENABLE_EMAIL_DELIVERY === "true"
};
