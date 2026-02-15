import { vi } from "vitest";

export const mockGoogleSignIn = {
	configure: vi.fn(),
	signIn: vi.fn(),
};

export const mockGoogleSignInOk = (idToken = "mock-google-id-token") => {
	mockGoogleSignIn.signIn.mockResolvedValue({
		type: "success",
		data: { idToken, user: { id: "mock-user-id" } },
	});
};

export const mockGoogleSignInNoToken = () => {
	mockGoogleSignIn.signIn.mockResolvedValue({
		type: "success",
		data: { idToken: null, user: { id: "mock-user-id" } },
	});
};
