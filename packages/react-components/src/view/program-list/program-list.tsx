import type { FC } from "react";
import { CreateProgramCard } from "./create-program-card";
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
		<ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
			<li>
				<CreateProgramCard href={createHref} />
			</li>
			{programs.map((program) => (
				<li key={program.id}>
					<ProgramListItem
						name={program.name}
						lastUsedAt={program.lastUsedAt}
						href={program.href}
					/>
				</li>
			))}
		</ul>
	);
};
