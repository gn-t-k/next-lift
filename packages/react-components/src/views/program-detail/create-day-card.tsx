"use client";

import { PlusIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import { Button } from "react-aria-components";
import { cn } from "../../libs/utils";

type Props = {
	onAddDay: () => void;
};

export const CreateDayCard: FC<Props> = ({ onAddDay }) => {
	return (
		<Button
			onPress={onAddDay}
			className={cn(
				"flex min-h-32 w-full items-center justify-center gap-2 rounded-lg p-6 outline-none",
				"border border-border border-dashed bg-transparent text-muted-fg",
				"transition-colors",
				"hover:border-solid hover:bg-secondary hover:text-fg",
				"focus-visible:border-solid focus-visible:bg-secondary focus-visible:text-fg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
			)}
		>
			<PlusIcon className="size-4" />
			<span className="font-medium text-sm">Day を追加</span>
		</Button>
	);
};
