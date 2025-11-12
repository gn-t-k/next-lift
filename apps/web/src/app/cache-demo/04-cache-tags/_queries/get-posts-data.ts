export type Post = {
	id: number;
	title: string;
	content: string;
};

export const getPostsData = async (): Promise<{
	data: Post[];
	timestamp: string;
}> => {
	// 外部APIまたはDBからデータを取得するシミュレーション
	await new Promise((resolve) => setTimeout(resolve, 1500));

	return {
		data: [
			{ id: 1, title: "最初の投稿", content: "これは最初の投稿です。" },
			{ id: 2, title: "2番目の投稿", content: "これは2番目の投稿です。" },
			{
				id: 3,
				title: "3番目の投稿",
				content: "これは3番目の投稿です。",
			},
		],
		timestamp: new Date().toISOString(),
	};
};
