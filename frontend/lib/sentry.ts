/**
 * Sentry Error Tracking for Frontend
 *
 * Initializes Sentry for error monitoring and performance tracking.
 */

import * as Sentry from "@sentry/nextjs";
import { env, isProduction } from "./env";

export function initSentry(): void {
  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn("⚠️ SENTRY_DSN not configured, error tracking disabled");
    return;
  }

  try {
    Sentry.init({
      dsn: env.NEXT_PUBLIC_SENTRY_DSN,
      environment: env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,

      // Performance Monitoring
      tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in production, 100% in dev

      // Session Replay (optional)
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

      // Release tracking
      release: env.NEXT_PUBLIC_APP_VERSION,

      // Trace propagation targets for performance monitoring
      tracePropagationTargets: ["localhost", env.NEXT_PUBLIC_API_URL, /^\//],

      // Error filtering
      beforeSend(event, hint) {
        // Don't send errors in development
        if (!isProduction) {
          console.error("Sentry Event (dev):", event, hint);
          return null;
        }

        // Filter out specific errors
        if (event.exception) {
          const error = hint.originalException;
          if (error instanceof Error) {
            // Don't send network errors
            if (error.message.includes("NetworkError")) {
              return null;
            }
            // Don't send aborted requests
            if (error.message.includes("AbortError")) {
              return null;
            }
          }
        }

        // Add custom tags
        event.tags = {
          ...event.tags,
          app: "iliski-analiz",
          component: "frontend",
        };

        return event;
      },
    });

    console.log(
      `✅ Sentry initialized (env: ${env.NEXT_PUBLIC_SENTRY_ENVIRONMENT})`,
    );
  } catch (error) {
    console.error("❌ Failed to initialize Sentry:", error);
  }
}

/**
 * Capture an exception with additional context
 */
export function captureException(
  error: Error,
  context?: Record<string, any>,
): void {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture a message (not an error)
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, any>,
): void {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, String(value));
      });
      Sentry.captureMessage(message, level);
    });
  } else {
    Sentry.captureMessage(message, level);
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string }): void {
  Sentry.setUser({
    id: user.id,
    // Don't send email in production for privacy
    ...(isProduction ? {} : { email: user.email }),
  });
}

/**
 * Clear user context
 */
export function clearUser(): void {
  Sentry.setUser(null);
}
