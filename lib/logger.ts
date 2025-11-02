import pino from "pino";

// Create a logger instance with pretty printing in development
export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  ...(process.env.NODE_ENV !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "HH:MM:ss Z",
      },
    },
  }),
});

// Sentry integration placeholder
export function initSentry() {
  // TODO: Initialize Sentry here
  // import * as Sentry from "@sentry/nextjs";
  // Sentry.init({
  //   dsn: process.env.SENTRY_DSN,
  //   environment: process.env.NODE_ENV,
  //   tracesSampleRate: 1.0,
  // });
  logger.info("Sentry monitoring not configured - placeholder only");
}

export function captureException(
  error: Error,
  context?: Record<string, unknown>
) {
  // TODO: Send to Sentry
  // Sentry.captureException(error, { extra: context });
  logger.error({ err: error, context }, "Exception captured");
}
