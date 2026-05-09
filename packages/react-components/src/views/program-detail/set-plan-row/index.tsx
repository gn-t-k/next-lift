import type { FC } from "react";
import { cn } from "../../../libs/utils";
import { SetPlanRowDrawer } from "./set-plan-row-drawer";
import { SetPlanRowPopover } from "./set-plan-row-popover";
import type { SetPlanPattern } from "./use-set-plan-editing";

type Edit = {
	title: string;
	onChange: (pattern: SetPlanPattern) => void;
};

type Props = {
	index: number;
	pattern: SetPlanPattern | null;
	weightUnit: "kg" | "lbs";
	weightStep: number;
	edit: Edit;
};

export const SetPlanRow: FC<Props> = ({
	index,
	pattern,
	weightUnit,
	weightStep,
	edit,
}) => {
	const isEmpty = pattern === null;
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
				{formatPattern(pattern, weightUnit)}
			</span>
			<div className="md:hidden">
				<SetPlanRowDrawer
					pattern={pattern}
					weightUnit={weightUnit}
					weightStep={weightStep}
					title={edit.title}
					onChange={edit.onChange}
				/>
			</div>
			<div className="hidden md:block">
				<SetPlanRowPopover
					pattern={pattern}
					weightUnit={weightUnit}
					weightStep={weightStep}
					title={edit.title}
					onChange={edit.onChange}
				/>
			</div>
		</div>
	);
};

const formatWeight = (weight: number, unit: "kg" | "lbs"): string =>
	`${weight}${unit}`;

const formatReps = (reps: number): string => `${reps}回`;

const formatRpe = (rpe: number): string => `RPE ${rpe}`;

const formatPattern = (
	pattern: SetPlanPattern | null,
	unit: "kg" | "lbs",
): string => {
	if (pattern === null) {
		return "値未入力";
	}
	switch (pattern.kind) {
		case "weight-x-reps":
			return `${formatWeight(pattern.weight, unit)} × ${formatReps(pattern.reps)}`;
		case "weight-x-rpe":
			return `${formatWeight(pattern.weight, unit)} @ ${formatRpe(pattern.rpe)}`;
		case "reps-x-rpe":
			return `${formatReps(pattern.reps)} @ ${formatRpe(pattern.rpe)}`;
	}
};
