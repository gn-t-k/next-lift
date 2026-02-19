import type { BetterAuthClientPlugin } from "better-auth/client";

import type { Credentials } from "./credentials-schema";

// biome-ignore lint/correctness/noProcessGlobal: Expoではprocess.envはMetroがビルド時にインライン展開する
const API_URL = process.env["EXPO_PUBLIC_API_URL"];

if (API_URL == null) {
	throw new Error("EXPO_PUBLIC_API_URL が設定されていません");
}

// Better Authの$fetchはベースパス（/api/auth）を自動プリペンドするため、絶対URLを渡してバイパスする
export const perUserDatabasePlugin = {
	id: "per-user-database",
	getActions: ($fetch) => ({
		getCredentials: async () => {
			const response = await $fetch<Credentials>(
				`${API_URL}/api/per-user-database/credentials`,
				{ method: "GET" },
			);
			return response;
		},
	}),
} satisfies BetterAuthClientPlugin;
