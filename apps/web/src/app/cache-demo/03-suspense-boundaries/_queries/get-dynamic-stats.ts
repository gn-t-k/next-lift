export const getDynamicStats = async () => {
	// 実際のアプリではDBやAPIからデータを取得
	await new Promise((resolve) => setTimeout(resolve, 1000)); // 遅延をシミュレート

	return {
		activeUsers: Math.floor(Math.random() * 1000),
		todayWorkouts: Math.floor(Math.random() * 50),
		timestamp: new Date().toISOString(),
	};
};
