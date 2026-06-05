import { CalendarDaysIcon, PlayIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import { cn } from "../../libs";
import { createAffordanceClass } from "../../primitives/create-affordance";
import { Heading, Section } from "../../primitives/heading";
import { Link } from "../../primitives/link";
import { surfaceCardClass } from "../../primitives/surface-card";

type Props = {
	dayLabel: string;
	startWorkoutHref: string;
	workouts: WorkoutHistory[];
};

export type WorkoutHistory = {
	id: string;
	startedAt: Date;
	detailHref: string;
	memoPreview?: string | null;
};

export const WorkoutHistorySection: FC<Props> = ({
	dayLabel,
	startWorkoutHref,
	workouts,
}) => {
	const sortedWorkouts = [...workouts].sort(
		(a, b) => b.startedAt.getTime() - a.startedAt.getTime(),
	);

	return (
		<Section className="mt-6 flex flex-col gap-3">
			<Heading className="font-medium text-base">実施履歴</Heading>
			<ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
				<li>
					<Link
						href={startWorkoutHref}
						className={cn(
							createAffordanceClass,
							"flex h-full min-h-20 w-full flex-col items-center justify-center gap-2 rounded-lg p-4 text-center",
						)}
					>
						<PlayIcon data-slot="icon" className="size-4" aria-hidden />
						<span className="font-medium text-sm">
							「{dayLabel}」を実施する
						</span>
					</Link>
				</li>
				{sortedWorkouts.map((workout) => {
					const startedAt = formatWorkoutStartedAt(workout.startedAt);
					const memoPreview = formatMemoPreview(workout.memoPreview);
					const ariaLabel = formatWorkoutAriaLabel(startedAt, memoPreview);
					return (
						<li key={workout.id}>
							<Link
								href={workout.detailHref}
								aria-label={ariaLabel}
								className={cn(
									surfaceCardClass,
									"block h-full min-h-20 w-full p-4 text-left",
								)}
							>
								<span className="flex items-center gap-2 font-medium text-base">
									<CalendarDaysIcon
										data-slot="icon"
										className="size-4"
										aria-hidden
									/>
									<time dateTime={workout.startedAt.toISOString()}>
										{startedAt}
									</time>
								</span>
								{memoPreview !== undefined ? (
									<span className="wrap-break-word mt-2 line-clamp-2 block text-muted-fg text-sm">
										<span className="font-medium">メモ: </span>
										{memoPreview}
									</span>
								) : null}
							</Link>
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

const formatMemoPreview = (
	memo: string | null | undefined,
): string | undefined => {
	const trimmedMemo = memo?.trim();
	return trimmedMemo === "" ? undefined : trimmedMemo;
};

const formatWorkoutAriaLabel = (
	startedAt: string,
	memoPreview: string | undefined,
): string =>
	[`${startedAt}の実施履歴を確認`, memoPreview && `メモ: ${memoPreview}`]
		.filter((item): item is string => item !== undefined)
		.join("、");
