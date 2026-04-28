import type { FC } from "react";
import { CreateProgramCard } from "./create-program-card";
import { ProgramListItem } from "./program-list-item";
import { ProgramListSection } from "./program-list-section";

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
		<ProgramListSection>
			<ul className="flex flex-col gap-2">
				<CreateProgramCard href={createHref} />
				{programs.map((program) => (
					<ProgramListItem
						key={program.id}
						name={program.name}
						lastUsedAt={program.lastUsedAt}
						href={program.href}
					/>
				))}
			</ul>
		</ProgramListSection>
	);
};
