import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

// biome-ignore lint/correctness/noProcessGlobal: Expoではprocess.envはMetroがビルド時にインライン展開する
const API_URL = process.env["EXPO_PUBLIC_API_URL"];

if (API_URL == null) {
	throw new Error("EXPO_PUBLIC_API_URL が設定されていません");
}

export const authClient = createAuthClient({
	baseURL: API_URL,
	plugins: [
		expoClient({
			scheme: "nextlift",
			storagePrefix: "next-lift",
			storage: SecureStore,
		}),
	],
});

export const { signIn, signOut, useSession, deleteUser } = authClient;
