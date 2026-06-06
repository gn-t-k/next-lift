"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import {
	type ComponentProps,
	type FC,
	type Key,
	type ReactNode,
	useCallback,
} from "react";
import { cn } from "../../libs/utils";
import { Section } from "../../primitives/heading";
import { skeletonClass } from "../../primitives/skeleton";
import { TabPanel, Tabs } from "../../primitives/tabs";
import { CreateDayCard } from "./create-day-card";
import { DayTabs } from "./day-tabs";
import { ExercisePlanSection } from "./exercise-plan-section";
import { ProgramInfo } from "./program-info";
import { SetPlanSection } from "./set-plan-section";
import { useDayTabSelection } from "./use-day-tab-selection";
import {
	type WorkoutHistory,
	WorkoutHistorySection,
} from "./workout-history-section";

type SetPlanChangePayload = Parameters<
	ComponentProps<typeof SetPlanSection>["onChangeSetPlan"]
>[1];

type SetPlanAddPayload = Parameters<
	ComponentProps<typeof SetPlanSection>["onAddSetPlan"]
>[0];

type Props = {
	name: string;
	meta: string | null;
	days: Day[];
	availableExercises: AvailableExercise[];
	defaultSelectedDayId?: string;
	onAddDay: () => void;
	onDeleteDay: (dayId: string) => void;
	onChangeDayLabel: (dayId: string, label: string) => void;
	onChangeProgramInfo: (payload: { name: string; meta: string | null }) => void;
	onDuplicate: () => void;
	onDelete: () => void;
	onAddExercisePlanWithSelectedExercise: (
		dayId: string,
		exerciseId: string,
	) => void;
	onAddExercisePlanWithNewExercise: (dayId: string, name: string) => void;
	onDeleteExercisePlan: (exercisePlanId: string) => void;
	onChangeSetPlan: (setPlanId: string, payload: SetPlanChangePayload) => void;
	onAddSetPlan: (exercisePlanId: string, payload: SetPlanAddPayload) => void;
	onDeleteSetPlan: (setPlanId: string) => void;
	lastAddedExercisePlanId?: string | undefined;
	lastAddedDayId?: string | undefined;
	renderExerciseProgress: (exerciseId: string) => ReactNode;
};

type Day = {
	id: string;
	label: string;
	startWorkoutHref: string;
	workouts: WorkoutHistory[];
	exercisePlans: (ExercisePlan & {
		setPlans: SetPlan[];
	})[];
};

type ExercisePlan = ComponentProps<
	typeof ExercisePlanSection
>["exercisePlans"][number];

type AvailableExercise = ComponentProps<
	typeof ExercisePlanSection
>["availableExercises"][number];

type SetPlan = ComponentProps<typeof SetPlanSection>["setPlans"][number];

export const ProgramDetail: FC<Props> = ({
	name,
	meta,
	days,
	availableExercises,
	defaultSelectedDayId,
	onAddDay,
	onDeleteDay,
	onChangeDayLabel,
	onChangeProgramInfo,
	onDuplicate,
	onDelete,
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	onDeleteExercisePlan,
	onChangeSetPlan,
	onAddSetPlan,
	onDeleteSetPlan,
	lastAddedExercisePlanId,
	lastAddedDayId,
	renderExerciseProgress,
}) => {
	const dayIds = days.map((day) => day.id);
	const firstDayId = dayIds[0];
	const [selectedDayId, selectDay] = useDayTabSelection({
		dayIds,
		defaultSelectedDayId,
		lastAddedDayId,
	});
	const handleChangeSelection = useCallback(
		(key: Key) => {
			selectDay(String(key));
		},
		[selectDay],
	);
	const selectedKey = selectedDayId ?? firstDayId ?? "";

	return (
		<div className="flex flex-col gap-6">
			<ProgramInfo
				name={name}
				meta={meta}
				onChange={onChangeProgramInfo}
				onDuplicate={onDuplicate}
				onDelete={onDelete}
			/>
			{firstDayId === undefined ? (
				<CreateDayCard onAddDay={onAddDay} />
			) : (
				<Section>
					<Tabs
						selectedKey={selectedKey}
						onSelectionChange={handleChangeSelection}
					>
						<DayTabs
							days={days}
							onAddDay={onAddDay}
							onChangeDayLabel={onChangeDayLabel}
							onDeleteDay={onDeleteDay}
						/>
						{days.map((day) => (
							<TabPanel key={day.id} id={day.id} className="pt-4">
								<ExercisePlanSection
									exercisePlans={day.exercisePlans}
									availableExercises={availableExercises}
									onAddExercisePlanWithSelectedExercise={(exerciseId) =>
										onAddExercisePlanWithSelectedExercise(day.id, exerciseId)
									}
									onAddExercisePlanWithNewExercise={(exerciseName) =>
										onAddExercisePlanWithNewExercise(day.id, exerciseName)
									}
									onDeleteExercisePlan={onDeleteExercisePlan}
									renderExerciseProgress={renderExerciseProgress}
								>
									{(exercisePlan) => (
										<SetPlanSection
											setPlans={exercisePlan.setPlans}
											weightUnit={exercisePlan.exercise.weightUnit}
											weightStep={exercisePlan.exercise.weightStep}
											exerciseName={exercisePlan.exercise.name}
											onChangeSetPlan={onChangeSetPlan}
											onAddSetPlan={(payload) =>
												onAddSetPlan(exercisePlan.id, payload)
											}
											onDeleteSetPlan={onDeleteSetPlan}
											autoFocusAddTrigger={
												exercisePlan.id === lastAddedExercisePlanId
											}
										/>
									)}
								</ExercisePlanSection>
								<WorkoutHistorySection
									dayLabel={day.label}
									startWorkoutHref={day.startWorkoutHref}
									workouts={day.workouts}
								/>
							</TabPanel>
						))}
					</Tabs>
				</Section>
			)}
		</div>
	);
};

