"use client";

import { ChartBarIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { type ComponentProps, type FC, type ReactNode, useState } from "react";
import { cn, useMediaQuery } from "../../libs";
import { Button } from "../../primitives/button";
import { Heading, Section } from "../../primitives/heading";
import { Link } from "../../primitives/link";
import { ResponsiveDialog } from "../../primitives/responsive-dialog";
import { ExerciseSelector } from "../exercise-selector";
import type { WeightUnit } from "../weight-unit";

// T で caller 側の追加フィールド（setPlans 等）を保持し、children 関数に渡せるようにする
type Props<T extends ExercisePlan> = {
	exercisePlans: T[];
	availableExercises: ComponentProps<typeof ExerciseSelector>["exercises"];
	onAddExercisePlanWithSelectedExercise: (exerciseId: string) => void;
	onAddExercisePlanWithNewExercise: (name: string) => void;
	onDeleteExercisePlan: (exercisePlanId: string) => void;
	children: (exercisePlan: T) => ReactNode;
	renderExerciseProgress: (exerciseId: string) => ReactNode;
};

type ExercisePlan = {
	id: string;
	exercise: Exercise;
};

type Exercise = {
	id: string;
	name: string;
	weightUnit: WeightUnit;
	weightStep: number;
	detailHref: string;
};

export const ExercisePlanSection = <T extends ExercisePlan>({
	exercisePlans,
	availableExercises,
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	onDeleteExercisePlan,
	children,
	renderExerciseProgress,
}: Props<T>): ReactNode => {
	const desktopViewport = useMediaQuery("(min-width: 768px)");

	return (
		<div className="flex flex-col gap-3">
			{exercisePlans.length > 0 && (
				<ol className="flex flex-col gap-3">
					{exercisePlans.map((exercisePlan) => (
						<li key={exercisePlan.id}>
							<Section className={exercisePlanCardClass}>
								<header className={exercisePlanHeaderClass}>
									<Heading className="min-w-0 font-medium text-base">
										<Link
											href={exercisePlan.exercise.detailHref}
											className={cn(
												"rounded text-fg no-underline outline-none",
												"hover:underline",
												"focus-visible:ring-2 focus-visible:ring-ring",
											)}
										>
											{exercisePlan.exercise.name}
										</Link>
									</Heading>
									<ExerciseProgressDialog
										exercise={exercisePlan.exercise}
										desktopViewport={desktopViewport}
										renderExerciseProgress={renderExerciseProgress}
									/>
								</header>
								<Button
									intent="plain"
									size="sq-xs"
									aria-label={`${exercisePlan.exercise.name}を削除`}
									onPress={() => onDeleteExercisePlan(exercisePlan.id)}
									className="absolute top-2 right-2"
								>
									<XMarkIcon data-slot="icon" className="size-4" aria-hidden />
								</Button>
								{children(exercisePlan)}
							</Section>
						</li>
					))}
				</ol>
			)}
			<ExerciseSelector
				exercises={availableExercises}
				onSelect={onAddExercisePlanWithSelectedExercise}
				onCreateExercise={onAddExercisePlanWithNewExercise}
				label="種目を追加"
			/>
		</div>
	);
};

type ExerciseProgressDialogProps = {
	exercise: Exercise;
	desktopViewport: ReturnType<typeof useMediaQuery>;
	renderExerciseProgress: (exerciseId: string) => ReactNode;
};

const ExerciseProgressDialog: FC<ExerciseProgressDialogProps> = ({
	exercise,
	desktopViewport,
	renderExerciseProgress,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const title = `${exercise.name}の推移`;
	const trigger = (
		<Button
			intent="plain"
			size="sq-xs"
			aria-label={`${exercise.name}の推移を見る`}
			className="shrink-0"
		>
			<ChartBarIcon data-slot="icon" className="size-4" aria-hidden />
		</Button>
	);

	return (
		<ResponsiveDialog
			title={title}
			trigger={trigger}
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			desktopViewport={desktopViewport}
			popoverWidth="wide"
		>
			{isOpen ? renderExerciseProgress(exercise.id) : null}
		</ResponsiveDialog>
	);
};

// ExercisePlanSection 本体で共有するレイアウト枠
const exercisePlanCardClass =
	"relative flex flex-col gap-2 rounded-lg bg-overlay p-3 text-overlay-fg shadow-sm";
const exercisePlanHeaderClass = "flex items-center gap-1 pr-8 pl-1";
