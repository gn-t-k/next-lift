import { vi } from "vitest";
import * as module from "./auth-client";

export const mockDeleteUserOk = () => {
	return vi
		.spyOn(module, "deleteUser")
		.mockResolvedValue({ data: {}, error: null });
};

export const mockDeleteUserError = (message = "削除に失敗しました") => {
	return vi
		.spyOn(module, "deleteUser")
		.mockResolvedValue({ data: null, error: { message } });
};

export const mockSignOutOk = () => {
	return vi
		.spyOn(module, "signOut")
		.mockResolvedValue({ data: {}, error: null });
};