const SKELETON_DAY_KEYS = ["day-1", "day-2", "day-3"] as const;
const SKELETON_EXERCISE_KEYS = ["exercise-1", "exercise-2"] as const;
const SKELETON_SET_KEYS = ["set-1", "set-2", "set-3"] as const;

export const ProgramDetailLoading: FC = () => {
	return (
		<div className="flex flex-col gap-6" aria-busy>
			<span className="sr-only">プログラム詳細を読み込み中</span>
			<header className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-1 flex-col gap-2">
					<div className={cn(skeletonClass, "h-8 w-2/3 max-w-96")} />
					<div className={cn(skeletonClass, "h-4 w-full max-w-xl")} />
					<div className={cn(skeletonClass, "h-4 w-4/5 max-w-lg")} />
				</div>
				<div className={cn(skeletonClass, "size-8 shrink-0 rounded-md")} />
			</header>
			<Section>
				<div className="flex items-end gap-2 border-border border-b">
					<div className="flex min-w-0 flex-1 gap-2 overflow-hidden">
						{SKELETON_DAY_KEYS.map((key, index) => (
							<div
								key={key}
								className={cn(
									"shrink-0 rounded-t-md px-3 py-2",
									index === 0 ? "border-border border-b-2" : undefined,
								)}
							>
								<div className={cn(skeletonClass, "h-5 w-28")} />
							</div>
						))}
					</div>
					<div className={cn(skeletonClass, "-mb-px size-7 shrink-0")} />
				</div>
				<div className="flex flex-col gap-3 pt-4">
					{SKELETON_EXERCISE_KEYS.map((exerciseKey) => (
						<div
							key={exerciseKey}
							className="flex flex-col gap-2 rounded-lg bg-overlay p-3 shadow-sm"
						>
							<div className="flex items-center justify-between gap-3">
								<div className={cn(skeletonClass, "h-5 w-44 max-w-full")} />
								<div className={cn(skeletonClass, "size-6 shrink-0")} />
							</div>
							<div className="flex flex-col">
								{SKELETON_SET_KEYS.map((setKey) => (
									<div
										key={setKey}
										className="grid grid-cols-[2rem_1fr_1fr_2rem] items-center gap-2 border-border border-t py-2 first:border-t-0"
									>
										<div className={cn(skeletonClass, "h-4 w-6")} />
										<div className={cn(skeletonClass, "h-4 w-16")} />
										<div className={cn(skeletonClass, "h-4 w-12")} />
										<div
											className={cn(skeletonClass, "size-5 justify-self-end")}
										/>
									</div>
								))}
							</div>
						</div>
					))}
					<div className={cn(skeletonClass, "h-10 w-full rounded-lg")} />
				</div>
			</Section>
		</div>
	);
};

type ProgramDetailErrorProps = {
	message?: ReactNode;
};

export const ProgramDetailError: FC<ProgramDetailErrorProps> = ({
	message,
}) => {
	return (
		<div role="alert" className="flex items-start gap-3 p-4">
			<ExclamationTriangleIcon
				aria-hidden
				className="mt-0.5 size-5 shrink-0 text-warning"
			/>
			<div className="flex flex-col gap-1">
				<p className="font-medium text-base text-fg">
					プログラムを取得できませんでした
				</p>
				{message ? <p className="text-muted-fg text-sm">{message}</p> : null}
			</div>
		</div>
	);
};
