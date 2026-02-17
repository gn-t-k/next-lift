import { vi } from "vitest";
import { mockAppleAuthentication } from "../lib/apple-authentication.mock";
import { mockCrypto } from "../lib/expo-crypto.mock";
import { mockGoogleSignIn } from "../lib/google-signin.mock";

vi.mock("@react-native-google-signin/google-signin", () => ({
	GoogleSignin: mockGoogleSignIn,
}));

vi.mock("expo-apple-authentication", () => mockAppleAuthentication);

vi.mock("expo-crypto", () => mockCrypto);

// auth-clientはbetter-auth/expo-secure-storeに依存しテスト環境では読み込めないためモック
vi.mock("../lib/auth-client", () => ({
	authClient: {},
	signIn: async () => ({ data: {}, error: null }),
	signOut: async () => ({ data: {}, error: null }),
	useSession: () => ({ data: null }),
	deleteUser: async () => ({ data: {}, error: null }),
}));
