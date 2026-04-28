import { PlusIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import { buttonStyles } from "../../primitive/button";
import { Link } from "../../primitive/link";
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
		<section className="mx-auto w-full max-w-2xl p-4">
			<header className="mb-4 flex items-center justify-between gap-2">
				<h1 className="font-semibold text-fg text-xl">プログラム</h1>
				<Link
					href={createHref}
					className={buttonStyles({ intent: "primary", size: "sm" })}
				>
					<PlusIcon data-slot="icon" />
					新規作成
				</Link>
			</header>
			{programs.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border border-dashed bg-overlay px-6 py-16 text-center">
					<p className="font-medium text-base text-fg">
						プログラムがありません
					</p>
					<p className="max-w-xs text-muted-fg text-sm">
						プログラムを作成して、Dayと種目計画を組み立てましょう。
					</p>
				</div>
			) : (
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
			)}
		</section>
	);
};
