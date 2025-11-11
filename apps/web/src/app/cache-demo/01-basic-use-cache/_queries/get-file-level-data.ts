export const getFileLevelData = async () => {
	// 実際のアプリではAPIやDBからデータを取得
	return {
		timestamp: new Date().toISOString(),
		value: Math.random(),
	};
};
