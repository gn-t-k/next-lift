"use client";

import type { FC } from "react";
import type { DayInfoPayload } from "./day-info-dialog-button";
import { DayInfoDialogButton } from "./day-info-dialog-button";
import type { Day } from "./day-list";
import { HeaderActions } from "./header-actions";
import { HeaderDeleteButton } from "./header-delete-button";

type Props = {
	day: Day;
	onChangeDayInfo: (dayId: string, payload: DayInfoPayload) => void;
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
