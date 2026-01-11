/**
 * Frontend Environment Variables Validation
 *
 * This module validates environment variables using Zod at runtime.
 */

import { z } from "zod";

const envSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL")
    .default("http://localhost:8000"),

  // Observability
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: z
    .enum(["development", "staging", "production"])
    .default("development"),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .default(false),

  // App Configuration
  NEXT_PUBLIC_APP_NAME: z.string().default("İlişki Analiz AI"),
  NEXT_PUBLIC_APP_VERSION: z.string().default("1.0.0"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables
 * @throws {Error} if validation fails
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  });

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error(
      `Invalid environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
    );
  }

  return parsed.data;
}

// Validate on module load
export const env = validateEnv();

// Helper to check if we're in production
export const isProduction = env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === "production";
export const isDevelopment =
  env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === "development";
