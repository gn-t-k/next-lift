import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
// ビルド時に環境変数のバリデーションを実行（副作用）
import "./src/env";
// 型安全な環境変数オブジェクトをimport
import { env } from "./src/env";

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

export default withSentryConfig(nextConfig, {
	org: env.SENTRY_ORG,
	project: env.SENTRY_PROJECT,
	authToken: env.SENTRY_AUTH_TOKEN,
	// biome-ignore lint/correctness/noProcessGlobal: ビルド時の設定値として使用
	// biome-ignore lint/complexity/useLiteralKeys: TypeScriptの厳格な型チェックのためブラケット記法を使用
	silent: !process.env["CI"],
	widenClientFileUpload: true,
	disableLogger: true,
	automaticVercelMonitors: true,
	sourcemaps: {
		disable: false,
		deleteSourcemapsAfterUpload: true,
	},
});
