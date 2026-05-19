import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { FC, ReactNode } from "react";
import { CreateProgramCard } from "./create-program-card";
import { ProgramListGrid, ProgramListGridItem } from "./program-list-grid";
import { ProgramListItem } from "./program-list-item";

type Program = {
	id: string;
	name: string;
	lastUsedAt: Date | null;
	href: string;
};

type ProgramListProps = {
	programs: Program[];
	createHref: string;
};

export const ProgramList: FC<ProgramListProps> = ({ programs, createHref }) => {
	return (
		<ProgramListGrid>
			<ProgramListGridItem>
				<CreateProgramCard href={createHref} />
			</ProgramListGridItem>
			{programs.map((program) => (
				<ProgramListGridItem key={program.id}>
					<ProgramListItem
						name={program.name}
						lastUsedAt={program.lastUsedAt}
						href={program.href}
					/>
				</ProgramListGridItem>
			))}
		</ProgramListGrid>
	);
};

type ProgramListLoadingProps = {
	createHref: string;
};

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5"] as const;

export const ProgramListLoading: FC<ProgramListLoadingProps> = ({
	createHref,
}) => {
	return (
		<ProgramListGrid aria-busy aria-label="プログラムを読み込み中">
			<ProgramListGridItem>
				<CreateProgramCard href={createHref} />
			</ProgramListGridItem>
			{SKELETON_KEYS.map((key) => (
				<ProgramListGridItem
					key={key}
					className="h-full min-h-20 rounded-lg bg-overlay p-4 shadow-sm"
				>
					<div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
					<div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted" />
				</ProgramListGridItem>
			))}
		</ProgramListGrid>
	);
};

type ProgramListErrorProps = {
	createHref: string;
	message?: ReactNode;
};

export const ProgramListError: FC<ProgramListErrorProps> = ({
	createHref,
	message,
}) => {
	return (
		<ProgramListGrid>
			<ProgramListGridItem>
				<CreateProgramCard href={createHref} />
			</ProgramListGridItem>
			<ProgramListGridItem className="lg:col-span-2">
				<div role="alert" className="flex items-start gap-3 p-4">
					<ExclamationTriangleIcon
						aria-hidden
						className="mt-0.5 size-5 shrink-0 text-warning"
					/>
					<div className="flex flex-col gap-1">
						<p className="font-medium text-base text-fg">
							プログラムを取得できませんでした
						</p>
						{message ? (
							<p className="text-muted-fg text-sm">{message}</p>
						) : null}
					</div>
				</div>
			</ProgramListGridItem>
		</ProgramListGrid>
	);
};
