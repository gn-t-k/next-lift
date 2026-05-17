"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Button as AriaButton } from "react-aria-components";
import { cn } from "../../../libs/utils";
import { createAffordanceClass } from "../../../primitives/create-affordance";
import type { SetPlanWithParams, WeightUnit } from "../set-plan-types";
import { formatQuickAddLabel } from "./format-quick-add-label";
import { SetPlanAddDialog } from "./set-plan-add-dialog";

type Props = {
	lastSetPlan: SetPlanWithParams | undefined;
	nextIndex: number;
	weightUnit: WeightUnit;
	weightStep: number;
	exerciseName: string;
	onAdd: (payload: SetPlanWithParams) => void;
};

export const CreateSetPlanRow: FC<Props> = ({
	lastSetPlan,
	nextIndex,
	weightUnit,
	weightStep,
	exerciseName,
	onAdd,
}) => {
	if (lastSetPlan === undefined) {
		return (
			<SetPlanAddDialog
				exerciseName={exerciseName}
				weightUnit={weightUnit}
				weightStep={weightStep}
				index={nextIndex}
				initial={undefined}
				onAdd={onAdd}
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
			onPress={() => onAdd(lastSetPlan)}
		>
			<span className="w-8 shrink-0 text-muted-fg text-xs tabular-nums">
				{`#${nextIndex + 1}`}
			</span>
			<span className="flex-1 truncate tabular-nums">{label}</span>
			<PlusIcon className="size-4 shrink-0 self-center" aria-hidden />
		</AriaButton>
	);
};
