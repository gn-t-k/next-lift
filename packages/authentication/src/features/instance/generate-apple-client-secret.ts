import { createPrivateKey } from "node:crypto";
import { env } from "@next-lift/env/private";
import { signJwt } from "./sign-jwt";

export const generateAppleClientSecret = (): string => {
	// Vercelの環境変数では改行が`\n`リテラルとしてエスケープされているため、実際の改行に変換
	const privateKeyPem = env.APPLE_PRIVATE_KEY.replaceAll("\\n", "\n");
	const privateKey = createPrivateKey(privateKeyPem);

	const now = Math.floor(Date.now() / 1000);

	// 180 日が上限なので、少しマージンを取って 170 日くらいにしておく
	const expiresInSeconds = 60 * 60 * 24 * 170;

	return signJwt({
		header: { alg: "ES256", kid: env.APPLE_KEY_ID },
		payload: {
			iss: env.APPLE_TEAM_ID,
			iat: now,
			exp: now + expiresInSeconds,
			aud: "https://appleid.apple.com",
			sub: env.APPLE_CLIENT_ID,
		},
		privateKey,
	});
};
