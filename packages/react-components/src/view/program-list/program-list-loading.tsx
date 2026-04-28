import type { FC } from "react";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4"] as const;

export const ProgramListLoading: FC = () => {
	return (
		<section className="mx-auto w-full max-w-2xl p-4">
			<header className="mb-4">
				<h1 className="font-semibold text-fg text-xl">プログラム</h1>
			</header>
			<span className="sr-only" aria-live="polite">
				プログラムを読み込み中
			</span>
			<ul aria-busy className="flex flex-col gap-2">
				{SKELETON_KEYS.map((key) => (
					<li
						key={key}
						className="rounded-lg border border-border bg-overlay p-4"
					>
						<div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
						<div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted" />
					</li>
				))}
			</ul>
		</section>
	);
};
