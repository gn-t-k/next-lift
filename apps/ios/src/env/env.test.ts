import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// native-mocks.tsのグローバルモックを解除して実際のモジュールをテストする
vi.unmock("./env");

describe("env", () => {
	const validEnv = {
		EXPO_PUBLIC_API_URL: "https://example.com",
		EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "web-client-id",
		EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "ios-client-id",
	};

	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	describe("有効な環境変数が設定されている場合", () => {
		beforeEach(() => {
			vi.stubEnv("EXPO_PUBLIC_API_URL", validEnv.EXPO_PUBLIC_API_URL);
			vi.stubEnv(
				"EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
				validEnv.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
			);
			vi.stubEnv(
				"EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
				validEnv.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
			);
		});

		test("パースが成功し各プロパティにアクセスできること", async () => {
			const { env } = await import("./env");

			expect(env.EXPO_PUBLIC_API_URL).toBe(validEnv.EXPO_PUBLIC_API_URL);
			expect(env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID).toBe(
				validEnv.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
			);
			expect(env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID).toBe(
				validEnv.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
			);
		});
	});

	describe("環境変数が未設定の場合", () => {
		beforeEach(() => {
			vi.stubEnv("EXPO_PUBLIC_API_URL", undefined as unknown as string);
			vi.stubEnv(
				"EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
				undefined as unknown as string,
			);
			vi.stubEnv(
				"EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
				undefined as unknown as string,
			);
		});

		test("ZodErrorがthrowされること", async () => {
			await expect(() => import("./env")).rejects.toThrow();
		});
	});
});
