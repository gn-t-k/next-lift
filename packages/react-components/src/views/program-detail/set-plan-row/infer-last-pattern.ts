import type { Pattern } from "../set-plan-types";

export const inferLastPattern = (
	setPlans: readonly { pattern: Pattern | null }[],
): Pattern | null => {
	const last = setPlans[setPlans.length - 1];
	if (last === undefined || last.pattern === null) return null;
	return last.pattern;
};
