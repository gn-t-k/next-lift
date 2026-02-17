import { GoogleSignin } from "@react-native-google-signin/google-signin";

// biome-ignore lint/correctness/noProcessGlobal: Expoではprocess.envはMetroがビルド時にインライン展開する
const WEB_CLIENT_ID = process.env["EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"];
// biome-ignore lint/correctness/noProcessGlobal: Expoではprocess.envはMetroがビルド時にインライン展開する
const IOS_CLIENT_ID = process.env["EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"];

GoogleSignin.configure({
	webClientId: WEB_CLIENT_ID,
	iosClientId: IOS_CLIENT_ID,
});

export const getGoogleIdToken = async (): Promise<string> => {
	const response = await GoogleSignin.signIn();
	const idToken = response.data?.idToken;
	if (idToken == null) {
		throw new Error("Google Sign-In: ID Token を取得できませんでした");
	}
	return idToken;
};
