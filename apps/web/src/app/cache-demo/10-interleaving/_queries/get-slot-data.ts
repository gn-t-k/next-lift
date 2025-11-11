export const getSlotData = async (slotName: string) => {
	await new Promise((resolve) => setTimeout(resolve, 750));

	return {
		slotName,
		data: `${slotName}のデータ`,
		timestamp: new Date().toISOString(),
	};
};
