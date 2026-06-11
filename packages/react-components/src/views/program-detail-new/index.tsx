"use client";

import type { FC, PropsWithChildren, ReactNode } from "react";
import { Heading, Section } from "../../primitives/heading";
import type { OnChangeDayInfo, OnDeleteDay } from "./day-header-actions";
import type { Day, OnAddDay } from "./day-list";
import {
	DrilldownPanel,
	DrilldownPanelError,
	DrilldownPanelLoading,
} from "./drilldown-panel";
import type {
	OnChangeExercisePlanInfo,
	OnDeleteExercisePlan,
} from "./exercise-plan-header-actions";
import type {
	OnAddExercisePlanWithNewExercise,
	OnAddExercisePlanWithSelectedExercise,
	RegisteredExercise,
	RenderWorkoutHistory,
} from "./exercise-plan-list";
import {
	MillerColumns,
	MillerColumnsError,
	MillerColumnsLoading,
} from "./miller-columns";
import type { OnChangeProgramInfo } from "./program-info-dialog-button";
import type {
	OnAddSetPlan,
	OnChangeSetPlan,
	OnDeleteSetPlan,
	RenderExerciseProgress,
} from "./set-plan-list";
import type { UseProgramPlanSelectionState } from "./use-program-plan-selection";
import { useProgramPlanSelection } from "./use-program-plan-selection";

type ProgramDetailNewDataProps = {
	name: string;
	meta?: string | undefined;
	days: Day[];
	registeredExercises: RegisteredExercise[];
	initialState?: UseProgramPlanSelectionState | undefined;
};

type ProgramDetailNewCallbackProps = {
	onAddDay: OnAddDay;
	onDeleteDay: OnDeleteDay;
	onChangeDayInfo: OnChangeDayInfo;
	onChangeProgramInfo: OnChangeProgramInfo;
	onAddExercisePlanWithSelectedExercise: OnAddExercisePlanWithSelectedExercise;
	onAddExercisePlanWithNewExercise: OnAddExercisePlanWithNewExercise;
	onChangeExercisePlanInfo: OnChangeExercisePlanInfo;
	onDeleteExercisePlan: OnDeleteExercisePlan;
	onChangeSetPlan: OnChangeSetPlan;
	onAddSetPlan: OnAddSetPlan;
	onDeleteSetPlan: OnDeleteSetPlan;
	renderWorkoutHistory: RenderWorkoutHistory;
	renderExerciseProgress: RenderExerciseProgress;
};

type Props = ProgramDetailNewDataProps & ProgramDetailNewCallbackProps;

export const ProgramDetailNew: FC<Props> = ({
	name,
	meta,
	days,
	registeredExercises,
	initialState,
	onAddDay,
	onDeleteDay,
	onChangeDayInfo,
	onChangeProgramInfo,
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	onChangeExercisePlanInfo,
	onDeleteExercisePlan,
	onChangeSetPlan,
	onAddSetPlan,
	onDeleteSetPlan,
	renderWorkoutHistory,
	renderExerciseProgress,
}) => {
	const [state, { selectDay, selectExercisePlan, selectRoot }] =
		useProgramPlanSelection({
			days,
			initialState,
		});

	const planProps = {
		programName: name,
		programMeta: meta,
		days,
		registeredExercises,
		state,
		onSelectDay: selectDay,
		onSelectExercisePlan: selectExercisePlan,
		onAddDay,
		onDeleteDay,
		onChangeDayInfo,
		onChangeProgramInfo,
		onAddExercisePlanWithSelectedExercise,
		onAddExercisePlanWithNewExercise,
		onChangeExercisePlanInfo,
		onDeleteExercisePlan,
		onChangeSetPlan,
		onAddSetPlan,
		onDeleteSetPlan,
		renderWorkoutHistory,
		renderExerciseProgress,
	};

	return (
		<div className="@container flex flex-col gap-6">
			<Heading className="sr-only">{name}</Heading>
			<Section className="@container flex flex-col gap-3">
				<Heading className="sr-only">プログラム内容</Heading>
				<DesktopPlanViewport>
					<MillerColumns {...planProps} />
				</DesktopPlanViewport>
				<MobilePlanViewport>
					<DrilldownPanel {...planProps} onSelectRoot={selectRoot} />
				</MobilePlanViewport>
			</Section>
		</div>
	);
};

export const ProgramDetailNewLoading: FC = () => (
	<div className="@container flex flex-col gap-3" aria-busy>
		<Heading className="sr-only">プログラム詳細</Heading>
		<span className="sr-only">プログラム詳細を読み込み中</span>
		<DesktopPlanViewport>
			<MillerColumnsLoading />
		</DesktopPlanViewport>
		<MobilePlanViewport>
			<DrilldownPanelLoading />
		</MobilePlanViewport>
	</div>
);

type ProgramDetailNewErrorProps = {
	message?: ReactNode;
};

export const ProgramDetailNewError: FC<ProgramDetailNewErrorProps> = ({
	message,
}) => (
	<div className="@container flex flex-col gap-3">
		<Heading className="sr-only">プログラム詳細</Heading>
		<DesktopPlanViewport>
			<MillerColumnsError message={message} />
		</DesktopPlanViewport>
		<MobilePlanViewport>
			<DrilldownPanelError message={message} />
		</MobilePlanViewport>
	</div>
);

const DesktopPlanViewport: FC<PropsWithChildren> = ({ children }) => (
	<div className="@min-[56rem]:block hidden">{children}</div>
);

const MobilePlanViewport: FC<PropsWithChildren> = ({ children }) => (
	<div className="@min-[56rem]:hidden">{children}</div>
);
