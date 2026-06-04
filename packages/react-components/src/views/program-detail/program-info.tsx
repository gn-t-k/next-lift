"use client";

import { type FC, useState } from "react";
import { useMediaQuery } from "../../libs";
import { Heading } from "../../primitives/heading";
import { ResponsiveDialog } from "../../primitives/responsive-dialog";
import { ProgramActionsMenu } from "./program-actions-menu";
import { ProgramActionsTrigger } from "./program-actions-trigger";
import { ProgramDeleteDialog } from "./program-delete-dialog";
import { type ProgramInfoChange, ProgramInfoForm } from "./program-info-form";

type Props = {
	name: string;
	meta: string | null;
	onChange: (payload: ProgramInfoChange) => void;
	onDuplicate: () => void;
	onDelete: () => void;
};

export const ProgramInfo: FC<Props> = ({
	name,
	meta,
	onChange,
	onDuplicate,
	onDelete,
}) => {
	const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const desktopViewport = useMediaQuery("(min-width: 768px)");
	const title = "プログラム情報を編集";
	const trigger = <ProgramActionsTrigger />;

	const handleStartEdit = () => {
		setIsActionsMenuOpen(false);
		setIsDialogOpen(true);
	};

	const handleDuplicate = () => {
		onDuplicate();
		setIsActionsMenuOpen(false);
	};

	const handleStartDelete = () => {
		setIsActionsMenuOpen(false);
		setIsDeleteDialogOpen(true);
	};

	return (
		<header className="flex flex-col gap-2">
			<div className="flex items-start gap-2">
				<Heading className="wrap-break-word min-w-0 flex-1">{name}</Heading>
				{desktopViewport === "pending" ? (
					trigger
				) : isDialogOpen ? (
					<ResponsiveDialog
						title={title}
						trigger={trigger}
						isOpen={isDialogOpen}
						onOpenChange={setIsDialogOpen}
						desktopViewport={desktopViewport}
						popoverWidth="default"
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
					</ResponsiveDialog>
				) : isDeleteDialogOpen ? (
					<ProgramDeleteDialog
						name={name}
						trigger={trigger}
						isOpen={isDeleteDialogOpen}
						onOpenChange={setIsDeleteDialogOpen}
						onDelete={onDelete}
						desktopViewport={desktopViewport}
					/>
				) : (
					<ProgramActionsMenu
						trigger={trigger}
						isOpen={isActionsMenuOpen}
						onOpenChange={setIsActionsMenuOpen}
						onEdit={handleStartEdit}
						onDuplicate={handleDuplicate}
						onDelete={handleStartDelete}
					/>
				)}
			</div>
			{meta !== null && meta !== "" && (
				<p className="whitespace-pre-wrap text-muted-fg text-sm">{meta}</p>
			)}
		</header>
	);
};
