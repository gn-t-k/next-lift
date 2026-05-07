import type { ComponentProps, FC } from "react";
import {
	Tab,
	TabList,
	TabPanel,
	TabScrollArea,
	Tabs,
} from "../../primitives/tabs";
import { CreateDayCard } from "./create-day-card";
import { ExercisePlanSection } from "./exercise-plan-section";
import { SetPlanSection } from "./set-plan-section";

type Props = {
	name: string;
	meta: string | null;
	days: Day[];
	defaultSelectedDayId?: string;
	onAddDay: () => void;
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
}) => {
	const tabsProps =
		defaultSelectedDayId !== undefined
			? { defaultValue: defaultSelectedDayId }
			: {};
	return (
		<div className="flex flex-col gap-6">
			<header className="flex flex-col gap-2">
				<h1 className="font-semibold text-2xl text-fg">{name}</h1>
				{meta !== null && meta !== "" && (
					<p className="whitespace-pre-wrap text-muted-fg text-sm">{meta}</p>
				)}
			</header>
			{days.length === 0 ? (
				<CreateDayCard onAddDay={onAddDay} />
			) : (
				<Tabs {...tabsProps}>
					<TabScrollArea>
						<TabList aria-label="Day">
							{days.map((day) => (
								<Tab key={day.id} id={day.id}>
									{day.label}
								</Tab>
							))}
						</TabList>
					</TabScrollArea>
					{days.map((day) => (
						<TabPanel key={day.id} id={day.id} className="pt-4">
							<ExercisePlanSection exercisePlans={day.exercisePlans}>
								{(exercisePlan) => (
									<SetPlanSection
										setPlans={exercisePlan.setPlans}
										weightUnit={exercisePlan.exercise?.weightUnit ?? "kg"}
									/>
								)}
							</ExercisePlanSection>
						</TabPanel>
					))}
				</Tabs>
			)}
		</div>
	);
};
