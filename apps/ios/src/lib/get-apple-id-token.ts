import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";

export const getAppleIdToken = async (): Promise<{
	token: string;
	nonce: string;
}> => {
	const rawNonce = [...Crypto.getRandomValues(new Uint8Array(32))]
		.map((v) => v.toString(16).padStart(2, "0"))
		.join("");
	const hashedNonce = await Crypto.digestStringAsync(
		Crypto.CryptoDigestAlgorithm.SHA256,
		rawNonce,
	);

	const credential = await AppleAuthentication.signInAsync({
		requestedScopes: [
			AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
			AppleAuthentication.AppleAuthenticationScope.EMAIL,
		],
		nonce: hashedNonce,
	});

	if (credential.identityToken == null) {
		throw new Error("Apple Sign-In: ID Token を取得できませんでした");
	}

	return { token: credential.identityToken, nonce: hashedNonce };
};
