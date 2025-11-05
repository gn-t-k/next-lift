import process from "node:process";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
};

export default withSentryConfig(nextConfig, {
	// For all available options, see:
	// https://github.com/getsentry/sentry-webpack-plugin#options

	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict mode requires bracket notation
	org: process.env["SENTRY_ORG"] || "",
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict mode requires bracket notation
	project: process.env["SENTRY_PROJECT"] || "",

	// Only print logs for uploading source maps in CI
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict mode requires bracket notation
	silent: !process.env["CI"],

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the Sentry DSN is publicly accessible before enabling this option.
	// tunnelRoute: "/monitoring",

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,

	// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
	// See the following for more information:
	// https://docs.sentry.io/product/crons/
	// https://vercel.com/docs/cron-jobs
	automaticVercelMonitors: true,
});
