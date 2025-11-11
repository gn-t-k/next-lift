import { cacheLife } from "next/cache";

type Post = {
	id: string;
	title: string;
	content: string;
	author: string;
};

// 純粋関数（テスト容易）
export const getPostCore = async (
	id: string,
): Promise<Post & { timestamp: string }> => {
	// 外部APIまたはDBからデータを取得するシミュレーション
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const posts: Record<string, Post> = {
		"1": {
			id: "1",
			title: "Next.js 16のCache Componentsを使ってみた",
			content:
				"Next.js 16で導入されたCache Componentsは、サーバーサイドのキャッシュを非常に簡単に扱えるようになりました。",
			author: "山田太郎",
		},
		"2": {
			id: "2",
			title: "generateStaticParamsの活用方法",
			content:
				"動的ルートでgenerateStaticParamsを使うことで、ビルド時に複数のページを効率的に生成できます。",
			author: "佐藤花子",
		},
		"3": {
			id: "3",
			title: "キャッシュ戦略の選び方",
			content:
				"プロジェクトの要件に応じて、適切なキャッシュ戦略を選ぶことが重要です。",
			author: "鈴木一郎",
		},
	};

	const post = posts[id] || {
		id,
		title: "投稿が見つかりません",
		content: "指定されたIDの投稿は存在しません。",
		author: "不明",
	};

	return {
		...post,
		timestamp: new Date().toISOString(),
	};
};

// キャッシュ付き（本番用）
export const getPost = async (
	id: string,
): Promise<Post & { timestamp: string }> => {
	"use cache";
	cacheLife("hours"); // 5分stale, 1時間revalidate, 1日expire

	return getPostCore(id);
};
