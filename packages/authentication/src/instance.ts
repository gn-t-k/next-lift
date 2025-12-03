import { env } from "@next-lift/env/private";
import { createLazyProxy } from "@next-lift/utilities";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import * as schema from "./generated/schema";
import { generateAppleClientSecret } from "./libs/generate-apple-client-secret";
import { getDatabase } from "./libs/get-database";

export const auth = createLazyProxy(() => {
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
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		plugins: [nextCookies()],
		trustedOrigins: [env.BETTER_AUTH_URL, "https://appleid.apple.com"],
		onAPIError: {
			onError: (error) => {
				// エラー内容をコンソールに出力（Vercelのログで確認可能）
				console.error("[Better Auth Error]", error);
			},
			errorURL: "/auth/sign-in",
		},
	});
});
