"use client";

import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import { Button } from "../../primitives/button";
import { Heading, Section } from "../../primitives/heading";
import { Menu, MenuItem, MenuTrigger } from "../../primitives/menu";
import { CreateExercisePlanCard } from "./create-exercise-plan-card";
import type { WeightUnit } from "./weight-unit";

// T で caller 側の追加フィールド（setPlans 等）を保持し、children 関数に渡せるようにする
type Props<T extends ExercisePlan> = {
	exercisePlans: T[];
	onAddExercisePlan: () => void;
	onDeleteExercisePlan: (exercisePlanId: string) => void;
	children: (exercisePlan: T) => ReactNode;
};

type ExercisePlan = {
	id: string;
	exercise: Exercise | null;
};

type Exercise = {
	id: string;
	name: string;
	weightUnit: WeightUnit;
	weightStep: number;
};

export const ExercisePlanSection = <T extends ExercisePlan>({
	exercisePlans,
	onAddExercisePlan,
	onDeleteExercisePlan,
	children,
}: Props<T>): ReactNode => {
	return (
		<div className="flex flex-col gap-3">
			{exercisePlans.length > 0 && (
				<ol className="flex flex-col gap-3">
					{exercisePlans.map((exercisePlan) => (
						<li key={exercisePlan.id}>
							<Section className="flex flex-col gap-2 rounded-lg bg-overlay p-3 text-overlay-fg shadow-sm">
								<header className="flex items-baseline justify-between gap-2 px-1">
									{exercisePlan.exercise === null ? (
										<span className="text-muted-fg text-sm">種目を選択</span>
									) : (
										<Heading className="font-medium text-base">
											{exercisePlan.exercise.name}
										</Heading>
									)}
									<MenuTrigger>
										<Button
											intent="plain"
											size="sq-xs"
											aria-label={`${exercisePlan.exercise?.name ?? "未選択の種目計画"}の操作`}
										>
											<EllipsisVerticalIcon
												data-slot="icon"
												className="size-4"
												aria-hidden
											/>
										</Button>
										<Menu>
											<MenuItem
												intent="danger"
												onAction={() => onDeleteExercisePlan(exercisePlan.id)}
											>
												<TrashIcon className="size-4" aria-hidden />
												種目計画を削除
											</MenuItem>
										</Menu>
									</MenuTrigger>
								</header>
								{children(exercisePlan)}
							</Section>
						</li>
					))}
				</ol>
			)}
			<CreateExercisePlanCard onAddExercisePlan={onAddExercisePlan} />
		</div>
	);
};
