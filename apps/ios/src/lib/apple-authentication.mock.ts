import { vi } from "vitest";

export const mockAppleAuthentication = {
	signInAsync: vi.fn(),
	AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 } as const,
};

export const mockAppleSignInOk = (identityToken = "mock-apple-id-token") => {
	mockAppleAuthentication.signInAsync.mockResolvedValue({
		identityToken,
		user: "mock-user-id",
		email: null,
		fullName: null,
		realUserStatus: 1,
		state: null,
		authorizationCode: null,
	});
};

export const mockAppleSignInNoToken = () => {
	mockAppleAuthentication.signInAsync.mockResolvedValue({
		identityToken: null,
		user: "mock-user-id",
		email: null,
		fullName: null,
		realUserStatus: 1,
		state: null,
		authorizationCode: null,
	});
};
