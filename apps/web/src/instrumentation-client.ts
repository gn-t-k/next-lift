import * as Sentry from "@sentry/nextjs";
import { env } from "./env";

Sentry.init({
	dsn: env.NEXT_PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1.0,
	debug: false,
	replaysOnErrorSampleRate: 1.0,
	replaysSessionSampleRate: 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
