import { cacheLife, cacheTag } from "next/cache";

export type CachedApiResponse = {
	message: string;
	timestamp: string;
	randomValue: number;
};

// 純粋関数（テスト用）
export const getCachedApiDataCore = async (): Promise<CachedApiResponse> => {
	await new Promise((resolve) => setTimeout(resolve, 1000));

	return {
		message: "このデータはキャッシュされています（Route Handler）",
		timestamp: new Date().toISOString(),
		randomValue: Math.random(),
	};
};

// キャッシュ付き（本番用）
const getCachedApiData = async () => {
	"use cache";
	cacheLife("minutes"); // 1分stale, 5分revalidate, 1時間expire
	cacheTag("cached-api-data"); // 再検証用タグ

	return getCachedApiDataCore();
};

export const GET = async () => {
	const data = await getCachedApiData();
	return Response.json(data);
};
