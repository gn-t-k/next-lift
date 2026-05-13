"use client";

import { PlusIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import { Button } from "react-aria-components";
import { cx } from "../../libs/primitive";
import { createAffordanceClass } from "../../primitives/create-affordance";

type Props = {
	onAddDay: () => void;
};

export const CreateDayCard: FC<Props> = ({ onAddDay }) => {
	return (
		<Button
			onPress={onAddDay}
			className={cx(
				createAffordanceClass,
				"flex min-h-32 w-full items-center justify-center gap-2 rounded-lg p-6",
			)}
		>
			<PlusIcon className="size-4" />
			<span className="font-medium text-sm">Day を追加</span>
		</Button>
	);
};
