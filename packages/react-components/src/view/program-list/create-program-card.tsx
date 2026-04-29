import { PlusIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import { Link } from "../../primitive/link";

type Props = {
	href: string;
};

export const CreateProgramCard: FC<Props> = ({ href }) => {
	return (
		<Link
			href={href}
			className="flex h-full min-h-20 items-center justify-center gap-2 rounded-lg border border-border border-dashed p-4 text-muted-fg no-underline outline-none transition-colors hover:border-solid hover:bg-secondary hover:text-fg focus-visible:border-solid focus-visible:bg-secondary focus-visible:text-fg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
		>
			<PlusIcon className="size-4" />
			<span className="font-medium text-sm">新しいプログラム</span>
		</Link>
	);
};
