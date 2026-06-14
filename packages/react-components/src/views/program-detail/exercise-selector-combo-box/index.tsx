"use client";

import { PlusIcon } from "@heroicons/react/24/solid";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import type { Key } from "react-aria-components";
import {
	ComboBox,
	ComboBoxInput,
	ComboBoxItem,
	ComboBoxList,
} from "../../../primitives/combo-box";
import {
	buildComboBoxItems,
	CREATE_ID,
	type ComboBoxItem as ListItem,
	PLACEHOLDER_ID,
} from "./build-combo-box-items";

type Props = {
	exercises: { id: string; name: string }[];
	selectedExerciseId?: string | undefined;
	onSelect: (exerciseId: string) => void;
	onCreateExercise: (name: string) => void;
	label: string;
};

export const ExerciseSelectorComboBox: FC<Props> = ({
	exercises,
	selectedExerciseId,
	onSelect,
	onCreateExercise,
	label,
}) => {
	const selectedName =
		exercises.find((exercise) => exercise.id === selectedExerciseId)?.name ??
		"";

	const [draftInputValue, setDraftInputValue] = useState<string | null>(null);
	const [showAllItems, setShowAllItems] = useState(false);
	const inputValue = draftInputValue ?? selectedName;

	const items = buildComboBoxItems({
		options: exercises,
		query: showAllItems ? "" : inputValue,
	});

	const handleChange = (key: Key | null) => {
		setDraftInputValue(null);
		setShowAllItems(false);
		if (key === null) return;
		const id = String(key);
		if (id === PLACEHOLDER_ID) return;
		if (id === CREATE_ID) {
			onCreateExercise(inputValue.trim());
			return;
		}
		onSelect(id);
	};

	const handleInputChange = (value: string) => {
		setDraftInputValue(value);
		setShowAllItems(false);
	};

	const handleOpenChange: ComponentProps<typeof ComboBox>["onOpenChange"] = (
		isOpen,
		trigger,
	) => {
		if (isOpen && (trigger === "focus" || trigger === "manual")) {
			setShowAllItems(true);
		}
	};

	return (
		<ComboBox
			aria-label={label}
			menuTrigger="focus"
			items={items}
			inputValue={inputValue}
			onInputChange={handleInputChange}
			onOpenChange={handleOpenChange}
			value={selectedExerciseId ?? null}
			onChange={handleChange}
		>
			<ComboBoxInput placeholder={label} />
			<ComboBoxList<ListItem>>
				{(item) => {
					if (item.kind === "create") {
						const label = `種目「${inputValue}」を登録`;
						return (
							<ComboBoxItem
								id={item.id}
								textValue={label}
								className="text-primary data-focused:bg-primary/10 data-focused:text-primary"
							>
								<PlusIcon className="size-4" aria-hidden="true" />
								{label}
							</ComboBoxItem>
						);
					}
					if (item.kind === "placeholder") {
						const message =
							item.reason === "empty"
								? "種目が登録されていません"
								: "一致する種目がありません";

						return (
							<ComboBoxItem
								id={item.id}
								textValue={message}
								isDisabled
								className="text-muted-fg data-disabled:opacity-100"
							>
								{message}
							</ComboBoxItem>
						);
					}
					return (
						<ComboBoxItem id={item.id} textValue={item.name}>
							{item.name}
						</ComboBoxItem>
					);
				}}
			</ComboBoxList>
		</ComboBox>
	);
};
