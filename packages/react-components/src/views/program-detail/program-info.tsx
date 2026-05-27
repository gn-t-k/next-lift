"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { type FC, useState } from "react";
import { useMediaQuery } from "../../libs";
import { Button } from "../../primitives/button";
import { Heading } from "../../primitives/heading";
import { ProgramInfoDialog } from "./program-info-dialog";
import { type ProgramInfoChange, ProgramInfoForm } from "./program-info-form";

type Props = {
	name: string;
	meta: string | null;
	onChange: (payload: ProgramInfoChange) => void;
};

export const ProgramInfo: FC<Props> = ({ name, meta, onChange }) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const desktopViewport = useMediaQuery("(min-width: 768px)");
	const title = "プログラム情報を編集";

	return (
		<header className="flex flex-col gap-2">
			<div className="flex items-start gap-2">
				<Heading className="wrap-break-word min-w-0 flex-1">{name}</Heading>
				<ProgramInfoDialog
					title={title}
					trigger={
						<Button
							intent="plain"
							size="sq-xs"
							aria-label={title}
							className="mt-1 shrink-0"
						>
							<PencilSquareIcon
								data-slot="icon"
								className="size-4"
								aria-hidden
							/>
						</Button>
					}
					isOpen={isDialogOpen}
					onOpenChange={setIsDialogOpen}
					desktopViewport={desktopViewport}
				>
					<ProgramInfoForm
						name={name}
						meta={meta}
						onCancel={() => setIsDialogOpen(false)}
						onSubmit={(payload) => {
							onChange(payload);
							setIsDialogOpen(false);
						}}
					/>
				</ProgramInfoDialog>
			</div>
			{meta !== null && meta !== "" && (
				<p className="whitespace-pre-wrap text-muted-fg text-sm">{meta}</p>
			)}
		</header>
	);
};
