"use client";

import type { FC } from "react";
import type { SetPlanWithParams, WeightUnit } from "../set-plan-types";
import { SetPlanAddDialog } from "./set-plan-add-dialog";

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
}) => (
	<SetPlanAddDialog
		exerciseName={exerciseName}
		weightUnit={weightUnit}
		weightStep={weightStep}
		nextIndex={setPlans.length}
		previousSetPlan={setPlans[setPlans.length - 1]}
		onAdd={onAdd}
	/>
);
