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
	// デバッグ用：環境変数の設定状況を確認
	console.log("[Apple OAuth Debug]", {
		hasPrivateKey: !!env.APPLE_PRIVATE_KEY,
		privateKeyLength: env.APPLE_PRIVATE_KEY?.length,
		privateKeyStart: env.APPLE_PRIVATE_KEY?.substring(0, 50),
		privateKeyEnd: env.APPLE_PRIVATE_KEY?.substring(-30),
		hasNewlines: env.APPLE_PRIVATE_KEY?.includes("\n"),
		hasBackslashN: env.APPLE_PRIVATE_KEY?.includes("\\n"),
		keyId: env.APPLE_KEY_ID,
		teamId: env.APPLE_TEAM_ID,
		clientId: env.APPLE_CLIENT_ID,
	});

	// Vercelの環境変数では改行が`\n`リテラルとして保存されることがあるため、実際の改行に変換する
	const privateKeyPem = env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n");
	const privateKey = await importPKCS8(privateKeyPem, "ES256");
	const now = Math.floor(Date.now() / 1000);

	// 有効期限は1時間（実際の認証は数秒で完了するため十分）
	const expirationTime = now + 60 * 60;

	const jwt = await new SignJWT({})
		.setProtectedHeader({ alg: "ES256", kid: env.APPLE_KEY_ID })
		.setIssuedAt(now)
		.setExpirationTime(expirationTime)
		.setIssuer(env.APPLE_TEAM_ID)
		.setAudience("https://appleid.apple.com")
		.setSubject(env.APPLE_CLIENT_ID)
		.sign(privateKey);

	// デバッグ用：生成されたJWTのヘッダーとペイロードを確認
	const parts = jwt.split(".");
	const header = parts[0] ?? "";
	const payload = parts[1] ?? "";
	console.log("[Apple OAuth Debug] Generated JWT:", {
		header: JSON.parse(Buffer.from(header, "base64url").toString()),
		payload: JSON.parse(Buffer.from(payload, "base64url").toString()),
	});

	return jwt;
};
