import { env } from "@next-lift/env/private";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactCompiler: true,
	cacheComponents: true,
	typedRoutes: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
		],
	},
};

const envVars = env();

export default withSentryConfig(nextConfig, {
	org: envVars.SENTRY_ORG,
	project: envVars.SENTRY_PROJECT,
	authToken: envVars.SENTRY_AUTH_TOKEN,
	silent: !envVars.CI,
	widenClientFileUpload: true,
	disableLogger: true,
	automaticVercelMonitors: true,
	sourcemaps: {
		disable: false,
		deleteSourcemapsAfterUpload: true,
	},
});
