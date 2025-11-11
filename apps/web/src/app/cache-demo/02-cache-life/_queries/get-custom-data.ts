export const getCustomData = async () => {
	return {
		profile: "custom",
		timestamp: new Date().toISOString(),
		description: "カスタム設定（stale: 30s, revalidate: 60s, expire: 180s）",
	};
};
