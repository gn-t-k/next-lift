import type { FC, PropsWithChildren } from "react";

type Props = {
	as?: "main" | "section";
};

export const PageSection: FC<PropsWithChildren<Props>> = ({
	as: As = "main",
	children,
}) => {
	return <As className="mx-auto w-full max-w-2xl p-4">{children}</As>;
};
