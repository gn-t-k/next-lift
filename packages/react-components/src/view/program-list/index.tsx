import type { FC } from "react";
import { CreateProgramCard } from "./create-program-card";
import { ProgramListItem } from "./program-list-item";

export { ProgramListError } from "./program-list-error";
export { ProgramListLoading } from "./program-list-loading";

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
		<section className="mx-auto w-full max-w-2xl p-4">
			<header className="mb-4">
				<h1 className="font-semibold text-fg text-xl">プログラム</h1>
			</header>
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
		</section>
	);
};
