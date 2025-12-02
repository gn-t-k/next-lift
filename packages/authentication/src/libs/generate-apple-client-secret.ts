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
	const privateKey = await importPKCS8(env.APPLE_PRIVATE_KEY, "ES256");
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

	return jwt;
};
