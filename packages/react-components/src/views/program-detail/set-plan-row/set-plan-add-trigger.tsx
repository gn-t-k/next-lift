"use client";

import { ArrowsRightLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import { type FC, useState } from "react";
import { Button as AriaButton } from "react-aria-components";
import { cx } from "../../../libs/primitive";
import { Button } from "../../../primitives/button";
import { createAffordanceClass } from "../../../primitives/create-affordance";

type Pattern = "weight-x-reps" | "weight-x-rpe" | "reps-x-rpe";

type SetPlan =
	| { pattern: null }
	| { pattern: "weight-x-reps"; weight: number; reps: number }
	| { pattern: "weight-x-rpe"; weight: number; rpe: number }
	| { pattern: "reps-x-rpe"; reps: number; rpe: number };

type AddPayload =
	| { pattern: "weight-x-reps"; weight: number; reps: number }
	| { pattern: "weight-x-rpe"; weight: number; rpe: number }
	| { pattern: "reps-x-rpe"; reps: number; rpe: number };

type Props = {
	setPlans: SetPlan[];
	weightUnit: "kg" | "lbs";
	exerciseName: string;
	onAdd: (payload: AddPayload) => void;
};

export const SetPlanAddTrigger: FC<Props> = ({
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
	const display = formatDisplay(payload, weightUnit);
	const cycle = () => setPattern(nextPattern(pattern));
	return (
		<div className="mt-1 flex items-baseline gap-3 pr-3 text-muted-fg text-sm">
			<AriaButton
				onPress={() => onAdd(payload)}
				aria-label={`${exerciseName} ${nextIndex + 1}セット目を追加`}
				className={cx(
					createAffordanceClass,
					"flex flex-1 items-baseline gap-3 rounded-md px-[calc(--spacing(3)-1px)] py-[calc(--spacing(2)-1px)] text-left tabular-nums",
				)}
			>
				<span className="w-8 shrink-0 text-xs">{`#${nextIndex + 1}`}</span>
				<span className="flex-1 truncate">{display}</span>
				<PlusIcon className="size-4 shrink-0 self-center" aria-hidden />
			</AriaButton>
			<Button
				intent="plain"
				size="sq-xs"
				onPress={cycle}
				aria-label={`追加するセットのパターンを切り替え（現在: ${patternLabel(pattern)}）`}
			>
				<ArrowsRightLeftIcon data-slot="icon" className="size-4" aria-hidden />
			</Button>
		</div>
	);
};

const PATTERN_ORDER = [
	"weight-x-reps",
	"weight-x-rpe",
	"reps-x-rpe",
] as const satisfies readonly Pattern[];

const nextPattern = (current: Pattern): Pattern => {
	const i = PATTERN_ORDER.indexOf(current);
	return PATTERN_ORDER[(i + 1) % PATTERN_ORDER.length] ?? "weight-x-reps";
};

const patternLabel = (pattern: Pattern): string => {
	switch (pattern) {
		case "weight-x-reps":
			return "重量×回数";
		case "weight-x-rpe":
			return "重量×RPE";
		case "reps-x-rpe":
			return "回数×RPE";
	}
};

const inferLastPattern = (setPlans: SetPlan[]): Pattern | null => {
	const last = setPlans[setPlans.length - 1];
	if (last === undefined || last.pattern === null) return null;
	return last.pattern;
};

const buildPayload = (pattern: Pattern, setPlans: SetPlan[]): AddPayload => {
	const last = setPlans[setPlans.length - 1];
	if (last !== undefined && last.pattern === pattern) {
		switch (last.pattern) {
			case "weight-x-reps":
				return {
					pattern: "weight-x-reps",
					weight: last.weight,
					reps: last.reps,
				};
			case "weight-x-rpe":
				return {
					pattern: "weight-x-rpe",
					weight: last.weight,
					rpe: last.rpe,
				};
			case "reps-x-rpe":
				return { pattern: "reps-x-rpe", reps: last.reps, rpe: last.rpe };
		}
	}
	return defaultPayload(pattern);
};

const defaultPayload = (pattern: Pattern): AddPayload => {
	switch (pattern) {
		case "weight-x-reps":
			return { pattern: "weight-x-reps", weight: 0, reps: 0 };
		case "weight-x-rpe":
			return { pattern: "weight-x-rpe", weight: 0, rpe: 7 };
		case "reps-x-rpe":
			return { pattern: "reps-x-rpe", reps: 0, rpe: 7 };
	}
};

const formatDisplay = (
	payload: AddPayload,
	weightUnit: "kg" | "lbs",
): string => {
	switch (payload.pattern) {
		case "weight-x-reps":
			return `${payload.weight}${weightUnit} × ${payload.reps}回`;
		case "weight-x-rpe":
			return `${payload.weight}${weightUnit} @ RPE ${payload.rpe}`;
		case "reps-x-rpe":
			return `${payload.reps}回 @ RPE ${payload.rpe}`;
	}
};
