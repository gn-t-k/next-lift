import { env } from "@next-lift/env/private";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

/**
 * NEXT_PUBLIC_BETTER_AUTH_URL を取得する
 * 未設定の場合は VERCEL_URL からフォールバック（プレビュー環境用）
 */
const getPublicBetterAuthUrl = (): string | undefined => {
	// biome-ignore lint/complexity/useLiteralKeys: インデックスシグネチャではブラケット記法が必要
	// biome-ignore lint/correctness/noProcessGlobal: next.config.tsはNode.js環境で実行される
	const explicitUrl = process.env["NEXT_PUBLIC_BETTER_AUTH_URL"];
	if (explicitUrl) {
		return explicitUrl;
	}

	// biome-ignore lint/complexity/useLiteralKeys: インデックスシグネチャではブラケット記法が必要
	// biome-ignore lint/correctness/noProcessGlobal: next.config.tsはNode.js環境で実行される
	const vercelUrl = process.env["VERCEL_URL"];
	if (vercelUrl) {
		return `https://${vercelUrl}`;
	}

	return undefined;
};

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
	env: {
		// NEXT_PUBLIC_BETTER_AUTH_URL が未設定で VERCEL_URL がある場合はフォールバック
		// プレビュー環境で自動的にURLを設定するため
		NEXT_PUBLIC_BETTER_AUTH_URL: getPublicBetterAuthUrl(),
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
