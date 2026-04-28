import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { FC, ReactNode } from "react";
import { CreateProgramCard } from "./create-program-card";

type Props = {
	createHref: string;
	message?: ReactNode;
};

export const ProgramListError: FC<Props> = ({ createHref, message }) => {
	return (
		<section className="mx-auto w-full max-w-2xl p-4">
			<header className="mb-4">
				<h1 className="font-semibold text-fg text-xl">プログラム</h1>
			</header>
			<ul className="mb-2 flex flex-col gap-2">
				<CreateProgramCard href={createHref} />
			</ul>
			<div
				role="alert"
				className="flex items-start gap-3 rounded-lg border border-border bg-overlay p-4"
			>
				<ExclamationTriangleIcon
					aria-hidden
					className="mt-0.5 size-5 shrink-0 text-warning"
				/>
				<div className="flex flex-col gap-1">
					<p className="font-medium text-base text-fg">
						プログラムを取得できませんでした
					</p>
					{message ? <p className="text-muted-fg text-sm">{message}</p> : null}
				</div>
			</div>
		</section>
	);
};
