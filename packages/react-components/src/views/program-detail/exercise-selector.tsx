"use client";

import { ChevronUpDownIcon, PlusIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import { useMemo, useState } from "react";
import type { Key } from "react-aria-components";
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
	onCreateExercise?: (name: string) => void;
};

const PLACEHOLDER = "種目を選択";
const NO_MATCH_ID = "__no_match__";
const CREATE_ID = "__create__";

type ListItem = {
	id: string;
	name: string;
	kind: "exercise" | "no-match" | "create";
};

const buildListItems = ({
	availableExercises,
	query,
	canCreate,
}: {
	availableExercises: SelectableExercise[];
	query: string;
	canCreate: boolean;
}): ListItem[] => {
	const trimmed = query.trim();

	if (availableExercises.length === 0) {
		const items: ListItem[] = [
			{ id: NO_MATCH_ID, name: "種目が登録されていません", kind: "no-match" },
		];
		if (canCreate && trimmed !== "") {
			items.push({
				id: CREATE_ID,
				name: `「${trimmed}」を追加`,
				kind: "create",
			});
		}
		return items;
	}

	if (trimmed === "") {
		return availableExercises.map((exercise) => ({
			id: exercise.id,
			name: exercise.name,
			kind: "exercise",
		}));
	}

	const lower = trimmed.toLowerCase();
	const filtered = availableExercises.filter((exercise) =>
		exercise.name.toLowerCase().includes(lower),
	);

	const items: ListItem[] = filtered.map((exercise) => ({
		id: exercise.id,
		name: exercise.name,
		kind: "exercise",
	}));

	if (filtered.length === 0) {
		items.push({
			id: NO_MATCH_ID,
			name: "一致する種目がありません",
			kind: "no-match",
		});
	}

	if (canCreate && trimmed !== "") {
		items.push({
			id: CREATE_ID,
			name: `「${trimmed}」を追加`,
			kind: "create",
		});
	}

	return items;
};

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
	onCreateExercise,
}) => {
	const [inputValue, setInputValue] = useState("");

	const items = useMemo(
		() =>
			buildListItems({
				availableExercises,
				query: inputValue,
				canCreate: onCreateExercise !== undefined,
			}),
		[availableExercises, inputValue, onCreateExercise],
	);

	const handleSelectionChange = (key: Key | null) => {
		if (key === null) return;
		const id = String(key);
		if (id === NO_MATCH_ID) return;
		if (id === CREATE_ID) {
			const trimmed = inputValue.trim();
			if (trimmed !== "" && onCreateExercise !== undefined) {
				onCreateExercise(trimmed);
				setInputValue("");
			}
			return;
		}
		onSelect(id);
		setInputValue("");
	};

	return (
		<ComboBox
			aria-label={PLACEHOLDER}
			menuTrigger="focus"
			items={items}
			inputValue={inputValue}
			onInputChange={setInputValue}
			onSelectionChange={handleSelectionChange}
			allowsCustomValue
		>
			<ComboBoxInput placeholder={PLACEHOLDER} />
			<ComboBoxList<ListItem>>
				{(item) => {
					const className =
						item.kind === "create"
							? "text-primary data-[focused]:bg-primary/10 data-[focused]:text-primary"
							: item.kind === "no-match"
								? "text-muted-fg data-[disabled]:opacity-100"
								: "";
					return (
						<ComboBoxItem
							id={item.id}
							textValue={item.name}
							isDisabled={item.kind === "no-match"}
							className={className}
						>
							{item.kind === "create" ? (
								<>
									<PlusIcon className="size-4" aria-hidden="true" />
									{item.name}
								</>
							) : (
								item.name
							)}
						</ComboBoxItem>
					);
				}}
			</ComboBoxList>
		</ComboBox>
	);
};

const ExerciseSelectorDrawer: FC<Props> = ({
	availableExercises,
	onSelect,
	onCreateExercise,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");

	const trimmed = query.trim();

	const filtered = useMemo(() => {
		if (trimmed === "") return availableExercises;
		const lower = trimmed.toLowerCase();
		return availableExercises.filter((exercise) =>
			exercise.name.toLowerCase().includes(lower),
		);
	}, [availableExercises, trimmed]);

	const close = () => {
		setIsOpen(false);
		setQuery("");
	};

	const handleSelect = (exerciseId: string) => {
		onSelect(exerciseId);
		close();
	};

	const handleCreate = () => {
		if (trimmed === "" || onCreateExercise === undefined) return;
		onCreateExercise(trimmed);
		close();
	};

	const noMatchMessage =
		availableExercises.length === 0
			? "種目が登録されていません"
			: "一致する種目がありません";

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
			<DrawerContent placement="bottom" className="h-[80dvh]">
				<DrawerTitle>{PLACEHOLDER}</DrawerTitle>
				<TextField
					aria-label="種目名で検索"
					value={query}
					onChange={setQuery}
					className="mt-4"
				>
					<TextFieldInput placeholder="種目名で検索" autoFocus />
				</TextField>
				<div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
					{filtered.length > 0 && (
						<ul className="flex flex-col gap-px">
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
					{filtered.length === 0 && (
						<p className="px-3 py-6 text-center text-muted-fg text-sm">
							{noMatchMessage}
						</p>
					)}
					{onCreateExercise !== undefined && trimmed !== "" && (
						<Button
							intent="plain"
							className="w-full justify-start text-primary"
							onPress={handleCreate}
						>
							<PlusIcon className="size-4" aria-hidden="true" />「{trimmed}
							」を追加
						</Button>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
};
