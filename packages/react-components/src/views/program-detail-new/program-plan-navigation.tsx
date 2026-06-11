import type { ComponentProps, FC } from "react";
import { Heading, Section } from "../../primitives/heading";
import type { ProgramDetailNew } from ".";
import type { Day } from "./day-list";
import { DrilldownPanel } from "./drilldown-panel";
import type { ExercisePlan } from "./exercise-plan-list";
import { MillerColumns } from "./miller-columns";
import { ProgramPlanGrid } from "./program-plan-grid";
import type {
	NavigationTarget,
	ProgramPlanSelection,
} from "./use-program-plan-selection";

type RootProps = ComponentProps<typeof ProgramDetailNew>;

type Props = {
	programName: string;
	programMeta?: string | undefined;
	days: RootProps["days"];
	registeredExercises: RootProps["registeredExercises"];
	selection: ProgramPlanSelection;
	selectedDay: Day | undefined;
	selectedExercisePlan: ExercisePlan | undefined;
	currentTarget: NavigationTarget | undefined;
	onSelectDay: (dayId: string) => void;
	onSelectExercisePlan: (dayId: string, exercisePlanId: string) => void;
	onSelectRoot: () => void;
	onSelectTarget: (target: NavigationTarget) => void;
	onAddDay: RootProps["onAddDay"];
	onDeleteDay: RootProps["onDeleteDay"];
	onChangeDayInfo: RootProps["onChangeDayInfo"];
	onChangeProgramInfo: RootProps["onChangeProgramInfo"];
	onAddExercisePlanWithSelectedExercise: RootProps["onAddExercisePlanWithSelectedExercise"];
	onAddExercisePlanWithNewExercise: RootProps["onAddExercisePlanWithNewExercise"];
	onChangeExercisePlanInfo: RootProps["onChangeExercisePlanInfo"];
	onDeleteExercisePlan: RootProps["onDeleteExercisePlan"];
	onChangeSetPlan: RootProps["onChangeSetPlan"];
	onAddSetPlan: RootProps["onAddSetPlan"];
	onDeleteSetPlan: RootProps["onDeleteSetPlan"];
	renderWorkoutHistory: RootProps["renderWorkoutHistory"];
	renderExerciseProgress: RootProps["renderExerciseProgress"];
};

export const ProgramPlanNavigation: FC<Props> = (props) => (
	<Section className="@container flex flex-col gap-3">
		<Heading className="sr-only">プログラム内容</Heading>
		<ProgramPlanGrid>
			<MillerColumns {...props} />
		</ProgramPlanGrid>
		<div className="@min-[56rem]:hidden">
			<DrilldownPanel {...props} />
		</div>
	</Section>
);
