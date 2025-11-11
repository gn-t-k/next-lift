export const getDateComparison = async () => {
	const firstCall = Date.now();
	await new Promise((resolve) => setTimeout(resolve, 100));
	const secondCall = Date.now();

	return {
		withoutConnection: firstCall,
		withConnection: secondCall,
		difference: secondCall - firstCall,
	};
};
