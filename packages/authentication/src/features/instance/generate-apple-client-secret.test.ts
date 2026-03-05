import { generateKeyPairSync } from "node:crypto";
import { mockPrivateEnv } from "@next-lift/env/testing";
import { describe, expect, test } from "vitest";
import { generateAppleClientSecret } from "./generate-apple-client-secret";

const testPrivateKeyPem = generateKeyPairSync("ec", { namedCurve: "P-256" })
	.privateKey.export({ type: "pkcs8", format: "pem" })
	.toString();

mockPrivateEnv({
	APPLE_PRIVATE_KEY: testPrivateKeyPem,
	APPLE_KEY_ID: "TEST_KEY_ID",
	APPLE_TEAM_ID: "TEST_TEAM_ID",
	APPLE_CLIENT_ID: "com.example.test",
});

describe("generateAppleClientSecret", () => {
	describe("有効なApple秘密鍵が設定されているとき", () => {
		test("ヘッダーのkidがAPPLE_KEY_IDであること", () => {
			const jwt = generateAppleClientSecret();
			const headerPart = jwt.split(".")[0];
			if (!headerPart) {
				throw new Error("JWTのヘッダーパートが存在しません");
			}
			const header = JSON.parse(
				Buffer.from(headerPart, "base64url").toString(),
			);
			expect(header.kid).toBe("TEST_KEY_ID");
		});

		test("ペイロードのiss, aud, subが正しく、exp - iatが170日であること", () => {
			const jwt = generateAppleClientSecret();
			const payloadPart = jwt.split(".")[1];
			if (!payloadPart) {
				throw new Error("JWTのペイロードパートが存在しません");
			}
			const payload = JSON.parse(
				Buffer.from(payloadPart, "base64url").toString(),
			);

			expect(payload.iss).toBe("TEST_TEAM_ID");
			expect(payload.aud).toBe("https://appleid.apple.com");
			expect(payload.sub).toBe("com.example.test");
			expect(payload.exp - payload.iat).toBe(60 * 60 * 24 * 170);
		});
	});
});
