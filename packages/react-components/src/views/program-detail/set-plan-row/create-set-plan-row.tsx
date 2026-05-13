"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Button as AriaButton } from "react-aria-components";
import { cn } from "../../../libs/utils";
import { createAffordanceClass } from "../../../primitives/create-affordance";
import type { SetPlanWithParams, WeightUnit } from "../set-plan-types";
import { SetPlanFormDialog } from "./set-plan-form-dialog";

type Props = {
	setPlans: readonly SetPlanWithParams[];
	weightUnit: WeightUnit;
	weightStep: number;
	exerciseName: string;
	onAdd: (payload: SetPlanWithParams) => void;
};

export const CreateSetPlanRow: FC<Props> = ({
	setPlans,
	weightUnit,
	weightStep,
	exerciseName,
	onAdd,
}) => {
	const lastSetPlan = setPlans[setPlans.length - 1];
	if (lastSetPlan === undefined) {
		return (
			<SetPlanFormDialog
				mode="add"
				exerciseName={exerciseName}
				weightUnit={weightUnit}
				weightStep={weightStep}
				index={0}
				initial={undefined}
				onSubmit={onAdd}
			/>
		);
	}
	const label = formatQuickAddLabel(lastSetPlan, weightUnit);
	return (
		<AriaButton
			className={cn(
				createAffordanceClass,
				"flex items-baseline gap-3 rounded-md px-[calc(--spacing(3)-1px)] py-[calc(--spacing(2)-1px)] text-left text-sm",
			)}
			onPress={() => onAdd(toPayload(lastSetPlan))}
		>
			<span className="w-8 shrink-0 text-muted-fg text-xs tabular-nums">
				{`#${setPlans.length + 1}`}
			</span>
			<span className="flex-1 truncate tabular-nums">{label}</span>
			<PlusIcon className="size-4 shrink-0 self-center" aria-hidden />
		</AriaButton>
	);
};

const formatQuickAddLabel = (
	setPlan: SetPlanWithParams,
	weightUnit: WeightUnit,
): string => {
	switch (setPlan.pattern) {
		case "weight-x-reps":
			return `${setPlan.weight}${weightUnit} × ${setPlan.reps}回を追加`;
		case "weight-x-rpe":
			return `${setPlan.weight}${weightUnit} @ RPE ${setPlan.rpe}を追加`;
		case "reps-x-rpe":
			return `${setPlan.reps}回 @ RPE ${setPlan.rpe}を追加`;
	}
};

// 呼び出し元から渡される配列要素は SetPlan (id 付き) だが、本コンポーネントの prop 型は
// SetPlanWithParams で id を知らない。そのまま onAdd に渡すと id が一緒に流れて
// しまうので、params のみを明示的に取り出して渡す
const toPayload = (setPlan: SetPlanWithParams): SetPlanWithParams => {
	switch (setPlan.pattern) {
		case "weight-x-reps":
			return {
				pattern: "weight-x-reps",
				weight: setPlan.weight,
				reps: setPlan.reps,
			};
		case "weight-x-rpe":
			return {
				pattern: "weight-x-rpe",
				weight: setPlan.weight,
				rpe: setPlan.rpe,
			};
		case "reps-x-rpe":
			return { pattern: "reps-x-rpe", reps: setPlan.reps, rpe: setPlan.rpe };
	}
};
