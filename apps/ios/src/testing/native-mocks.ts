import { vi } from "vitest";
import { mockAppleAuthentication } from "../lib/apple-authentication.mock";
import { mockCrypto } from "../lib/expo-crypto.mock";
import { mockGoogleSignIn } from "../lib/google-signin.mock";

vi.mock("@react-native-google-signin/google-signin", () => ({
	GoogleSignin: mockGoogleSignIn,
}));

vi.mock("expo-apple-authentication", () => mockAppleAuthentication);

vi.mock("expo-crypto", () => mockCrypto);

vi.mock("expo-secure-store", () => ({
	getItem: vi.fn(),
	setItem: vi.fn(),
	deleteItemAsync: vi.fn(),
}));

// envモジュールはprocess.envをパースするため、テスト環境ではモック化
vi.mock("../env/env", () => ({
	env: {
		EXPO_PUBLIC_API_URL: "https://test.example.com",
		EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "test-web-client-id",
		EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "test-ios-client-id",
	},
}));

// auth-clientはbetter-auth/expo-secure-storeに依存しテスト環境では読み込めないためモック
vi.mock("../lib/auth-client", () => ({
	authClient: {
		getCredentials: vi.fn(),
	},
	signIn: async () => ({ data: {}, error: null }),
	signOut: async () => ({ data: {}, error: null }),
	useSession: () => ({ data: null }),
	deleteUser: async () => ({ data: {}, error: null }),
}));
