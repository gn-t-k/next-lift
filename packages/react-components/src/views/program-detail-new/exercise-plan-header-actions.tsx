"use client";

import type { FC } from "react";
import type { ExercisePlan } from "./exercise-plan-list";
import type { ExercisePlanMemoPayload } from "./exercise-plan-memo-dialog-button";
import { ExercisePlanMemoDialogButton } from "./exercise-plan-memo-dialog-button";
import { HeaderActions } from "./header-actions";
import { HeaderDeleteButton } from "./header-delete-button";

type Props = {
	exercisePlan: ExercisePlan;
	onChangeExercisePlanInfo: (
		exercisePlanId: string,
		payload: ExercisePlanMemoPayload,
	) => void;
	onDeleteExercisePlan: (exercisePlanId: string) => void;
};

export type OnChangeExercisePlanInfo = Props["onChangeExercisePlanInfo"];
export type OnDeleteExercisePlan = Props["onDeleteExercisePlan"];

export const ExercisePlanHeaderActions: FC<Props> = ({
	exercisePlan,
	onChangeExercisePlanInfo,
	onDeleteExercisePlan,
}) => (
	<HeaderActions>
		<ExercisePlanMemoDialogButton
			exercisePlan={exercisePlan}
			onChange={onChangeExercisePlanInfo}
		/>
		<HeaderDeleteButton
			label={`${exercisePlan.exercise.name}の種目計画を削除`}
			onDelete={() => onDeleteExercisePlan(exercisePlan.id)}
		/>
	</HeaderActions>
);
