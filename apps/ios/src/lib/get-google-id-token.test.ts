import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getGoogleIdToken } from "./get-google-id-token";
import {
	mockGoogleSignInNoToken,
	mockGoogleSignInOk,
} from "./google-signin.mock";

describe("getGoogleIdToken", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Google Sign-In が成功した場合", () => {
		beforeEach(() => {
			mockGoogleSignInOk("test-id-token");
		});

		test("ID Token を返すこと", async () => {
			const result = await getGoogleIdToken();
			expect(result).toBe("test-id-token");
		});
	});

	describe("ID Token が取得できなかった場合", () => {
		beforeEach(() => {
			mockGoogleSignInNoToken();
		});

		test("エラーをスローすること", async () => {
			await expect(getGoogleIdToken()).rejects.toThrow();
		});
	});
});
