import {
	afterEach,
	beforeEach,
	describe,
	expect,
	type MockInstance,
	test,
	vi,
} from "vitest";
import {
	mockDeleteUserError,
	mockDeleteUserOk,
	mockSignOutOk,
} from "./auth-client.mock";
import { deleteAccount } from "./delete-account";

describe("deleteAccount", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("deleteUser が成功した場合", () => {
		let signOutSpy: MockInstance;

		beforeEach(() => {
			mockDeleteUserOk();
			signOutSpy = mockSignOutOk();
		});

		test("signOut が呼び出されること", async () => {
			await deleteAccount();
			expect(signOutSpy).toHaveBeenCalledOnce();
		});

		test("エラーなく完了すること", async () => {
			await expect(deleteAccount()).resolves.not.toThrow();
		});
	});

	describe("deleteUser がエラーを返した場合", () => {
		let signOutSpy: MockInstance;

		beforeEach(() => {
			mockDeleteUserError();
			signOutSpy = mockSignOutOk();
		});

		test("エラーをスローすること", async () => {
			await expect(deleteAccount()).rejects.toThrow(
				"アカウントの削除に失敗しました",
			);
		});

		test("signOut が呼び出されないこと", async () => {
			await deleteAccount().catch(() => {});
			expect(signOutSpy).not.toHaveBeenCalled();
		});
	});
});
