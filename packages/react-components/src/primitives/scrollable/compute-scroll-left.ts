export type ScrollAlign = "start" | "center" | "end" | "nearest";

type Geometry = {
	containerWidth: number;
	containerScrollLeft: number;
	targetLeft: number;
	targetWidth: number;
};

export const computeScrollLeft = (
	{ containerWidth, containerScrollLeft, targetLeft, targetWidth }: Geometry,
	align: ScrollAlign,
): number => {
	const targetRight = targetLeft + targetWidth;

	if (align === "start") {
		return Math.max(0, targetLeft);
	}
	if (align === "end") {
		return Math.max(0, targetRight - containerWidth);
	}
	if (align === "center") {
		return Math.max(0, targetLeft + targetWidth / 2 - containerWidth / 2);
	}

	if (targetLeft < containerScrollLeft) {
		return Math.max(0, targetLeft);
	}
	if (targetRight > containerScrollLeft + containerWidth) {
		return Math.max(0, targetRight - containerWidth);
	}
	return containerScrollLeft;
};
