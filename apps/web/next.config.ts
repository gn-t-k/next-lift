import path from "node:path";
import { env } from "@next-lift/env/private";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	outputFileTracingRoot: path.resolve("../../"),
	outputFileTracingIncludes: {
		"/api/auth/\\[...all\\]": [
			"../../packages/per-user-database/drizzle/**/*",
		],
	},
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

export default withSentryConfig(nextConfig, {
	org: env.SENTRY_ORG,
	project: env.SENTRY_PROJECT,
	authToken: env.SENTRY_AUTH_TOKEN,
	silent: !env.CI,
	widenClientFileUpload: true,
	disableLogger: true,
	automaticVercelMonitors: true,
	sourcemaps: {
		disable: false,
		deleteSourcemapsAfterUpload: true,
	},
});
