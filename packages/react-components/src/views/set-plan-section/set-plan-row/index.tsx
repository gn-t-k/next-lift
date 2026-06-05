"use client";

import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Button } from "../../../primitives/button";
import type { WeightUnit } from "../../weight-unit";
import { SetPlanFormDialog } from "../set-plan-form-dialog";
import { setPlanIndexClass, setPlanRowClass } from "../set-plan-layout";
import type { SetPlan, SetPlanDraft } from "../set-plan-types";

type Props = {
	setPlan: SetPlan;
	index: number;
	weightUnit: WeightUnit;
	weightStep: number;
	exerciseName: string;
	onChange: (setPlanId: SetPlan["id"], next: SetPlanDraft) => void;
	onDelete: (setPlanId: SetPlan["id"]) => void;
};

export const SetPlanRow: FC<Props> = ({
	setPlan,
	index,
	weightUnit,
	weightStep,
	exerciseName,
	onChange,
	onDelete,
}) => {
	const setName = `${exerciseName} ${index + 1}セット目`;
	return (
		<div className={setPlanRowClass}>
			<span className={setPlanIndexClass}>{`#${index + 1}`}</span>
			<span className="flex-1 text-fg tabular-nums">
				{(() => {
					switch (setPlan.pattern) {
						case "weight-reps":
							return `${setPlan.weight}${weightUnit} × ${setPlan.reps}回`;
						case "weight-rpe":
							return `${setPlan.weight}${weightUnit} @ RPE ${setPlan.rpe}`;
						case "reps-rpe":
							return `${setPlan.reps}回 @ RPE ${setPlan.rpe}`;
					}
				})()}
			</span>
			<SetPlanFormDialog
				title={setName}
				trigger={
					<Button intent="plain" size="sq-xs" aria-label={`${setName}を編集`}>
						<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
					</Button>
				}
				initial={setPlan}
				weightUnit={weightUnit}
				weightStep={weightStep}
				onSubmit={(next) => onChange(setPlan.id, next)}
			/>
			<Button
				intent="plain"
				size="sq-xs"
				aria-label={`${setName}を削除`}
				onPress={() => onDelete(setPlan.id)}
			>
				<TrashIcon data-slot="icon" className="size-4" aria-hidden />
			</Button>
		</div>
	);
};
