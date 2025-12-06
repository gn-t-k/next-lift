import { env } from "@next-lift/env/private";
import { importPKCS8, SignJWT } from "jose";

/**
 * Apple OAuth認証用のclientSecretを生成する
 *
 * AppleのOAuth認証では、clientSecretとしてJWTを使用する必要がある。
 * このJWTは認証リクエストごとに生成され、Appleサーバーとの認証に使用される。
 * ユーザーのセッションとは無関係であり、JWTの有効期限が切れても
 * ユーザーのログイン状態には影響しない。
 */
export const generateAppleClientSecret = async (): Promise<string> => {
	// Vercelの環境変数では改行が`\n`リテラルとして保存されることがあるため、実際の改行に変換する
	const privateKeyPem = env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n");
	const privateKey = await importPKCS8(privateKeyPem, "ES256");
	const now = Math.floor(Date.now() / 1000);

	// 有効期限は1時間（実際の認証は数秒で完了するため十分）
	const expirationTime = now + 60 * 60;

	// デバッグ: JWT生成に使用する値をログ出力
	console.log("[Apple JWT Debug]", {
		kid: env.APPLE_KEY_ID,
		iss: env.APPLE_TEAM_ID,
		sub: env.APPLE_CLIENT_ID,
		aud: "https://appleid.apple.com",
		iat: now,
		exp: expirationTime,
		privateKeyLength: privateKeyPem.length,
		privateKeyStartsWith: privateKeyPem.substring(0, 30),
		privateKeyEndsWith: privateKeyPem.substring(privateKeyPem.length - 30),
	});

	const jwt = await new SignJWT({})
		.setProtectedHeader({ alg: "ES256", kid: env.APPLE_KEY_ID })
		.setIssuedAt(now)
		.setExpirationTime(expirationTime)
		.setIssuer(env.APPLE_TEAM_ID)
		.setAudience("https://appleid.apple.com")
		.setSubject(env.APPLE_CLIENT_ID)
		.sign(privateKey);

	// デバッグ: 生成されたJWTのヘッダーとペイロードを確認
	const parts = jwt.split(".");
	const header = Buffer.from(parts[0] ?? "", "base64url").toString();
	const payload = Buffer.from(parts[1] ?? "", "base64url").toString();
	console.log("[Apple JWT Generated]", { header, payload });

	return jwt;
};
