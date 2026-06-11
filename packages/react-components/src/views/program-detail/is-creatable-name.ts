export const isCreatableName = (
	existingNames: string[],
	query: string,
): boolean => {
	const trimmed = query.trim();
	if (trimmed === "") return false;
	return !existingNames.includes(trimmed);
};
