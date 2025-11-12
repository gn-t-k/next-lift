export const getStaticHeader = async () => {
	return {
		title: "Next Lift Dashboard",
		description: "あなたのトレーニング管理システム",
		cachedAt: new Date().toISOString(),
	};
};
