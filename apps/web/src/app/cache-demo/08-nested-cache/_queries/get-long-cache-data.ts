import { cacheLife } from "next/cache";
import {
	getMediumCacheData,
	type getMediumCacheDataCore,
} from "./get-medium-cache-data";
import type { getShortCacheDataCore } from "./get-short-cache-data";

type GetShortCacheFn = typeof getShortCacheDataCore;
type GetMediumCacheFn = typeof getMediumCacheDataCore;

// 純粋関数（依存性注入でテスト容易）
export const getLongCacheDataCore = async (
	getMediumCache: GetMediumCacheFn,
	getShortCache: GetShortCacheFn,
) => {
	await new Promise((resolve) => setTimeout(resolve, 1500));

	const mediumData = await getMediumCache(getShortCache);

	return {
		data: "長いキャッシュのデータ",
		nestedData: mediumData,
		timestamp: new Date().toISOString(),
		profile: "hours",
	};
};

// キャッシュ付き（本番用）
export const getLongCacheData = async () => {
	"use cache";
	cacheLife("hours"); // 5分stale, 1時間revalidate, 1日expire

	await new Promise((resolve) => setTimeout(resolve, 1500));

	// キャッシュ付きの関数を呼ぶ
	const mediumData = await getMediumCacheData();

	return {
		data: "長いキャッシュのデータ",
		nestedData: mediumData,
		timestamp: new Date().toISOString(),
		profile: "hours",
	};
};
