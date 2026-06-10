"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Button as AriaButton } from "react-aria-components";
import { cn } from "../../../libs/utils";
import { createAffordanceClass } from "../../../primitives/create-affordance";
import type { SetPlanDraft } from "../../set-plan-types";
import type { WeightUnit } from "../../weight-unit";

type Props = {
	lastSetPlanDraft: SetPlanDraft;
	nextIndex: number;
	weightUnit: WeightUnit;
	onClick: (payload: SetPlanDraft) => void;
};

export const SetPlanQuickAddButton: FC<Props> = ({
	lastSetPlanDraft,
	nextIndex,
	weightUnit,
	onClick,
}) => {
	return (
		<AriaButton
			className={cn(
				createAffordanceClass,
				"flex items-baseline gap-3 rounded-md px-[calc(--spacing(3)-1px)] py-[calc(--spacing(2)-1px)] text-left text-sm",
			)}
			onPress={() => onClick(lastSetPlanDraft)}
		>
			<span className="w-8 shrink-0 text-muted-fg text-xs tabular-nums">
				{`#${nextIndex + 1}`}
			</span>
			<span className="flex-1 truncate tabular-nums">
				{(() => {
					switch (lastSetPlanDraft.pattern) {
						case "weight-reps":
							return `${lastSetPlanDraft.weight}${weightUnit} × ${lastSetPlanDraft.reps}回を追加`;
						case "weight-rpe":
							return `${lastSetPlanDraft.weight}${weightUnit} @ RPE ${lastSetPlanDraft.rpe}を追加`;
						case "reps-rpe":
							return `${lastSetPlanDraft.reps}回 @ RPE ${lastSetPlanDraft.rpe}を追加`;
					}
				})()}
			</span>
			<PlusIcon className="size-4 shrink-0 self-center" aria-hidden />
		</AriaButton>
	);
};
