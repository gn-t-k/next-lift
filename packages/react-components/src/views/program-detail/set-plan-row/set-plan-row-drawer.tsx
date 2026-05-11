"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { FC, PropsWithChildren } from "react";
import { Button } from "../../../primitives/button";
import { Drawer, DrawerContent, DrawerTitle } from "../../../primitives/drawer";

type Props = PropsWithChildren<{
	title: string;
}>;

export const SetPlanRowDrawer: FC<Props> = ({ title, children }) => (
	<Drawer>
		<Button intent="plain" size="sq-xs" aria-label={`${title}を編集`}>
			<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
		</Button>
		<DrawerContent>
			<div className="flex flex-col gap-4 pt-2">
				<DrawerTitle>{title}</DrawerTitle>
				{children}
			</div>
		</DrawerContent>
	</Drawer>
);
