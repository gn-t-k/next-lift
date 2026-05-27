import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Button } from "../../../primitives/button";

type Props = {
	label: string;
};

export const DayActionsTrigger: FC<Props> = ({ label }) => (
	<Button
		intent="plain"
		size="sq-xs"
		aria-label={`${label}の操作`}
		className="size-5 min-h-0 border-0 sm:size-5"
	>
		<EllipsisVerticalIcon data-slot="icon" className="size-3.5" aria-hidden />
	</Button>
);
