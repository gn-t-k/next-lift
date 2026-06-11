"use client";

import {
	AdjustmentsHorizontalIcon,
	PlusIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import type { FC, ReactNode } from "react";
import { cn } from "../../libs";
import { Button } from "../../primitives/button";
import type { ExercisePlan } from "./exercise-plan-list";
import { SetPlanFormDialog } from "./set-plan-form-dialog";

// セット計画ドメインの型正本（SetPlanFormDialog 等はここから import）
export type SetPlan =
	| { id: string; pattern: "weight-reps"; weight: number; reps: number }
	| { id: string; pattern: "weight-rpe"; weight: number; rpe: number }
	| { id: string; pattern: "reps-rpe"; reps: number; rpe: number };

// まだ永続化されていないため id を持たないセット計画
export type SetPlanDraft = DistributiveOmit<SetPlan, "id">;

type DistributiveOmit<T, K extends keyof T> = T extends unknown
	? Omit<T, K>
	: never;

type Props = {
	exercisePlan: ExercisePlan;
	onChangeSetPlan: (setPlanId: string, payload: SetPlanDraft) => void;
	onAddSetPlan: (exercisePlanId: string, payload: SetPlanDraft) => void;
	onDeleteSetPlan: (setPlanId: string) => void;
	exerciseProgress: ReactNode;
};

export type OnChangeSetPlan = Props["onChangeSetPlan"];
export type OnAddSetPlan = Props["onAddSetPlan"];
export type OnDeleteSetPlan = Props["onDeleteSetPlan"];
export type RenderExerciseProgress = (exercisePlan: ExercisePlan) => ReactNode;

export const SetPlanList: FC<Props> = ({
	exercisePlan,
	onChangeSetPlan,
	onAddSetPlan,
	onDeleteSetPlan,
	exerciseProgress,
}) => {
	const lastSetPlan = exercisePlan.setPlans[exercisePlan.setPlans.length - 1];
	const lastSetPlanDraft =
		lastSetPlan === undefined ? undefined : toSetPlanDraft(lastSetPlan);

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-2">
			{exercisePlan.setPlans.length > 0 ? (
				<ol className="flex flex-col gap-1">
					{exercisePlan.setPlans.map((setPlan, index) => (
						<li key={setPlan.id}>
							<SetPlanNode
								setPlan={setPlan}
								index={index}
								weightUnit={exercisePlan.exercise.weightUnit}
								weightStep={exercisePlan.exercise.weightStep}
								exerciseName={exercisePlan.exercise.name}
								onChange={onChangeSetPlan}
								onDelete={onDeleteSetPlan}
							/>
						</li>
					))}
				</ol>
			) : null}
			{lastSetPlanDraft === undefined ? (
				<SetPlanFormDialog
					title={`${exercisePlan.exercise.name} 1セット計画を追加`}
					trigger={<AddSetButton label="セット計画を追加" />}
					initial={undefined}
					weightUnit={exercisePlan.exercise.weightUnit}
					weightStep={exercisePlan.exercise.weightStep}
					onSubmit={(payload) => onAddSetPlan(exercisePlan.id, payload)}
				/>
			) : (
				<AddSetButton
					label={`${formatSetPlan(lastSetPlanDraft, exercisePlan.exercise.weightUnit)}のセット計画を追加`}
					onPress={() => onAddSetPlan(exercisePlan.id, lastSetPlanDraft)}
				/>
			)}
			{exerciseProgress !== undefined ? (
				<div className="mt-2">{exerciseProgress}</div>
			) : null}
		</div>
	);
};

type SetPlanNodeProps = {
	setPlan: SetPlan;
	index: number;
	weightUnit: ExercisePlan["exercise"]["weightUnit"];
	weightStep: number;
	exerciseName: string;
	onChange: (setPlanId: string, payload: SetPlanDraft) => void;
	onDelete: (setPlanId: string) => void;
};

const SetPlanNode: FC<SetPlanNodeProps> = ({
	setPlan,
	index,
	weightUnit,
	weightStep,
	exerciseName,
	onChange,
	onDelete,
}) => {
	const setName = `${exerciseName} ${index + 1}セット計画`;
	return (
		<div className="flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 text-sm">
			<div className="flex min-w-0 flex-1 items-baseline gap-3">
				<span className="w-8 shrink-0 text-muted-fg text-xs tabular-nums">
					{`#${index + 1}`}
				</span>
				<span className="min-w-0 flex-1 truncate text-sm tabular-nums">
					{formatSetPlan(setPlan, weightUnit)}
				</span>
			</div>
			<SetPlanFormDialog
				title={setName}
				trigger={
					<Button intent="plain" size="sq-xs" aria-label={`${setName}を編集`}>
						<AdjustmentsHorizontalIcon
							data-slot="icon"
							className="size-4"
							aria-hidden
						/>
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
				className="shrink-0"
			>
				<TrashIcon data-slot="icon" className="size-4" aria-hidden />
			</Button>
		</div>
	);
};

type AddSetButtonProps = {
	label: string;
	onPress?: (() => void) | undefined;
};

const AddSetButton: FC<AddSetButtonProps> = ({ label, onPress }) => (
	<Button
		intent="plain"
		size="sm"
		className={cn(
			"min-h-11 w-full justify-start border-border border-dashed px-3 py-2 text-muted-fg sm:min-h-11",
			"hover:border-solid hover:bg-secondary hover:text-fg",
		)}
		{...(onPress !== undefined ? { onPress } : {})}
	>
		<PlusIcon data-slot="icon" className="size-4" aria-hidden />
		{label}
	</Button>
);

const formatSetPlan = (
	setPlan: SetPlan | SetPlanDraft,
	weightUnit: ExercisePlan["exercise"]["weightUnit"],
): string => {
	switch (setPlan.pattern) {
		case "weight-reps":
			return `${setPlan.weight}${weightUnit} × ${setPlan.reps}回`;
		case "weight-rpe":
			return `${setPlan.weight}${weightUnit} @ RPE ${setPlan.rpe}`;
		case "reps-rpe":
			return `${setPlan.reps}回 @ RPE ${setPlan.rpe}`;
	}
};

const toSetPlanDraft = (setPlan: SetPlan): SetPlanDraft => {
	const { id: _, ...draft } = setPlan;
	return draft;
};
