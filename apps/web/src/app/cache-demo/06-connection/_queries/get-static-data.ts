export const getStaticData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 500));

	return {
		random: Math.random(),
		timestamp: new Date().toISOString(),
		renderType: "静的レンダリング（ビルド時）",
	};
};
