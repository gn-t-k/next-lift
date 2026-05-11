"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { FC, PropsWithChildren } from "react";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";
import { cx } from "../../../libs/primitive";
import { Button } from "../../../primitives/button";

type Props = PropsWithChildren<{
	title: string;
}>;

export const SetPlanRowPopover: FC<Props> = ({ title, children }) => (
	<DialogTrigger>
		<Button intent="plain" size="sq-xs" aria-label={`${title}を編集`}>
			<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
		</Button>
		<Popover
			placement="bottom end"
			className={cx(
				"max-w-[min(20rem,calc(100vw-2rem))]",
				"rounded-lg border border-border bg-overlay text-overlay-fg shadow-lg outline-hidden",
				"entering:fade-in entering:animate-in entering:duration-150",
				"exiting:fade-out exiting:animate-out exiting:duration-100",
			)}
		>
			<Dialog className="w-72 p-3 outline-hidden" aria-label={title}>
				{children}
			</Dialog>
		</Popover>
	</DialogTrigger>
);
