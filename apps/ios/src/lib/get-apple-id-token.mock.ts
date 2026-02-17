import { vi } from "vitest";
import * as module from "./get-apple-id-token";

export const mockGetAppleIdTokenOk = (
	overrides?: Partial<{ token: string; nonce: string }>,
) => {
	return vi.spyOn(module, "getAppleIdToken").mockResolvedValue({
		token: "mock-apple-id-token",
		nonce: "mock-raw-nonce",
		...overrides,
	});
};

export const mockGetAppleIdTokenError = () => {
	return vi
		.spyOn(module, "getAppleIdToken")
		.mockRejectedValue(
			new Error("Apple Sign-In: ID Token を取得できませんでした"),
		);
};
