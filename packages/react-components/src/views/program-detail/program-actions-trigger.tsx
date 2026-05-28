import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Button } from "../../primitives/button";

export const ProgramActionsTrigger: FC = () => (
	<Button
		intent="plain"
		size="sq-xs"
		aria-label="プログラム操作"
		className="mt-1 shrink-0"
	>
		<EllipsisVerticalIcon data-slot="icon" className="size-4" aria-hidden />
	</Button>
);
