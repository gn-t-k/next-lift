export const getSubPageData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 500));

	return {
		content: "サブページのコンテンツ",
		timestamp: new Date().toISOString(),
	};
};
