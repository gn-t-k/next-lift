import { vi } from "vitest";
import { mockAppleAuthentication } from "../lib/apple-authentication.mock";
import { mockCrypto } from "../lib/expo-crypto.mock";
import { mockGoogleSignIn } from "../lib/google-signin.mock";

vi.mock("@react-native-google-signin/google-signin", () => ({
	GoogleSignin: mockGoogleSignIn,
}));

vi.mock("expo-apple-authentication", () => mockAppleAuthentication);

vi.mock("expo-crypto", () => mockCrypto);
