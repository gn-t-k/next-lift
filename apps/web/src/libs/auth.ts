import { createAuth } from "@next-lift/authentication/create-auth";
import { createLazyProxy } from "@next-lift/utilities/create-lazy-proxy";
import { R } from "@praha/byethrow";
import { setupPerUserDatabase } from "./per-user-database/setup-per-user-database";

/**
 * Better Auth インスタンス
 * databaseHooks で Per-User Database のセットアップを行う
 */
export const auth = createLazyProxy(() =>
	createAuth({
		databaseHooks: {
			user: {
				create: {
					after: async (user) => {
						const result = await setupPerUserDatabase({ userId: user.id });
						if (R.isFailure(result)) {
							// エラーをログに記録
							// 冪等化されているため、次回で再試行可能
							console.error("[Per-User DB Setup Error]", result.error);
						}
					},
				},
			},
		},
	}),
);
