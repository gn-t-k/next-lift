import * as SecureStore from "expo-secure-store";
import { beforeEach, describe, expect, test, vi } from "vitest";
import * as authClientModule from "./auth-client";
import { clearCredentialsCache, resolveCredentials } from "./credentials";
import {
	expiredCredentials,
	mockFetchCredentialsError,
	mockFetchCredentialsOk,
	mockSecureStoreCached,
	mockSecureStoreEmpty,
	validCredentials,
} from "./credentials.mock";

describe("resolveCredentials", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("キャッシュあり＋期限内の場合", () => {
		beforeEach(() => {
			mockSecureStoreCached(validCredentials);
		});

		test("キャッシュの値を返すこと", async () => {
			const result = await resolveCredentials();

			expect(result).toEqual(validCredentials);
		});

		test("APIを呼び出さないこと", async () => {
			await resolveCredentials();

			expect(authClientModule.authClient.getCredentials).not.toHaveBeenCalled();
		});
	});

	describe("キャッシュあり＋期限切れの場合", () => {
		const freshCredentials = {
			...validCredentials,
			authToken: "fresh-token",
		};

		beforeEach(() => {
			mockSecureStoreCached(expiredCredentials);
			mockFetchCredentialsOk(authClientModule, freshCredentials);
		});

		test("APIから再取得した値を返すこと", async () => {
			const result = await resolveCredentials();

			expect(result).toEqual(freshCredentials);
		});

		test("キャッシュを更新すること", async () => {
			await resolveCredentials();

			expect(SecureStore.setItem).toHaveBeenCalledWith(
				"next-lift-per-user-db-credentials",
				JSON.stringify(freshCredentials),
			);
		});
	});

	describe("キャッシュなしの場合", () => {
		beforeEach(() => {
			mockSecureStoreEmpty();
			mockFetchCredentialsOk(authClientModule);
		});

		test("APIから取得した値を返すこと", async () => {
			const result = await resolveCredentials();

			expect(result).toEqual(validCredentials);
		});

		test("キャッシュに保存すること", async () => {
			await resolveCredentials();

			expect(SecureStore.setItem).toHaveBeenCalledWith(
				"next-lift-per-user-db-credentials",
				JSON.stringify(validCredentials),
			);
		});
	});

	describe("キャッシュのデータが不正な場合", () => {
		beforeEach(() => {
			vi.mocked(SecureStore.getItem).mockReturnValue(
				JSON.stringify({ invalid: "data" }),
			);
			mockFetchCredentialsOk(authClientModule);
		});

		test("APIから取得した値を返すこと", async () => {
			const result = await resolveCredentials();

			expect(result).toEqual(validCredentials);
		});
	});

	describe("API取得が失敗した場合", () => {
		beforeEach(() => {
			mockSecureStoreEmpty();
			mockFetchCredentialsError(authClientModule, "サーバーエラー");
		});

		test("エラーをスローすること", async () => {
			await expect(resolveCredentials()).rejects.toThrow(
				"クレデンシャルの取得に失敗しました",
			);
		});
	});
});

describe("clearCredentialsCache", () => {
	test("SecureStoreからクレデンシャルを削除すること", async () => {
		await clearCredentialsCache();

		expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
			"next-lift-per-user-db-credentials",
		);
	});
});
