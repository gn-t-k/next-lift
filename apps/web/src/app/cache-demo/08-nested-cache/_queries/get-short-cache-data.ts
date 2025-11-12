import { cacheLife } from "next/cache";

// 純粋関数（テスト容易）
export const getShortCacheDataCore = async () => {
	await new Promise((resolve) => setTimeout(resolve, 500));

	return {
		data: "短いキャッシュのデータ",
		timestamp: new Date().toISOString(),
		profile: "seconds",
	};
};

// キャッシュ付き（本番用）
export const getShortCacheData = async () => {
	"use cache";
	cacheLife("seconds"); // 30秒stale, 1秒revalidate, 1分expire
	return getShortCacheDataCore();
};
