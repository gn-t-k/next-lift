import type { FC } from "react";
import { cn } from "../../libs/utils";

export type SetPlanParams =
	| { pattern: "weight-x-reps"; weight: number; reps: number }
	| { pattern: "weight-x-rpe"; weight: number; rpe: number }
	| { pattern: "reps-x-rpe"; reps: number; rpe: number };

type Props = {
	index: number;
	params: SetPlanParams | null;
	weightUnit: "kg" | "lbs";
};

export const SetPlanRow: FC<Props> = ({ index, params, weightUnit }) => {
	const isEmpty = params === null;
	return (
		<div className="flex items-baseline gap-3 px-3 py-2 text-sm">
			<span className="w-8 shrink-0 text-muted-fg text-xs tabular-nums">
				{`#${index + 1}`}
			</span>
			<span
				className={cn(
					"flex-1 tabular-nums",
					isEmpty ? "text-muted-fg" : "text-fg",
				)}
			>
				{formatParams(params, weightUnit)}
			</span>
		</div>
	);
};

const formatWeight = (weight: number, unit: "kg" | "lbs"): string =>
	`${weight}${unit}`;

const formatReps = (reps: number): string => `${reps}回`;

const formatRpe = (rpe: number): string => `RPE ${rpe}`;

const formatParams = (
	params: SetPlanParams | null,
	unit: "kg" | "lbs",
): string => {
	if (params === null) {
		return "値未入力";
	}
	switch (params.pattern) {
		case "weight-x-reps":
			return `${formatWeight(params.weight, unit)} × ${formatReps(params.reps)}`;
		case "weight-x-rpe":
			return `${formatWeight(params.weight, unit)} @ ${formatRpe(params.rpe)}`;
		case "reps-x-rpe":
			return `${formatReps(params.reps)} @ ${formatRpe(params.rpe)}`;
	}
};
