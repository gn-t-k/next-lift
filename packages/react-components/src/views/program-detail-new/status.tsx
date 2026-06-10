import {
	ChevronRightIcon,
	ExclamationTriangleIcon,
	PencilSquareIcon,
} from "@heroicons/react/24/outline";
import type { FC, ReactNode } from "react";
import { cn } from "../../libs";
import { Button } from "../../primitives/button";
import { skeletonClass } from "../../primitives/skeleton";
import { LabeledPlanColumn, PlanColumn } from "./plan-layout";

const SKELETON_DAY_KEYS = ["day-1", "day-2", "day-3"] as const;

export const ProgramDetailNewLoading: FC = () => (
	<div className="@container flex flex-col gap-3" aria-busy>
		<h1 className="sr-only">プログラム詳細</h1>
		<span className="sr-only">プログラム詳細を読み込み中</span>
		<div className="@min-[56rem]:grid hidden h-[32rem] grid-cols-[minmax(13rem,0.9fr)_minmax(17rem,1fr)_minmax(20rem,1.25fr)] items-stretch gap-3">
			<LoadingLabeledColumn
				label="プログラム"
				titleWidth="w-28"
				metaWidth="w-56"
				items={SKELETON_DAY_KEYS}
			/>
			<IdleLabeledColumn label="Day" />
			<IdleLabeledColumn label="種目計画" />
		</div>
		<div className="@min-[56rem]:hidden">
			<PlanColumn
				title={<SkeletonText className="h-7 w-2/3" />}
				meta={<SkeletonText className="h-3 w-full" />}
				actions={<DisabledEditButton />}
				className="min-h-[30rem]"
				variant="plain"
			>
				<div className="flex min-h-0 flex-1 flex-col gap-2">
					{SKELETON_DAY_KEYS.map((item) => (
						<SkeletonRow key={item} />
					))}
					<div className={cn(skeletonClass, "h-12 w-full rounded-lg")} />
				</div>
			</PlanColumn>
		</div>
	</div>
);

type LoadingLabeledColumnProps = {
	label: string;
	titleWidth: string;
	metaWidth: string;
	items: readonly string[];
};

const LoadingLabeledColumn: FC<LoadingLabeledColumnProps> = ({
	label,
	titleWidth,
	metaWidth,
	items,
}) => (
	<LabeledPlanColumn
		label={label}
		title={<SkeletonText className={cn("h-5", titleWidth)} />}
		meta={<SkeletonText className={cn("h-3", metaWidth)} />}
		actions={<DisabledEditButton />}
	>
		<PlanColumn>
			<div className="flex min-h-0 flex-1 flex-col gap-2">
				{items.map((item) => (
					<SkeletonRow key={item} />
				))}
				<div className={cn(skeletonClass, "mt-1 h-9 w-32 rounded-lg")} />
			</div>
		</PlanColumn>
	</LabeledPlanColumn>
);

const IdleLabeledColumn: FC<{ label: string }> = ({ label }) => (
	<LabeledPlanColumn label={label}>
		<PlanColumn>
			<IdleBody />
		</PlanColumn>
	</LabeledPlanColumn>
);

const SkeletonRow: FC = () => (
	<div className="flex h-12 items-center gap-2 rounded-lg border border-transparent px-3 py-2">
		<div className="min-w-0 flex-1">
			<div className={cn(skeletonClass, "h-5 w-3/4")} />
			<div className={cn(skeletonClass, "mt-2 h-3 w-16")} />
		</div>
		<ChevronRightIcon
			data-slot="icon"
			className="size-4 shrink-0 text-muted-fg/45"
			aria-hidden
		/>
	</div>
);

const SkeletonText: FC<{ className: string }> = ({ className }) => (
	<span aria-hidden className={cn(skeletonClass, "block", className)} />
);

const DisabledEditButton: FC = () => (
	<Button
		intent="plain"
		size="sq-xs"
		aria-label="プログラム情報を編集"
		isDisabled
		className="shrink-0"
	>
		<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
	</Button>
);

type ProgramDetailNewErrorProps = {
	message?: ReactNode;
};

export const ProgramDetailNewError: FC<ProgramDetailNewErrorProps> = ({
	message,
}) => {
	const description = message ?? "時間をおいて再読み込みしてください。";

	return (
		<div className="@container flex flex-col gap-3">
			<h1 className="sr-only">プログラム詳細</h1>
			<div className="@min-[56rem]:grid hidden h-[32rem] grid-cols-[minmax(13rem,0.9fr)_minmax(17rem,1fr)_minmax(20rem,1.25fr)] gap-3">
				<ErrorLabeledColumn label="プログラム" description={description} />
				<IdleLabeledColumn label="Day" />
				<IdleLabeledColumn label="種目計画" />
			</div>
			<div className="@min-[56rem]:hidden">
				<PlanColumn
					title={<ErrorTitle />}
					meta={description}
					actions={<WarningIcon />}
					className="min-h-[30rem]"
					variant="plain"
				>
					<IdleBody />
				</PlanColumn>
			</div>
		</div>
	);
};

const ErrorLabeledColumn: FC<{ label: string; description: ReactNode }> = ({
	label,
	description,
}) => (
	<LabeledPlanColumn
		label={label}
		title={<ErrorTitle compact />}
		meta={description}
		actions={<WarningIcon />}
	>
		<PlanColumn>
			<IdleBody />
		</PlanColumn>
	</LabeledPlanColumn>
);

const ErrorTitle: FC<{ compact?: boolean | undefined }> = ({
	compact = false,
}) => (
	<span
		role="alert"
		className={cn(
			"block truncate font-medium text-fg",
			compact ? "mt-0.5 text-base" : "@min-[56rem]:text-base text-xl",
		)}
	>
		プログラムを取得できませんでした
	</span>
);

const IdleBody: FC = () => <div aria-hidden className="min-h-24 flex-1" />;

const WarningIcon: FC = () => (
	<ExclamationTriangleIcon
		aria-hidden
		className="mt-0.5 size-5 shrink-0 text-warning"
	/>
);
