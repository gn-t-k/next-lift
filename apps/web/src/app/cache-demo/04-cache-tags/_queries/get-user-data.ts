export type User = {
	id: number;
	name: string;
	email: string;
};

export const getUserData = async (): Promise<{
	data: User;
	timestamp: string;
}> => {
	// 外部APIまたはDBからデータを取得するシミュレーション
	await new Promise((resolve) => setTimeout(resolve, 1000));

	return {
		data: {
			id: 1,
			name: "山田太郎",
			email: "yamada@example.com",
		},
		timestamp: new Date().toISOString(),
	};
};
