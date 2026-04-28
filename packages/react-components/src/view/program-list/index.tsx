import type { FC } from "react";
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

export const ProgramList: FC<Props> = ({ programs }) => {
	return (
		<section className="mx-auto w-full max-w-2xl p-4">
			<header className="mb-4 flex items-center justify-between">
				<h1 className="font-semibold text-fg text-xl">プログラム</h1>
			</header>
			<ul className="flex flex-col gap-2">
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
