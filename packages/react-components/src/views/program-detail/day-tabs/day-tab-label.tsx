"use client";

import type { FC } from "react";
import { useState } from "react";
import type { useMediaQuery } from "../../../libs";
import { DayActionsMenu } from "./day-actions-menu";
import { DayActionsTrigger } from "./day-actions-trigger";
import { DayLabelForm } from "./day-label-form";
import { DayRenameDialog } from "./day-rename-dialog";

type Props = {
	dayId: string;
	label: string;
	onChange: (dayId: string, label: string) => void;
	onDelete: (dayId: string) => void;
	desktopViewport: ReturnType<typeof useMediaQuery>;
};

export const DayTabLabel: FC<Props> = ({
	dayId,
	label,
	onChange,
	onDelete,
	desktopViewport,
}) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isRenameOpen, setIsRenameOpen] = useState(false);

	const handleChange = (nextLabel: string) => {
		onChange(dayId, nextLabel);
		setIsRenameOpen(false);
	};
	const handleDelete = () => {
		onDelete(dayId);
		setIsMenuOpen(false);
	};
	const handleStartRename = () => {
		setIsMenuOpen(false);
		setIsRenameOpen(true);
	};

	const trigger = <DayActionsTrigger label={label} />;

	return (
		<span className="inline-flex min-w-0 items-center gap-1.5">
			<span className="truncate">{label}</span>
			{desktopViewport === "pending" ? (
				trigger
			) : isRenameOpen ? (
				<DayRenameDialog
					title={`${label}の名前を変更`}
					trigger={trigger}
					isOpen={isRenameOpen}
					onOpenChange={setIsRenameOpen}
					desktopViewport={desktopViewport}
				>
					<DayLabelForm
						label={label}
						onCancel={() => setIsRenameOpen(false)}
						onSubmit={handleChange}
					/>
				</DayRenameDialog>
			) : (
				<DayActionsMenu
					label={label}
					trigger={trigger}
					isOpen={isMenuOpen}
					onOpenChange={setIsMenuOpen}
					onRename={handleStartRename}
					onDelete={handleDelete}
				/>
			)}
		</span>
	);
};
