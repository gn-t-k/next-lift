import { generateKeyPairSync, verify } from "node:crypto";
import { describe, expect, test } from "vitest";
import { signJwt } from "./sign-jwt";

const testKeyPair = generateKeyPairSync("ec", { namedCurve: "P-256" });

describe("signJwt", () => {
	const input = {
		header: { alg: "ES256" as const, kid: "test-key-id" },
		payload: { sub: "user-123", iss: "test-issuer", custom: "value" },
		privateKey: testKeyPair.privateKey,
	};

	test("JWTがヘッダー.ペイロード.署名の3パート形式であること", () => {
		const jwt = signJwt(input);
		const parts = jwt.split(".");
		expect(parts).toHaveLength(3);
		expect(parts.every((p) => p.length > 0)).toBe(true);
	});

	test("ヘッダーが正しくエンコードされること", () => {
		const jwt = signJwt(input);
		const headerPart = jwt.split(".")[0];
		if (!headerPart) {
			throw new Error("JWTのヘッダーパートが存在しません");
		}
		const header = JSON.parse(Buffer.from(headerPart, "base64url").toString());
		expect(header).toEqual({ alg: "ES256", kid: "test-key-id" });
	});

	test("ペイロードが正しくエンコードされること", () => {
		const jwt = signJwt(input);
		const payloadPart = jwt.split(".")[1];
		if (!payloadPart) {
			throw new Error("JWTのペイロードパートが存在しません");
		}
		const payload = JSON.parse(
			Buffer.from(payloadPart, "base64url").toString(),
		);
		expect(payload).toEqual({
			sub: "user-123",
			iss: "test-issuer",
			custom: "value",
		});
	});

	test("ES256署名がnode:cryptoで検証可能であること", () => {
		const jwt = signJwt(input);
		const parts = jwt.split(".");
		const signingInput = `${parts[0]}.${parts[1]}`;
		const signaturePart = parts[2];
		if (!signaturePart) {
			throw new Error("JWTの署名パートが存在しません");
		}
		const signature = Buffer.from(signaturePart, "base64url");

		const isValid = verify(
			"sha256",
			Buffer.from(signingInput),
			{
				key: testKeyPair.publicKey,
				dsaEncoding: "ieee-p1363",
			},
			signature,
		);
		expect(isValid).toBe(true);
	});
});
