import { publicEnv } from "@next-lift/env/public";
import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: publicEnv.NEXT_PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1.0,
	debug: false,
});
