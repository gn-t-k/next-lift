import process from "node:process";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactCompiler: true,
};

export default withSentryConfig(nextConfig, {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict modeの要件でブラケット記法が必須のため、ドット記法は使用できない
	org: process.env["SENTRY_ORG"] || "",
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict modeの要件でブラケット記法が必須のため、ドット記法は使用できない
	project: process.env["SENTRY_PROJECT"] || "",
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict modeの要件でブラケット記法が必須のため、ドット記法は使用できない
	silent: !process.env["CI"],
	widenClientFileUpload: true,
	disableLogger: true,
	automaticVercelMonitors: true,
});
