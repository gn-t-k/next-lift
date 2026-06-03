"use client";

import { useState } from "react";

type Props = {
	dayIds: string[];
	defaultSelectedDayId?: string | undefined;
	lastAddedDayId?: string | undefined;
};
type State = string | undefined;
type Action = (dayId: string) => void;

export const useDayTabSelection = ({
	dayIds,
	defaultSelectedDayId,
	lastAddedDayId,
}: Props): [State, Action] => {
	const [preferredDayId, setPreferredDayId] = useState<string | undefined>(
		defaultSelectedDayId,
	);
	const [prevLastAddedDayId, setPrevLastAddedDayId] = useState<
		string | undefined
	>(undefined);

	const hasLastAddedDayChanged = lastAddedDayId !== prevLastAddedDayId;
	if (hasLastAddedDayChanged) {
		setPrevLastAddedDayId(lastAddedDayId);
	}

	const shouldSelectLastAddedDay =
		hasLastAddedDayChanged && lastAddedDayId !== undefined;
	if (shouldSelectLastAddedDay) {
		setPreferredDayId(lastAddedDayId);
	}

	const nextPreferredDayId = shouldSelectLastAddedDay
		? lastAddedDayId
		: preferredDayId;
	const selectedDayId = resolveSelectedDayId({
		dayIds,
		preferredDayId: nextPreferredDayId,
	});

	return [selectedDayId, setPreferredDayId];
};

const resolveSelectedDayId = ({
	dayIds,
	preferredDayId,
}: {
	dayIds: string[];
	preferredDayId: string | undefined;
}) => {
	if (preferredDayId !== undefined && dayIds.includes(preferredDayId)) {
		return preferredDayId;
	}

	return dayIds[0];
};
