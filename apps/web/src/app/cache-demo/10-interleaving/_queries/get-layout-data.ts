export const getLayoutData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 1000));

	return {
		title: "共通レイアウト",
		timestamp: new Date().toISOString(),
	};
};
