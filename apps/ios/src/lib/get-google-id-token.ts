import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { env } from "../env/env";

GoogleSignin.configure({
	webClientId: env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
	iosClientId: env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

export const getGoogleIdToken = async (): Promise<string> => {
	const response = await GoogleSignin.signIn();
	const idToken = response.data?.idToken;
	if (idToken == null) {
		throw new Error("Google Sign-In: ID Token を取得できませんでした");
	}
	return idToken;
};
