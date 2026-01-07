import { z } from "zod";

export const privateStaticEnvSchema = z.object({
	BETTER_AUTH_SECRET: z.string().min(32),

	GOOGLE_CLIENT_ID: z.string().min(1),
	GOOGLE_CLIENT_SECRET: z.string().min(1),

	APPLE_CLIENT_ID: z.string().min(1),
	APPLE_TEAM_ID: z.string().length(10),
	APPLE_KEY_ID: z.string().length(10),
	APPLE_PRIVATE_KEY: z.string().min(1),

	SENTRY_ORG: z.string().min(1),
	SENTRY_PROJECT: z.string().min(1),
	SENTRY_AUTH_TOKEN: z.string().min(1),

	TURSO_PLATFORM_API_TOKEN: z.string().min(1),
	TURSO_ORGANIZATION: z.string().min(1),
	TURSO_PER_USER_DATABASE_PREFIX: z.string().min(1),
	TURSO_TOKEN_ENCRYPTION_KEY: z.hex().length(64),

	CI: z
		.string()
		.transform((v) => v === "true")
		.optional(),
});

export const privateDynamicEnvSchema = z
	.object({
		// プレビュー環境のURLがブランチごとに変わるため
		BETTER_AUTH_URL: z.url(),

		// プレビュー環境ごとにDBを作成するため
		TURSO_AUTH_DATABASE_URL: z.url(),
		TURSO_AUTH_DATABASE_AUTH_TOKEN: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.TURSO_AUTH_DATABASE_URL.startsWith("libsql://")) {
			if (data.TURSO_AUTH_DATABASE_AUTH_TOKEN === undefined) {
				ctx.addIssue({
					path: ["TURSO_AUTH_DATABASE_AUTH_TOKEN"],
					code: "custom",
					message:
						"TURSO_AUTH_DATABASE_URLがリモートURLの場合、TURSO_AUTH_DATABASE_AUTH_TOKENは必須です",
				});
			}

			return;
		}

		if (
			data.TURSO_AUTH_DATABASE_URL.startsWith("file:") &&
			data.TURSO_AUTH_DATABASE_URL.endsWith(".db")
		) {
			return;
		}

		if (data.TURSO_AUTH_DATABASE_URL === ":memory:") {
			return;
		}

		ctx.addIssue({
			path: ["TURSO_AUTH_DATABASE_URL"],
			code: "custom",
			message:
				"TURSO_AUTH_DATABASE_URLはlibsql://で始まるリモートURL、file:で始まるローカルファイルパス、もしくは:memory:である必要があります",
		});
	});

export const publicStaticEnvSchema = z.object({
	NEXT_PUBLIC_SENTRY_DSN: z.url(),
});

export const publicDynamicEnvSchema = z.object({});

export type PrivateEnvKey =
	| keyof z.infer<typeof privateStaticEnvSchema>
	| keyof z.infer<typeof privateDynamicEnvSchema>;

export type PublicEnvKey =
	| keyof z.infer<typeof publicStaticEnvSchema>
	| keyof z.infer<typeof publicDynamicEnvSchema>;
