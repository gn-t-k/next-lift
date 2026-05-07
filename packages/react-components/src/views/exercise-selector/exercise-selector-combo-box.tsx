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
} from "../../primitives/combo-box";
import type { ExerciseSelector } from ".";
import {
	buildComboBoxItems,
	CREATE_ID,
	type ComboBoxItem as ListItem,
	PLACEHOLDER_ID,
} from "./build-combo-box-items";

export const ExerciseSelectorComboBox: FC<
	ComponentProps<typeof ExerciseSelector>
> = ({ exercises, selectedExerciseId, onSelect, onCreateExercise }) => {
	const selectedName =
		exercises.find((exercise) => exercise.id === selectedExerciseId)?.name ??
		"";

	const [draftInputValue, setDraftInputValue] = useState<string | null>(null);
	const inputValue = draftInputValue ?? selectedName;

	const items = buildComboBoxItems({ options: exercises, query: inputValue });

	const handleChange = (key: Key | null) => {
		if (key === null) return;
		const id = String(key);
		if (id === PLACEHOLDER_ID) return;
		if (id === CREATE_ID) {
			onCreateExercise(inputValue.trim());
			setDraftInputValue(null);
			return;
		}
		onSelect(id);
		setDraftInputValue(null);
	};

	return (
		<ComboBox
			aria-label="種目を選択"
			menuTrigger="focus"
			items={items}
			inputValue={inputValue}
			onInputChange={setDraftInputValue}
			value={selectedExerciseId ?? null}
			onChange={handleChange}
			allowsCustomValue
		>
			<ComboBoxInput placeholder="種目を選択" />
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
