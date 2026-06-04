"use client";

import {
	type ComponentProps,
	type FC,
	type Key,
	type ReactNode,
	useCallback,
} from "react";
import { Section } from "../../primitives/heading";
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
	renderExerciseProgress?: ((exerciseId: string) => ReactNode) | undefined;
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
