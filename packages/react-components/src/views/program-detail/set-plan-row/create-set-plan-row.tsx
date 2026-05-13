"use client";

import type { FC } from "react";
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
}) => (
	<SetPlanFormDialog
		mode="add"
		exerciseName={exerciseName}
		weightUnit={weightUnit}
		weightStep={weightStep}
		index={setPlans.length}
		initial={setPlans[setPlans.length - 1]}
		onSubmit={onAdd}
	/>
);
