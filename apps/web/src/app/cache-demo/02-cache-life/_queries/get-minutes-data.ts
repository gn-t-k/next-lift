export const getMinutesData = async () => {
	return {
		profile: "minutes",
		timestamp: new Date().toISOString(),
		description: "中期間キャッシュ（数分）",
	};
};
