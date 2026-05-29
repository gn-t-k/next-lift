"use client";

import { CalendarDaysIcon, PlayIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import { cn } from "../../libs";
import { Button } from "../../primitives/button";
import { createAffordanceClass } from "../../primitives/create-affordance";
import { Heading, Section } from "../../primitives/heading";

type Props = {
	dayId: string;
	dayLabel: string;
	workouts: WorkoutHistory[];
	onStartWorkout: (dayId: string) => void;
	onViewWorkoutDetail: (workoutId: string) => void;
};

export type WorkoutHistory = {
	id: string;
	startedAt: Date;
};

export const WorkoutHistorySection: FC<Props> = ({
	dayId,
	dayLabel,
	workouts,
	onStartWorkout,
	onViewWorkoutDetail,
}) => {
	const sortedWorkouts = [...workouts].sort(
		(a, b) => b.startedAt.getTime() - a.startedAt.getTime(),
	);

	return (
		<Section className="mt-6 flex flex-col gap-3">
			<Heading className="font-medium text-base">実施履歴</Heading>
			<ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
				<li>
					<Button
						intent="plain"
						className={cn(
							createAffordanceClass,
							"flex h-full min-h-20 w-full flex-col gap-2 rounded-lg p-4 text-center",
						)}
						onPress={() => onStartWorkout(dayId)}
					>
						<PlayIcon data-slot="icon" className="size-4" aria-hidden />
						<span className="font-medium text-sm">
							「{dayLabel}」を実施する
						</span>
					</Button>
				</li>
				{sortedWorkouts.map((workout) => {
					const startedAt = formatWorkoutStartedAt(workout.startedAt);
					return (
						<li key={workout.id}>
							<Button
								intent="plain"
								aria-label={`${startedAt}の実施履歴を確認`}
								className={cn(
									"block h-full min-h-20 w-full rounded-lg bg-overlay p-4 text-left text-overlay-fg shadow-sm outline-none",
									"transition-all hover:bg-secondary hover:shadow-md",
									"focus-visible:bg-secondary focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
								)}
								onPress={() => onViewWorkoutDetail(workout.id)}
							>
								<span className="flex items-center gap-2 font-medium text-base">
									<CalendarDaysIcon
										data-slot="icon"
										className="size-4"
										aria-hidden
									/>
									{startedAt}
								</span>
							</Button>
						</li>
					);
				})}
			</ul>
		</Section>
	);
};

const formatWorkoutStartedAt = (date: Date): string =>
	new Intl.DateTimeFormat("ja-JP", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
