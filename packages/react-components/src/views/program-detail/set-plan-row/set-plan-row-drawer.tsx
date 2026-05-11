"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { FC, PropsWithChildren } from "react";
import { Button } from "../../../primitives/button";
import { Drawer, DrawerContent, DrawerTitle } from "../../../primitives/drawer";

type Props = PropsWithChildren<{
	title: string;
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onStart: () => void;
}>;

export const SetPlanRowDrawer: FC<Props> = ({
	title,
	isOpen,
	onOpenChange,
	onStart,
	children,
}) => (
	<Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
		<Button
			intent="plain"
			size="sq-xs"
			onPress={onStart}
			aria-label={`${title}を編集`}
		>
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
