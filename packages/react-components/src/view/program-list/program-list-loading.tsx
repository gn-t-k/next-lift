import type { FC } from "react";
import { CreateProgramCard } from "./create-program-card";

type Props = {
	createHref: string;
};

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5"] as const;

export const ProgramListLoading: FC<Props> = ({ createHref }) => {
	return (
		<ul
			aria-busy
			aria-label="プログラムを読み込み中"
			className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3"
		>
			<li>
				<CreateProgramCard href={createHref} />
			</li>
			{SKELETON_KEYS.map((key) => (
				<li
					key={key}
					className="h-full min-h-20 rounded-lg bg-overlay p-4 shadow-sm"
				>
					<div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
					<div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted" />
				</li>
			))}
		</ul>
	);
};
