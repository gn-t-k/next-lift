import { env } from "@next-lift/env/private";
import { importPKCS8, SignJWT } from "jose";

const generateAppleClientSecret = async (): Promise<string> => {
	const privateKey = await importPKCS8(env.APPLE_PRIVATE_KEY, "ES256");
	const now = Math.floor(Date.now() / 1000);

	// 180 日が上限なので、少しマージンを取って 170 日くらいにしておく
	const expiresInSeconds = 60 * 60 * 24 * 170;

	const jwt = await new SignJWT({})
		.setProtectedHeader({ alg: "ES256", kid: env.APPLE_KEY_ID })
		.setIssuedAt(now)
		.setExpirationTime(now + expiresInSeconds)
		.setIssuer(env.APPLE_TEAM_ID)
		.setAudience("https://appleid.apple.com")
		.setSubject(env.APPLE_CLIENT_ID)
		.sign(privateKey);

	return jwt;
};

export const appleClientSecret = await generateAppleClientSecret();
