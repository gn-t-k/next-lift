import { PlusIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Button as AriaButton } from "react-aria-components";
import { cn } from "../../../libs/utils";
import { createAffordanceClass } from "../../../primitives/create-affordance";

export const SetPlanAddTriggerButton: FC = () => (
	<AriaButton
		className={cn(
			createAffordanceClass,
			"flex flex-1 items-baseline gap-3 rounded-md px-[calc(--spacing(3)-1px)] py-[calc(--spacing(2)-1px)] text-left",
		)}
	>
		<span className="flex-1 truncate">セットを追加</span>
		<PlusIcon className="size-4 shrink-0 self-center" aria-hidden />
	</AriaButton>
);
