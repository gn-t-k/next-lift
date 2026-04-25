import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { env } from "../env/env";
import { perUserDatabasePlugin } from "./per-user-database-plugin";

export const authClient = createAuthClient({
	baseURL: env.EXPO_PUBLIC_API_URL,
	plugins: [
		expoClient({
			scheme: "nextlift",
			storagePrefix: "next-lift",
			storage: SecureStore,
		}),
		perUserDatabasePlugin,
	],
});

export const { signIn, signOut, useSession, deleteUser } = authClient;
