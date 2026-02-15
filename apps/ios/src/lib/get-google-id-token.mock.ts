import { vi } from "vitest";
import * as module from "./get-google-id-token";

export const mockGetGoogleIdTokenOk = (token = "mock-google-id-token") => {
	return vi.spyOn(module, "getGoogleIdToken").mockResolvedValue(token);
};

export const mockGetGoogleIdTokenError = () => {
	return vi
		.spyOn(module, "getGoogleIdToken")
		.mockRejectedValue(
			new Error("Google Sign-In: ID Token を取得できませんでした"),
		);
};
