"use client";

import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import { useMemo, useState } from "react";
import { Button } from "../../primitives/button";
import {
	ComboBox,
	ComboBoxInput,
	ComboBoxItem,
	ComboBoxList,
} from "../../primitives/combo-box";
import {
	Drawer,
	DrawerContent,
	DrawerTitle,
	DrawerTrigger,
} from "../../primitives/drawer";
import { TextField, TextFieldInput } from "../../primitives/text-field";

export type SelectableExercise = {
	id: string;
	name: string;
};

type Props = {
	availableExercises: SelectableExercise[];
	onSelect: (exerciseId: string) => void;
};

const PLACEHOLDER = "種目を選択";

export const ExerciseSelector: FC<Props> = (props) => {
	return (
		<>
			<div className="md:hidden">
				<ExerciseSelectorDrawer {...props} />
			</div>
			<div className="hidden md:block">
				<ExerciseSelectorComboBox {...props} />
			</div>
		</>
	);
};

const ExerciseSelectorComboBox: FC<Props> = ({
	availableExercises,
	onSelect,
}) => (
	<ComboBox
		aria-label={PLACEHOLDER}
		menuTrigger="focus"
		onSelectionChange={(key) => {
			if (key === null) return;
			onSelect(String(key));
		}}
	>
		<ComboBoxInput placeholder={PLACEHOLDER} />
		<ComboBoxList<SelectableExercise>
			items={availableExercises}
			renderEmptyState={() => (
				<div className="px-3 py-6 text-center text-muted-fg text-sm">
					{availableExercises.length === 0
						? "種目が登録されていません"
						: "一致する種目がありません"}
				</div>
			)}
		>
			{(exercise) => (
				<ComboBoxItem id={exercise.id} textValue={exercise.name}>
					{exercise.name}
				</ComboBoxItem>
			)}
		</ComboBoxList>
	</ComboBox>
);

const ExerciseSelectorDrawer: FC<Props> = ({
	availableExercises,
	onSelect,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");

	const filtered = useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (trimmed === "") return availableExercises;
		return availableExercises.filter((exercise) =>
			exercise.name.toLowerCase().includes(trimmed),
		);
	}, [availableExercises, query]);

	const handleSelect = (exerciseId: string) => {
		onSelect(exerciseId);
		setIsOpen(false);
		setQuery("");
	};

	return (
		<Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
			<DrawerTrigger
				intent="outline"
				className="w-full justify-between font-normal text-muted-fg"
			>
				{PLACEHOLDER}
				<ChevronUpDownIcon
					className="size-4 text-muted-fg"
					aria-hidden="true"
				/>
			</DrawerTrigger>
			<DrawerContent placement="bottom">
				<DrawerTitle>{PLACEHOLDER}</DrawerTitle>
				<TextField
					aria-label="種目名で検索"
					value={query}
					onChange={setQuery}
					className="mt-4"
				>
					<TextFieldInput placeholder="種目名で検索" autoFocus />
				</TextField>
				{filtered.length === 0 ? (
					<p className="mt-4 px-3 py-6 text-center text-muted-fg text-sm">
						{availableExercises.length === 0
							? "種目が登録されていません"
							: "一致する種目がありません"}
					</p>
				) : (
					<ul className="mt-4 flex flex-col gap-px overflow-y-auto">
						{filtered.map((exercise) => (
							<li key={exercise.id}>
								<Button
									intent="plain"
									className="w-full justify-start"
									onPress={() => handleSelect(exercise.id)}
								>
									{exercise.name}
								</Button>
							</li>
						))}
					</ul>
				)}
			</DrawerContent>
		</Drawer>
	);
};
