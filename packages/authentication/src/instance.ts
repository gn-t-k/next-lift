import { env } from "@next-lift/env/private";
import { createLazyProxy } from "@next-lift/utilities";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import * as schema from "./generated/schema";
import { appleClientSecret } from "./libs/apple-client-secret";
import { getDatabase } from "./libs/get-database";

export const auth = createLazyProxy(() => {
	const baseURL = env.BETTER_AUTH_URL;

	return betterAuth({
		database: drizzleAdapter(getDatabase(), {
			provider: "sqlite",
			schema,
		}),
		socialProviders: {
			apple: {
				clientId: env.APPLE_CLIENT_ID,
				// AppleがclientSecretとしてJWTを要求するため
				clientSecret: appleClientSecret,
			},
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
		account: {
			accountLinking: {
				enabled: true,
			},
		},
		user: {
			deleteUser: {
				enabled: true,
			},
		},
		baseURL,
		secret: env.BETTER_AUTH_SECRET,
		plugins: [nextCookies()],
		trustedOrigins: [baseURL, "https://appleid.apple.com"],
		advanced: {
			// Apple OAuthのform_postコールバック（クロスサイトPOST）でCookieを送信するためSameSite=Noneが必要
			defaultCookieAttributes: {
				sameSite: "none",
				secure: true,
			},
		},
		onAPIError: {
			onError: (error) => {
				// エラー内容をコンソールに出力（Vercelのログで確認可能）
				console.error("[Better Auth Error]", error);
			},
			errorURL: "/auth/sign-in",
		},
	});
});
