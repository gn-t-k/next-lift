import * as SecureStore from "expo-secure-store";
import { vi } from "vitest";
import type { Credentials } from "./credentials-schema";

export const validCredentials: Credentials = {
	url: "libsql://test-db.turso.io",
	authToken: "test-auth-token",
	expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
};

export const expiredCredentials: Credentials = {
	url: "libsql://test-db.turso.io",
	authToken: "expired-auth-token",
	expiresAt: new Date(Date.now() - 60 * 1000).toISOString(),
};

export const mockSecureStoreGetItem = (value: string | null) => {
	vi.mocked(SecureStore.getItem).mockReturnValue(value);
};

export const mockSecureStoreEmpty = () => {
	mockSecureStoreGetItem(null);
};

export const mockSecureStoreCached = (credentials: Credentials) => {
	mockSecureStoreGetItem(JSON.stringify(credentials));
};

export const mockFetchCredentialsOk = (
	authClientModule: typeof import("./auth-client"),
	credentials: Credentials = validCredentials,
) => {
	return vi
		.spyOn(authClientModule.authClient, "getCredentials")
		.mockResolvedValue({ data: credentials, error: null });
};

export const mockFetchCredentialsError = (
	authClientModule: typeof import("./auth-client"),
	message = "認証エラー",
) => {
	return vi
		.spyOn(authClientModule.authClient, "getCredentials")
		.mockResolvedValue({
			data: null,
			error: { message, status: 500, statusText: "Internal Server Error" },
		});
};
