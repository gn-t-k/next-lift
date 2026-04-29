import type { FC } from "react";
import { CreateProgramCard } from "./create-program-card";
import { ProgramListGrid, ProgramListGridItem } from "./program-list-grid";
import { ProgramListItem } from "./program-list-item";

type Program = {
	id: string;
	name: string;
	lastUsedAt: Date | null;
	href: string;
};

type Props = {
	programs: Program[];
	createHref: string;
};

export const ProgramList: FC<Props> = ({ programs, createHref }) => {
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
