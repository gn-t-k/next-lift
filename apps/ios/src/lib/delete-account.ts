import { deleteUser, signOut } from "./auth-client";

export const deleteAccount = async () => {
	const { error } = await deleteUser();

	if (error) {
		throw new Error("アカウントの削除に失敗しました");
	}

	await signOut();
};
