import { PlusIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import { cn } from "../../libs/utils";
import { createAffordanceClass } from "../../primitives/create-affordance";
import { Link } from "../../primitives/link";

type Props = {
	href: string;
};

export const CreateProgramCard: FC<Props> = ({ href }) => {
	return (
		<Link
			href={href}
			className={cn(
				createAffordanceClass,
				"flex h-full min-h-20 items-center justify-center gap-2 rounded-lg p-4 no-underline",
			)}
		>
			<PlusIcon className="size-4" />
			<span className="font-medium text-sm">新しいプログラム</span>
		</Link>
	);
};
