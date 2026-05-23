"use client";

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { type ComponentProps, type FC, useState } from "react";
import { Button } from "../../primitives/button";
import { Heading, Section } from "../../primitives/heading";
import { ScrollArea } from "../../primitives/scrollable";
import { Tab, TabList, TabPanel, Tabs } from "../../primitives/tabs";
import { CreateDayCard } from "./create-day-card";
import { ExercisePlanSection } from "./exercise-plan-section";
import { SetPlanSection } from "./set-plan-section";

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
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	onDeleteExercisePlan,
	onChangeSetPlan,
	onAddSetPlan,
	onDeleteSetPlan,
	lastAddedExercisePlanId,
	lastAddedDayId,
}) => {
	const [selectedDayId, setSelectedDayId] = useState<string | undefined>(
		defaultSelectedDayId,
	);
	const [prevLastAddedDayId, setPrevLastAddedDayId] = useState<
		string | undefined
	>(undefined);
	if (lastAddedDayId !== prevLastAddedDayId) {
		setPrevLastAddedDayId(lastAddedDayId);
		if (lastAddedDayId !== undefined) {
			setSelectedDayId(lastAddedDayId);
		}
	}
	const firstDayId = days[0]?.id;
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
						selectedKey={
							selectedDayId !== undefined &&
							days.some((day) => day.id === selectedDayId)
								? selectedDayId
								: firstDayId
						}
						onSelectionChange={(key) => setSelectedDayId(String(key))}
					>
						<div className="flex items-end gap-2 border-border border-b">
							<ScrollArea className="flex-1">
								<TabList aria-label="Day" className="border-b-0">
									{days.map((day) => (
										<Tab
											key={day.id}
											id={day.id}
											aria-label={day.label}
											className="gap-x-1.5 pr-1.5"
										>
											<span>{day.label}</span>
											<Button
												intent="plain"
												size="sq-xs"
												aria-label={`${day.label}を削除`}
												onPress={() => onDeleteDay(day.id)}
												className="size-5 min-h-0 border-0 sm:size-5"
											>
												<XMarkIcon
													data-slot="icon"
													className="size-3.5"
													aria-hidden
												/>
											</Button>
										</Tab>
									))}
								</TabList>
							</ScrollArea>
							<Button
								intent="plain"
								size="sq-xs"
								aria-label="Day を追加"
								onPress={onAddDay}
								className="-mb-px shrink-0"
							>
								<PlusIcon data-slot="icon" className="size-4" aria-hidden />
							</Button>
						</div>
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
