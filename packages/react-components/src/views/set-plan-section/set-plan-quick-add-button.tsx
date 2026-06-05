"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Button as AriaButton } from "react-aria-components";
import type { WeightUnit } from "../weight-unit";
import {
	setPlanAddAffordanceClass,
	setPlanIndexClass,
} from "./set-plan-layout";
import type { SetPlanDraft } from "./set-plan-types";

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
			className={setPlanAddAffordanceClass}
			onPress={() => onClick(lastSetPlanDraft)}
		>
			<span className={setPlanIndexClass}>{`#${nextIndex + 1}`}</span>
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
