export type UncachedApiResponse = {
	message: string;
	timestamp: string;
	randomValue: number;
};

// 純粋関数（テスト用）
export const getUncachedApiDataCore =
	async (): Promise<UncachedApiResponse> => {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return {
			message: "このデータはキャッシュされていません（Route Handler）",
			timestamp: new Date().toISOString(),
			randomValue: Math.random(),
		};
	};

export const GET = async () => {
	const data = await getUncachedApiDataCore();
	return Response.json(data);
};
