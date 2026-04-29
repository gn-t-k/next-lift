import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { FC, ReactNode } from "react";
import { CreateProgramCard } from "./create-program-card";
import { ProgramListGrid, ProgramListGridItem } from "./program-list-grid";

type Props = {
	createHref: string;
	message?: ReactNode;
};

export const ProgramListError: FC<Props> = ({ createHref, message }) => {
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
