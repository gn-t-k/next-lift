"use client";

import { type ComponentProps, type FC, type Key, useCallback } from "react";
import { Heading, Section } from "../../primitives/heading";
import { TabPanel, Tabs } from "../../primitives/tabs";
import { CreateDayCard } from "./create-day-card";
import { DayTabs } from "./day-tabs";
import { ExercisePlanSection } from "./exercise-plan-section";
import { SetPlanSection } from "./set-plan-section";
import { useDayTabSelection } from "./use-day-tab-selection";

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
};

type Day = {
	id: string;
	label: string;
	detailHref: string;
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
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	onDeleteExercisePlan,
	onChangeSetPlan,
	onAddSetPlan,
	onDeleteSetPlan,
	lastAddedExercisePlanId,
	lastAddedDayId,
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
			<header className="flex flex-col gap-2">
				<Heading>{name}</Heading>
				{meta !== null && meta !== "" && (
					<p className="whitespace-pre-wrap text-muted-fg text-sm">{meta}</p>
				)}
			</header>
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
							</TabPanel>
						))}
					</Tabs>
				</Section>
			)}
		</div>
	);
};
