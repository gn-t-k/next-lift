import type { ComponentProps, FC } from "react";
import { Heading, Section } from "../../primitives/heading";
import { ScrollArea } from "../../primitives/scrollable";
import { Tab, TabList, TabPanel, Tabs } from "../../primitives/tabs";
import { CreateDayCard } from "./create-day-card";
import { ExercisePlanSection } from "./exercise-plan-section";
import { SetPlanSection } from "./set-plan-section";

type SetPlanChangePayload = Parameters<
	ComponentProps<typeof SetPlanSection>["onSetPlanChange"]
>[1];

type SetPlanAddPayload = Parameters<
	ComponentProps<typeof SetPlanSection>["onAddSetPlan"]
>[0];

type Props = {
	name: string;
	meta: string | null;
	days: Day[];
	defaultSelectedDayId?: string;
	onAddDay: () => void;
	onAddExercisePlan: (dayId: string) => void;
	onDeleteExercisePlan: (exercisePlanId: string) => void;
	onSetPlanChange: (setPlanId: string, payload: SetPlanChangePayload) => void;
	onAddSetPlan: (exercisePlanId: string, payload: SetPlanAddPayload) => void;
	onDeleteSetPlan: (setPlanId: string) => void;
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

type SetPlan = ComponentProps<typeof SetPlanSection>["setPlans"][number];

export const ProgramDetail: FC<Props> = ({
	name,
	meta,
	days,
	defaultSelectedDayId,
	onAddDay,
	onAddExercisePlan,
	onDeleteExercisePlan,
	onSetPlanChange,
	onAddSetPlan,
	onDeleteSetPlan,
}) => {
	const tabsProps =
		defaultSelectedDayId !== undefined
			? { defaultValue: defaultSelectedDayId }
			: {};
	return (
		<div className="flex flex-col gap-6">
			<header className="flex flex-col gap-2">
				<Heading>{name}</Heading>
				{meta !== null && meta !== "" && (
					<p className="whitespace-pre-wrap text-muted-fg text-sm">{meta}</p>
				)}
			</header>
			{days.length === 0 ? (
				<CreateDayCard onAddDay={onAddDay} />
			) : (
				<Section>
					<Tabs {...tabsProps}>
						<ScrollArea>
							<TabList aria-label="Day">
								{days.map((day) => (
									<Tab key={day.id} id={day.id}>
										{day.label}
									</Tab>
								))}
							</TabList>
						</ScrollArea>
						{days.map((day) => (
							<TabPanel key={day.id} id={day.id} className="pt-4">
								<ExercisePlanSection
									exercisePlans={day.exercisePlans}
									onAddExercisePlan={() => onAddExercisePlan(day.id)}
									onDeleteExercisePlan={onDeleteExercisePlan}
								>
									{(exercisePlan) =>
										exercisePlan.exercise !== null ? (
											<SetPlanSection
												setPlans={exercisePlan.setPlans}
												weightUnit={exercisePlan.exercise.weightUnit}
												weightStep={exercisePlan.exercise.weightStep}
												exerciseName={exercisePlan.exercise.name}
												onSetPlanChange={onSetPlanChange}
												onAddSetPlan={(payload) =>
													onAddSetPlan(exercisePlan.id, payload)
												}
												onDeleteSetPlan={onDeleteSetPlan}
											/>
										) : null
									}
								</ExercisePlanSection>
							</TabPanel>
						))}
					</Tabs>
				</Section>
			)}
		</div>
	);
};
