"use client";

import type { ComponentProps, FC } from "react";
import type { ProgramDetailNew } from ".";
import { DayInfoDialogButton } from "./day-info-dialog-button";
import { HeaderActions } from "./header-actions";
import { HeaderDeleteButton } from "./header-delete-button";

type Day = ComponentProps<typeof ProgramDetailNew>["days"][number];

type Props = {
	day: Day;
	onChangeDayInfo: (
		dayId: string,
		payload: { label: string; memo: string },
	) => void;
	onDeleteDay: (dayId: string) => void;
};

export const DayHeaderActions: FC<Props> = ({
	day,
	onChangeDayInfo,
	onDeleteDay,
}) => (
	<HeaderActions>
		<DayInfoDialogButton day={day} onChange={onChangeDayInfo} />
		<HeaderDeleteButton
			label={`${day.label}を削除`}
			onDelete={() => onDeleteDay(day.id)}
		/>
	</HeaderActions>
);
