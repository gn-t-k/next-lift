import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
	mockAppleAuthentication,
	mockAppleSignInNoToken,
	mockAppleSignInOk,
} from "./apple-authentication.mock";
import { mockCryptoOk } from "./expo-crypto.mock";
import { getAppleIdToken } from "./get-apple-id-token";

describe("getAppleIdToken", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Apple Sign-In が成功した場合", () => {
		beforeEach(() => {
			mockCryptoOk(new Uint8Array(32).fill(0xab), "hashed-nonce");
			mockAppleSignInOk("apple-id-token");
		});

		test("ID Token と raw nonce を返すこと", async () => {
			const result = await getAppleIdToken();

			expect(result.token).toBe("apple-id-token");
			expect(result.nonce).toBe("ab".repeat(32));
		});

		test("Apple にはハッシュ済み nonce が渡されること", async () => {
			await getAppleIdToken();

			expect(mockAppleAuthentication.signInAsync).toHaveBeenCalledWith(
				expect.objectContaining({ nonce: "hashed-nonce" }),
			);
		});
	});

	describe("identityToken が取得できなかった場合", () => {
		beforeEach(() => {
			mockCryptoOk();
			mockAppleSignInNoToken();
		});

		test("エラーをスローすること", async () => {
			await expect(getAppleIdToken()).rejects.toThrow();
		});
	});
});
