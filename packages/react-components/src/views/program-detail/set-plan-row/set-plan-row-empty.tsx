"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Button } from "../../../primitives/button";
import { Menu, MenuItem, MenuTrigger } from "../../../primitives/menu";
import type { Pattern } from "../set-plan-types";
import { SetPlanRowDeleteButton } from "./set-plan-row-delete-button";
import { SetPlanRowFrame } from "./set-plan-row-frame";

type Props = {
	index: number;
	exerciseName: string;
	onSelectKind: (kind: Pattern) => void;
	onDelete: () => void;
};

export const SetPlanRowEmpty: FC<Props> = ({
	index,
	exerciseName,
	onSelectKind,
	onDelete,
}) => {
	const setName = `${exerciseName} ${index + 1}セット目`;
	return (
		<SetPlanRowFrame index={index}>
			<span className="flex-1 text-muted-fg">値未入力</span>
			<MenuTrigger>
				<Button
					intent="plain"
					size="sq-xs"
					aria-label={`${setName}の種類を選択`}
				>
					<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
				</Button>
				<Menu
					aria-label={`${setName}の種類`}
					onAction={(key) => onSelectKind(key as Pattern)}
				>
					{KIND_OPTIONS.map((option) => (
						<MenuItem key={option.kind} id={option.kind}>
							{option.label}
						</MenuItem>
					))}
				</Menu>
			</MenuTrigger>
			<SetPlanRowDeleteButton label={`${setName}を削除`} onPress={onDelete} />
		</SetPlanRowFrame>
	);
};

const KIND_OPTIONS: { kind: Pattern; label: string }[] = [
	{ kind: "weight-x-reps", label: "重量 × 回数" },
	{ kind: "weight-x-rpe", label: "重量 × RPE" },
	{ kind: "reps-x-rpe", label: "回数 × RPE" },
];
