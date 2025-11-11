export const getSecondsData = async () => {
	return {
		profile: "seconds",
		timestamp: new Date().toISOString(),
		description: "短時間キャッシュ（数秒）",
	};
};
