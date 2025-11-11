export const getPageData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 500));

	return {
		content: "動的に更新されるコンテンツ",
		timestamp: new Date().toISOString(),
	};
};
