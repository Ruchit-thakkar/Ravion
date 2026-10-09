/**
 * Environment configuration validation helper.
 * Validates required secrets safely without logging secret values.
 */

export function validateServerEnv() {
  const missing = [];

  if (!process.env.MONGODB_URI) missing.push("MONGODB_URI");
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");

  if (process.env.NODE_ENV === "production" && missing.length > 0) {
    throw new Error(`[FATAL] Missing required production environment variables: ${missing.join(", ")}`);
  }

  return {
    isConfigured: missing.length === 0,
    missing,
  };
}

export function getImageKitConfig() {
  const missing = [];
  if (!process.env.IMAGEKIT_PUBLIC_KEY) missing.push("IMAGEKIT_PUBLIC_KEY");
  if (!process.env.IMAGEKIT_PRIVATE_KEY) missing.push("IMAGEKIT_PRIVATE_KEY");
  if (!process.env.IMAGEKIT_URL_ENDPOINT) missing.push("IMAGEKIT_URL_ENDPOINT");

  return {
    isConfigured: missing.length === 0,
    missing,
  };
}
