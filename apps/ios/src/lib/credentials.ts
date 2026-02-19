import * as SecureStore from "expo-secure-store";
import { authClient } from "./auth-client";
import { type Credentials, credentialsSchema } from "./credentials-schema";

const CREDENTIALS_KEY = "next-lift-per-user-db-credentials";

export const resolveCredentials = async (): Promise<Credentials> => {
	const cached = getCredentials();

	if (cached != null && !isExpired(cached.expiresAt)) {
		return cached;
	}

	const credentials = await fetchCredentials();
	cacheCredentials(credentials);
	return credentials;
};

export const clearCredentialsCache = async () => {
	await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
};

const getCredentials = (): Credentials | null => {
	const raw = SecureStore.getItem(CREDENTIALS_KEY);
	if (raw == null) return null;

	const result = credentialsSchema.safeParse(JSON.parse(raw));
	return result.success ? result.data : null;
};

const cacheCredentials = (credentials: Credentials) => {
	SecureStore.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
};

const isExpired = (expiresAt: string): boolean => {
	const EXPIRY_MARGIN_MS = 5 * 60 * 1000;

	return new Date(Date.now() + EXPIRY_MARGIN_MS) >= new Date(expiresAt);
};

const fetchCredentials = async (): Promise<Credentials> => {
	const response = await authClient.getCredentials();

	if (response.error) {
		throw new Error(
			`クレデンシャルの取得に失敗しました: ${JSON.stringify(response.error)}`,
		);
	}

	return response.data;
};
