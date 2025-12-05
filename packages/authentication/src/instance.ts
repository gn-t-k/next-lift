import { env } from "@next-lift/env/private";
import { createLazyProxy } from "@next-lift/utilities";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import * as schema from "./generated/schema";
import { generateAppleClientSecret } from "./libs/generate-apple-client-secret";
import { getDatabase } from "./libs/get-database";

/**
 * ベースURLを解決する
 *
 * Vercelのプレビュー環境では、環境変数に設定された`${VERCEL_URL}`が
 * 文字列リテラルとして残る場合がある。
 * この関数は`VERCEL_URL`環境変数を使って動的にURLを解決する。
 */
const resolveBaseUrl = (): string => {
	const configuredUrl = env.BETTER_AUTH_URL;

	// biome-ignore lint/suspicious/noTemplateCurlyInString: Vercelの環境変数プレースホルダーを文字列として検出するため意図的に使用
	const vercelUrlPlaceholder = "${VERCEL_URL}";
	if (configuredUrl.includes(vercelUrlPlaceholder)) {
		// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeでは`node:process`のimportが不可
		// biome-ignore lint/complexity/useLiteralKeys: VERCEL_URLは型定義にないためブラケット記法を使用
		const vercelUrl = process.env["VERCEL_URL"];
		if (vercelUrl) {
			// VERCEL_URLはプロトコルなしのホスト名のみ（例: next-lift-xxx.vercel.app）
			// BETTER_AUTH_URLが「https://${VERCEL_URL}」の形式で設定されている想定
			return configuredUrl.replace(vercelUrlPlaceholder, vercelUrl);
		}
	}

	return configuredUrl;
};

export const auth = createLazyProxy(() => {
	const baseURL = resolveBaseUrl();

	return betterAuth({
		database: drizzleAdapter(getDatabase(), {
			provider: "sqlite",
			schema,
		}),
		socialProviders: {
			apple: {
				clientId: env.APPLE_CLIENT_ID,
				// Better Authは内部でPromiseをawaitするため、getterでPromiseを返すことで動的生成が可能
				get clientSecret() {
					return generateAppleClientSecret();
				},
			} as unknown as { clientId: string; clientSecret: string },
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
		baseURL,
		secret: env.BETTER_AUTH_SECRET,
		plugins: [nextCookies()],
		trustedOrigins: [baseURL, "https://appleid.apple.com"],
		onAPIError: {
			onError: (error) => {
				// エラー内容をコンソールに出力（Vercelのログで確認可能）
				console.error("[Better Auth Error]", error);
			},
			errorURL: "/auth/sign-in",
		},
	});
});
