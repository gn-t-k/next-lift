import { mockPrivateEnv } from "@next-lift/env/testing";
import { describe, expect, test } from "vitest";
import { decrypt, encrypt, getEncryptionKey } from "./crypto";

mockPrivateEnv({
	TURSO_TOKEN_ENCRYPTION_KEY: "0".repeat(64),
});

describe("encrypt / decrypt", () => {
	describe("正常系", () => {
		test("encrypt → decrypt で元のテキストが復元されること", () => {
			const plaintext = "test-auth-token-plaintext";
			const key = getEncryptionKey();

			const encrypted = encrypt(plaintext, key);
			const decrypted = decrypt(encrypted, key);

			expect(decrypted).toBe(plaintext);
		});

		test("異なる平文に対して異なる暗号文が生成されること", () => {
			const key = getEncryptionKey();

			const encrypted1 = encrypt("same-text", key);
			const encrypted2 = encrypt("same-text", key);

			expect(encrypted1).not.toBe(encrypted2);
		});
	});
});
