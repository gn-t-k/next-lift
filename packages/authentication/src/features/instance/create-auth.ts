import process from "node:process";
import { expo } from "@better-auth/expo";
import { env } from "@next-lift/env/private";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { schema } from "../../database-schemas";
import { getDatabase } from "../../helpers/get-database";
import { appleClientSecret } from "./apple-client-secret";

export type CreateAuthOptions = {
	databaseHooks?: {
		user?: {
			create?: {
				after?: (user: {
					id: string;
					email: string;
					name: string;
					image?: string | null | undefined;
					emailVerified: boolean;
					createdAt: Date;
					updatedAt: Date;
				}) => Promise<void>;
			};
		};
	};
};

/**
 * Better Auth インスタンスを作成するファクトリ関数
 * databaseHooks のみオプションで外部から受け取れる
 */
export const createAuth = (options?: CreateAuthOptions) => {
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
				trustedProviders: ["google", "apple"],
			},
		},
		user: {
			deleteUser: {
				enabled: true,
			},
		},
		baseURL,
		secret: env.BETTER_AUTH_SECRET,
		plugins: [nextCookies(), expo()],
		trustedOrigins: [
			baseURL,
			"https://appleid.apple.com",
			"nextlift://",
			...(process.env["NODE_ENV"] === "development" ? ["exp://"] : []),
		],
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
		databaseHooks: options?.databaseHooks,
	});
};
