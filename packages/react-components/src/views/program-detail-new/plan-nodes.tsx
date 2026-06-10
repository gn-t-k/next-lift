"use client";

import {
	AdjustmentsHorizontalIcon,
	ChevronRightIcon,
	PlusIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import type { FC, ReactNode } from "react";
import { useState } from "react";
import { cn } from "../../libs";
import { Button } from "../../primitives/button";
import { ExerciseSelectorComboBox } from "../exercise-selector/exercise-selector-combo-box";
import { SetPlanFormDialog } from "../program-detail/set-plan-section/set-plan-form-dialog";
import type {
	SetPlan,
	SetPlanDraft,
} from "../program-detail/set-plan-section/set-plan-types";
import type {
	AvailableExercise,
	Day,
	ExercisePlan,
	ProgramPlanSelection,
} from "./types";

type DayListProps = {
	days: Day[];
	selection: ProgramPlanSelection;
	onSelectDay: (dayId: string) => void;
	onAddDay: () => void;
};

export const DayList: FC<DayListProps> = ({
	days,
	selection,
	onSelectDay,
	onAddDay,
}) => (
	<div className="flex min-h-0 flex-1 flex-col gap-2">
		{days.length > 0 && (
			<ol className="flex flex-col gap-1">
				{days.map((day) => (
					<li key={day.id}>
						<DayNode
							day={day}
							isSelected={selection.dayId === day.id}
							onSelect={() => onSelectDay(day.id)}
						/>
					</li>
				))}
			</ol>
		)}
		<AddDayButton onAddDay={onAddDay} />
	</div>
);

type ExercisePlanListProps = {
	day: Day | undefined;
	availableExercises: AvailableExercise[];
	selection: ProgramPlanSelection;
	onSelectExercisePlan: (dayId: string, exercisePlanId: string) => void;
	onAddExercisePlanWithSelectedExercise: (
		dayId: string,
		exerciseId: string,
	) => void;
	onAddExercisePlanWithNewExercise: (dayId: string, name: string) => void;
	workoutHistory?: ReactNode | undefined;
};

export const ExercisePlanList: FC<ExercisePlanListProps> = ({
	day,
	availableExercises,
	selection,
	onSelectExercisePlan,
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	workoutHistory,
}) => {
	const [selectorResetKey, setSelectorResetKey] = useState(0);

	if (day === undefined) {
		return (
			<MissingParentState>
				Day を選ぶと、種目計画を追加・確認できます。
			</MissingParentState>
		);
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-2">
			{day.exercisePlans.length > 0 && (
				<ol className="flex flex-col gap-1">
					{day.exercisePlans.map((exercisePlan) => (
						<li key={exercisePlan.id}>
							<ExercisePlanNode
								exercisePlan={exercisePlan}
								isSelected={selection.exercisePlanId === exercisePlan.id}
								onSelect={() => onSelectExercisePlan(day.id, exercisePlan.id)}
							/>
						</li>
					))}
				</ol>
			)}
			<div
				className={cn(
					"[&_[data-slot=control]>[data-slot=control]]:h-12",
					"[&_[data-slot=control]>[data-slot=control]]:rounded-lg",
					"[&_[data-slot=control]>[data-slot=control]]:border-dashed",
					"[&_[data-slot=control]>[data-slot=control]]:bg-transparent",
					"[&_[data-slot=control]>[data-slot=control]]:text-muted-fg",
				)}
			>
				<ExerciseSelectorComboBox
					key={selectorResetKey}
					exercises={availableExercises}
					label="種目計画を追加"
					onSelect={(exerciseId) => {
						onAddExercisePlanWithSelectedExercise(day.id, exerciseId);
						setSelectorResetKey((key) => key + 1);
					}}
					onCreateExercise={(name) => {
						onAddExercisePlanWithNewExercise(day.id, name);
						setSelectorResetKey((key) => key + 1);
					}}
				/>
			</div>
			{workoutHistory !== undefined ? (
				<div className="mt-2">{workoutHistory}</div>
			) : null}
		</div>
	);
};

type SetPlanListProps = {
	exercisePlan: ExercisePlan | undefined;
	onChangeSetPlan: (setPlanId: string, payload: SetPlanDraft) => void;
	onAddSetPlan: (exercisePlanId: string, payload: SetPlanDraft) => void;
	onDeleteSetPlan: (setPlanId: string) => void;
	autoFocusAddTrigger: boolean;
	exerciseProgress?: ReactNode | undefined;
};

export const SetPlanList: FC<SetPlanListProps> = ({
	exercisePlan,
	onChangeSetPlan,
	onAddSetPlan,
	onDeleteSetPlan,
	autoFocusAddTrigger,
	exerciseProgress,
}) => {
	if (exercisePlan === undefined) {
		return (
			<MissingParentState>
				種目計画を選ぶと、セット計画を追加・確認できます。
			</MissingParentState>
		);
	}

	const lastSetPlan = exercisePlan.setPlans[exercisePlan.setPlans.length - 1];
	const lastSetPlanDraft =
		lastSetPlan === undefined ? undefined : toSetPlanDraft(lastSetPlan);

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-2">
			{exercisePlan.setPlans.length > 0 && (
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
			)}
			{lastSetPlanDraft === undefined ? (
				<SetPlanFormDialog
					title={`${exercisePlan.exercise.name} 1セット計画を追加`}
					trigger={
						<AddSetButton
							label="セット計画を追加"
							autoFocus={autoFocusAddTrigger}
						/>
					}
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

type DayNodeProps = {
	day: Day;
	isSelected: boolean;
	onSelect: () => void;
};

const DayNode: FC<DayNodeProps> = ({ day, isSelected, onSelect }) => {
	const trailing = (
		<ChevronRightIcon
			data-slot="icon"
			className="size-4 text-muted-fg"
			aria-hidden
		/>
	);

	return (
		<button
			type="button"
			onClick={onSelect}
			className={nodeButtonClass(isSelected, true)}
			{...(isSelected ? { "aria-current": "true" as const } : {})}
		>
			<DayNodeContent day={day} isSelected={isSelected} />
			{trailing}
		</button>
	);
};

const DayNodeContent: FC<{ day: Day; isSelected: boolean }> = ({
	day,
	isSelected,
}) => (
	<span className="min-w-0 flex-1">
		<span className="block truncate font-medium">{day.label}</span>
		<span
			className={cn(
				"mt-0.5 block text-xs",
				isSelected ? "text-primary-subtle-fg" : "text-muted-fg",
			)}
		>
			{day.exercisePlans.length} 種目計画
		</span>
	</span>
);

type ExercisePlanNodeProps = {
	exercisePlan: ExercisePlan;
	isSelected: boolean;
	onSelect: () => void;
};

const ExercisePlanNode: FC<ExercisePlanNodeProps> = ({
	exercisePlan,
	isSelected,
	onSelect,
}) => {
	const trailing = (
		<ChevronRightIcon
			data-slot="icon"
			className="size-4 text-muted-fg"
			aria-hidden
		/>
	);

	return (
		<button
			type="button"
			onClick={onSelect}
			className={nodeButtonClass(isSelected, true)}
			{...(isSelected ? { "aria-current": "true" as const } : {})}
		>
			<ExercisePlanNodeContent
				exercisePlan={exercisePlan}
				isSelected={isSelected}
			/>
			{trailing}
		</button>
	);
};

const ExercisePlanNodeContent: FC<{
	exercisePlan: ExercisePlan;
	isSelected: boolean;
}> = ({ exercisePlan, isSelected }) => (
	<span className="min-w-0 flex-1">
		<span className="block truncate font-medium">
			{getExercisePlanTitle(exercisePlan)}
		</span>
		<span
			className={cn(
				"mt-0.5 block text-xs",
				isSelected ? "text-primary-subtle-fg" : "text-muted-fg",
			)}
		>
			{exercisePlan.setPlans.length} セット計画
		</span>
	</span>
);

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

type AddDayButtonProps = {
	onAddDay: () => void;
};

const AddDayButton: FC<AddDayButtonProps> = ({ onAddDay }) => (
	<Button
		intent="plain"
		size="sm"
		onPress={onAddDay}
		className={cn(
			"h-12 w-full justify-start border-border border-dashed px-3 py-2 text-muted-fg sm:h-12",
			"hover:border-solid hover:bg-secondary hover:text-fg",
		)}
	>
		<PlusIcon data-slot="icon" className="size-4" aria-hidden />
		Day を追加
	</Button>
);

type AddSetButtonProps = {
	label: string;
	autoFocus?: boolean | undefined;
	onPress?: (() => void) | undefined;
};

const AddSetButton: FC<AddSetButtonProps> = ({ label, autoFocus, onPress }) => (
	<Button
		intent="plain"
		size="sm"
		className={cn(
			"min-h-11 w-full justify-start border-border border-dashed px-3 py-2 text-muted-fg sm:min-h-11",
			"hover:border-solid hover:bg-secondary hover:text-fg",
		)}
		{...(autoFocus !== undefined ? { autoFocus } : {})}
		{...(onPress !== undefined ? { onPress } : {})}
	>
		<PlusIcon data-slot="icon" className="size-4" aria-hidden />
		{label}
	</Button>
);

export const EmptyState: FC<{ children: ReactNode }> = ({ children }) => (
	<div className="flex min-h-24 items-center justify-center rounded-md bg-secondary px-3 py-4 text-center text-muted-fg text-sm">
		{children}
	</div>
);

export const MissingParentState: FC<{ children: ReactNode }> = ({
	children,
}) => (
	<div className="flex min-h-full flex-1 items-center justify-center px-3 py-4 text-center text-muted-fg text-sm">
		{children}
	</div>
);

export const formatSetPlan = (
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

const getExercisePlanTitle = (exercisePlan: ExercisePlan): string =>
	exercisePlan.exercise.name;

const nodeButtonClass = (isSelected: boolean, isInteractive: boolean) =>
	cn(
		"flex h-12 w-full min-w-0 appearance-none items-center justify-start gap-2 overflow-hidden rounded-lg border bg-transparent px-3 py-2 text-left font-normal text-sm/5 sm:h-12",
		isSelected
			? "border-primary-subtle-fg/30 bg-primary-subtle text-primary-subtle-fg"
			: "border-transparent text-fg",
		isInteractive
			? isSelected
				? "cursor-pointer hover:bg-primary-subtle hover:text-primary-subtle-fg"
				: "cursor-pointer hover:bg-secondary hover:text-fg"
			: "cursor-default",
	);
