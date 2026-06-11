"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { useState } from "react";
import { useMediaQuery } from "../../libs";
import { Button } from "../../primitives/button";
import { ResponsiveDialog } from "../../primitives/responsive-dialog";
import { ProgramInfoForm } from "./program-info-form";

export type ProgramInfoPayload = {
	name: string;
	meta: string | undefined;
};

type Props = {
	name: string;
	meta: string | undefined;
	onChange: (payload: ProgramInfoPayload) => void;
};

export type OnChangeProgramInfo = Props["onChange"];

export const ProgramInfoDialogButton: FC<Props> = ({
	name,
	meta,
	onChange,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const desktopViewport = useMediaQuery("(min-width: 768px)");
	const title = "プログラム情報を編集";

	return (
		<ResponsiveDialog
			title={title}
			trigger={
				<Button
					intent="plain"
					size="sq-xs"
					aria-label={title}
					className="shrink-0"
				>
					<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
				</Button>
			}
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			desktopViewport={desktopViewport}
			popoverWidth="default"
		>
			<ProgramInfoForm
				name={name}
				meta={meta ?? null}
				onCancel={() => setIsOpen(false)}
				onSubmit={(payload) => {
					onChange({
						name: payload.name,
						meta: payload.meta ?? undefined,
					});
					setIsOpen(false);
				}}
			/>
		</ResponsiveDialog>
	);
};
