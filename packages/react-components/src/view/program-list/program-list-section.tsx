import type { FC, PropsWithChildren } from "react";

export const ProgramListSection: FC<PropsWithChildren> = ({ children }) => {
	return (
		<section className="mx-auto w-full max-w-2xl p-4">
			<header className="mb-4">
				<h1 className="font-semibold text-fg text-xl">プログラム</h1>
			</header>
			{children}
		</section>
	);
};
