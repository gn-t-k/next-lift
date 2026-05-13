"use client";

import { ArrowsRightLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import { type FC, useState } from "react";
import { Button as AriaButton } from "react-aria-components";
import { cx } from "../../../libs/primitive";
import { Button } from "../../../primitives/button";
import { createAffordanceClass } from "../../../primitives/create-affordance";
import type { Pattern, SetPlanWithParams, WeightUnit } from "../set-plan-types";
import { buildPayload } from "./build-payload";
import { inferLastPattern } from "./infer-last-pattern";

type Props = {
	setPlans: readonly (SetPlanWithParams | { pattern: null })[];
	weightUnit: WeightUnit;
	exerciseName: string;
	onAdd: (payload: SetPlanWithParams) => void;
};

export const CreateSetPlanRow: FC<Props> = ({
	setPlans,
	weightUnit,
	exerciseName,
	onAdd,
}) => {
	const lastPattern = inferLastPattern(setPlans);
	const [pattern, setPattern] = useState<Pattern>(
		lastPattern ?? "weight-x-reps",
	);
	const nextIndex = setPlans.length;
	const payload = buildPayload(pattern, setPlans);
	const cycle = () => setPattern(nextPattern(pattern));
	return (
		<div className="mt-1 flex items-baseline gap-3 pr-3 text-muted-fg text-sm">
			<PreviewButton
				index={nextIndex}
				exerciseName={exerciseName}
				payload={payload}
				weightUnit={weightUnit}
				onPress={() => onAdd(payload)}
			/>
			<CycleButton pattern={pattern} onPress={cycle} />
		</div>
	);
};

type PreviewButtonProps = {
	index: number;
	exerciseName: string;
	payload: SetPlanWithParams;
	weightUnit: WeightUnit;
	onPress: () => void;
};

const PreviewButton: FC<PreviewButtonProps> = ({
	index,
	exerciseName,
	payload,
	weightUnit,
	onPress,
}) => (
	<AriaButton
		onPress={onPress}
		aria-label={`${exerciseName} ${index + 1}セット目を追加`}
		className={cx(
			createAffordanceClass,
			"flex flex-1 items-baseline gap-3 rounded-md px-[calc(--spacing(3)-1px)] py-[calc(--spacing(2)-1px)] text-left tabular-nums",
		)}
	>
		<span className="w-8 shrink-0 text-xs">{`#${index + 1}`}</span>
		<span className="flex-1 truncate">
			{(() => {
				switch (payload.pattern) {
					case "weight-x-reps":
						return `${payload.weight}${weightUnit} × ${payload.reps}回`;
					case "weight-x-rpe":
						return `${payload.weight}${weightUnit} @ RPE ${payload.rpe}`;
					case "reps-x-rpe":
						return `${payload.reps}回 @ RPE ${payload.rpe}`;
				}
			})()}
		</span>
		<PlusIcon className="size-4 shrink-0 self-center" aria-hidden />
	</AriaButton>
);

type CycleButtonProps = {
	pattern: Pattern;
	onPress: () => void;
};

const CycleButton: FC<CycleButtonProps> = ({ pattern, onPress }) => (
	<Button
		intent="plain"
		size="sq-xs"
		onPress={onPress}
		aria-label={`追加するセットのパターンを切り替え（現在: ${(() => {
			switch (pattern) {
				case "weight-x-reps":
					return "重量×回数";
				case "weight-x-rpe":
					return "重量×RPE";
				case "reps-x-rpe":
					return "回数×RPE";
			}
		})()}）`}
	>
		<ArrowsRightLeftIcon data-slot="icon" className="size-4" aria-hidden />
	</Button>
);

const nextPattern = (current: Pattern): Pattern => {
	const PATTERN_ORDER = [
		"weight-x-reps",
		"weight-x-rpe",
		"reps-x-rpe",
	] as const satisfies readonly Pattern[];
	const i = PATTERN_ORDER.indexOf(current);
	return PATTERN_ORDER[(i + 1) % PATTERN_ORDER.length] ?? "weight-x-reps";
};
