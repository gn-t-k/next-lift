import type { BetterAuthClientPlugin } from "better-auth/client";

import { env } from "../env/env";
import type { Credentials } from "./credentials-schema";

// Better Authの$fetchはベースパス（/api/auth）を自動プリペンドするため、絶対URLを渡してバイパスする
export const perUserDatabasePlugin = {
	id: "per-user-database",
	getActions: ($fetch) => ({
		getCredentials: async () => {
			const response = await $fetch<Credentials>(
				`${env.EXPO_PUBLIC_API_URL}/api/per-user-database/credentials`,
				{ method: "GET" },
			);
			return response;
		},
	}),
} satisfies BetterAuthClientPlugin;
