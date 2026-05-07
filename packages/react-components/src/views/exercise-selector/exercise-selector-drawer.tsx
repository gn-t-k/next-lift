"use client";

import { ChevronUpDownIcon, PlusIcon } from "@heroicons/react/24/solid";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { cn } from "../../libs/utils";
import { Button } from "../../primitives/button";
import {
	Drawer,
	DrawerContent,
	DrawerTitle,
	DrawerTrigger,
} from "../../primitives/drawer";
import { TextField, TextFieldInput } from "../../primitives/text-field";
import type { ExerciseSelector } from ".";
import { filterByName } from "./filter-by-name";
import { isCreatableName } from "./is-creatable-name";

export const ExerciseSelectorDrawer: FC<
	ComponentProps<typeof ExerciseSelector>
> = ({ exercises, selectedExerciseId, onSelect, onCreateExercise }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");

	const selectedExercise = exercises.find(
		(exercise) => exercise.id === selectedExerciseId,
	);
	const filtered = filterByName(exercises, query);
	const existingNames = exercises.map((e) => e.name);
	const canCreate = isCreatableName(existingNames, query);

	const close = () => {
		setIsOpen(false);
		setQuery("");
	};

	const handleSelect = (exerciseId: string) => {
		onSelect(exerciseId);
		close();
	};

	const handleCreate = () => {
		if (!canCreate) return;
		onCreateExercise(query);
		close();
	};

	return (
		<Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
			<DrawerTrigger
				intent="outline"
				className={cn(
					"w-full justify-between font-normal",
					selectedExercise === undefined && "text-muted-fg",
				)}
			>
				{selectedExercise?.name ?? "種目を選択"}
				<ChevronUpDownIcon
					className="size-4 text-muted-fg"
					aria-hidden="true"
				/>
			</DrawerTrigger>
			<DrawerContent placement="bottom" className="h-[80dvh]">
				<DrawerTitle>種目を選択</DrawerTitle>
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
						<div className="flex flex-col gap-px" role="listbox">
							{filtered.map((exercise) => {
								const isSelected = exercise.id === selectedExerciseId;
								return (
									<div
										key={exercise.id}
										role="option"
										aria-selected={isSelected}
										tabIndex={-1}
									>
										<Button
											intent="plain"
											className={cn(
												"w-full justify-start",
												isSelected && "bg-accent/60 text-accent-fg",
											)}
											onPress={() => handleSelect(exercise.id)}
										>
											{exercise.name}
										</Button>
									</div>
								);
							})}
						</div>
					)}
					{filtered.length === 0 && (
						<p className="px-3 py-6 text-center text-muted-fg text-sm">
							{exercises.length === 0
								? "種目が登録されていません"
								: "一致する種目がありません"}
						</p>
					)}
					{canCreate && (
						<Button
							intent="plain"
							className="w-full justify-start text-primary"
							onPress={handleCreate}
						>
							<PlusIcon className="size-4" aria-hidden="true" />
							{`種目「${query}」を登録`}
						</Button>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
};
