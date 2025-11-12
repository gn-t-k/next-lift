import { cacheLife } from "next/cache";
import {
	getShortCacheData,
	type getShortCacheDataCore,
} from "./get-short-cache-data";

type GetShortCacheFn = typeof getShortCacheDataCore;

// 純粋関数（依存性注入でテスト容易）
export const getMediumCacheDataCore = async (
	getShortCache: GetShortCacheFn,
) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const shortData = await getShortCache();

	return {
		data: "中程度のキャッシュのデータ",
		nestedData: shortData,
		timestamp: new Date().toISOString(),
		profile: "minutes",
	};
};

// キャッシュ付き（本番用）
export const getMediumCacheData = async () => {
	"use cache";
	cacheLife("minutes"); // 5分stale, 1分revalidate, 1時間expire

	await new Promise((resolve) => setTimeout(resolve, 1000));

	// キャッシュ付きの関数を呼ぶ
	const shortData = await getShortCacheData();

	return {
		data: "中程度のキャッシュのデータ",
		nestedData: shortData,
		timestamp: new Date().toISOString(),
		profile: "minutes",
	};
};
