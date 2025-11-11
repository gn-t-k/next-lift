export const getDynamicData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 500));

	return {
		random: Math.random(),
		timestamp: new Date().toISOString(),
		renderType: "動的レンダリング（リクエスト時）",
	};
};
