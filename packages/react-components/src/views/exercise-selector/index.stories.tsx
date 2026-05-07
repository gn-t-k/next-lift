import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ExerciseSelector } from ".";

type Exercise = ComponentProps<typeof ExerciseSelector>["exercises"][number];

const SAMPLE_EXERCISES: Exercise[] = [
	{ id: "ex-bench", name: "ベンチプレス" },
	{ id: "ex-incline-db", name: "インクラインダンベルプレス" },
	{ id: "ex-pushdown", name: "トライセプスプッシュダウン" },
	{ id: "ex-squat", name: "バックスクワット" },
	{ id: "ex-deadlift", name: "デッドリフト" },
];

const meta = {
	title: "View/ExerciseSelector",
	component: ExerciseSelector,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		exercises: SAMPLE_EXERCISES,
		onSelect: fn(),
		onCreateExercise: fn(),
	},
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ExerciseSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const findOptions = (root: ParentNode = document): HTMLElement[] =>
	Array.from(root.querySelectorAll<HTMLElement>('[role="option"]'));

const findOptionByName = (
	name: string,
	root: ParentNode = document,
): HTMLElement | undefined =>
	findOptions(root).find((option) => option.textContent === name);

const findCreateOption = (): HTMLElement | undefined =>
	findOptions().find((option) => option.textContent?.trim().endsWith("を登録"));

const requireDrawerDialog = (): HTMLElement => {
	const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
	if (dialog === null) throw new Error("drawer dialog not found");
	return dialog;
};

const requireDrawerSearchInput = (): HTMLInputElement => {
	const input = requireDrawerDialog().querySelector<HTMLInputElement>("input");
	if (input === null) throw new Error("drawer search input not found");
	return input;
};

const findDrawerCreateButton = (): HTMLElement | undefined =>
	Array.from(
		requireDrawerDialog().querySelectorAll<HTMLElement>("button"),
	).find((b) => b.textContent?.trim().endsWith("を登録"));

const findDrawerExerciseButton = (name: string): HTMLElement | undefined => {
	const option = findOptions(requireDrawerDialog()).find(
		(o) => o.textContent === name,
	);
	return option?.querySelector("button") ?? undefined;
};

const getDrawerPanel = (): HTMLElement => {
	const panel = requireDrawerDialog().parentElement;
	if (panel === null) throw new Error("drawer panel not found");
	return panel;
};

export const DesktopSelectAfterSearch: Story = {
	name: "広画面: 検索して選択",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole("combobox") as HTMLInputElement;

		await userEvent.click(input);
		await userEvent.type(input, "ベンチ");

		await waitFor(() => {
			expect(findOptionByName("ベンチプレス")).toBeDefined();
		});

		const option = findOptionByName("ベンチプレス");
		if (option === undefined) throw new Error("option not found");
		await userEvent.click(option);

		await waitFor(() => {
			expect(args.onSelect).toHaveBeenCalledWith("ex-bench");
			expect(input.value).toBe("");
		});
	},
};

export const DesktopCreateAfterSearch: Story = {
	name: "広画面: 検索して作成",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole("combobox") as HTMLInputElement;

		await userEvent.click(input);
		await userEvent.type(input, "新しい種目");

		await waitFor(() => {
			expect(findCreateOption()).toBeDefined();
		});

		const createOption = findCreateOption();
		if (createOption === undefined) throw new Error("create option not found");
		await userEvent.click(createOption);

		await waitFor(() => {
			expect(args.onCreateExercise).toHaveBeenCalledWith("新しい種目");
			expect(input.value).toBe("");
		});
	},
};

export const DesktopSelectedDisplay: Story = {
	name: "広画面: 選択中の表示",
	args: { selectedExerciseId: "ex-bench" },
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole("combobox") as HTMLInputElement;

		await waitFor(() => {
			expect(input).toHaveValue("ベンチプレス");
		});

		await userEvent.click(input);
		await userEvent.clear(input);

		await waitFor(() => {
			const benchOption = findOptionByName("ベンチプレス");
			expect(benchOption?.getAttribute("data-selected")).toBe("true");
		});
	},
};

export const DesktopExactMatch: Story = {
	name: "広画面: 既存と一致する入力",
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole("combobox") as HTMLInputElement;

		await userEvent.click(input);
		await userEvent.type(input, "ベンチプレス");

		await waitFor(() => {
			expect(findCreateOption()).toBeUndefined();
			expect(findOptionByName("ベンチプレス")).toBeDefined();
		});

		const option = findOptionByName("ベンチプレス");
		if (option === undefined) throw new Error("option not found");
		await userEvent.click(option);

		await waitFor(() => {
			expect(args.onSelect).toHaveBeenCalledWith("ex-bench");
		});
	},
};

export const DesktopEmptyList: Story = {
	name: "広画面: 種目登録0件",
	args: { exercises: [] },
	globals: { viewport: { value: "desktop" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole("combobox") as HTMLInputElement;

		await userEvent.click(input);
		await userEvent.type(input, "新規種目");

		await waitFor(() => {
			expect(findCreateOption()).toBeDefined();
		});

		const createOption = findCreateOption();
		if (createOption === undefined) throw new Error("create option not found");
		await userEvent.click(createOption);

		await waitFor(() => {
			expect(args.onCreateExercise).toHaveBeenCalledWith("新規種目");
		});
	},
};

export const MobileSelectAfterSearch: Story = {
	name: "狭画面: 検索して選択",
	globals: { viewport: { value: "mobile" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("button", { name: /種目を選択/ });

		await userEvent.click(trigger);
		await waitFor(() => {
			expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		});

		await userEvent.type(requireDrawerSearchInput(), "ベンチ");
		await waitFor(() => {
			expect(findDrawerExerciseButton("ベンチプレス")).toBeDefined();
		});

		const button = findDrawerExerciseButton("ベンチプレス");
		if (button === undefined) throw new Error("button not found");
		await userEvent.click(button);

		await waitFor(() => {
			expect(args.onSelect).toHaveBeenCalledWith("ex-bench");
			expect(document.querySelector('[role="dialog"]')).toBeNull();
			expect(document.activeElement).toBe(trigger);
		});
	},
};

export const MobileCreateAfterSearch: Story = {
	name: "狭画面: 検索して作成",
	globals: { viewport: { value: "mobile" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("button", { name: /種目を選択/ });

		await userEvent.click(trigger);
		await waitFor(() => {
			expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		});

		await userEvent.type(requireDrawerSearchInput(), "新しい種目");
		await waitFor(() => {
			expect(findDrawerCreateButton()?.hasAttribute("disabled")).toBe(false);
		});

		const createButton = findDrawerCreateButton();
		if (createButton === undefined) throw new Error("create button not found");
		await userEvent.click(createButton);

		await waitFor(() => {
			expect(args.onCreateExercise).toHaveBeenCalledWith("新しい種目");
			expect(document.querySelector('[role="dialog"]')).toBeNull();
		});
	},
};

export const MobileSelectedDisplay: Story = {
	name: "狭画面: 選択中の表示",
	args: { selectedExerciseId: "ex-bench" },
	globals: { viewport: { value: "mobile" } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("button", { name: /ベンチプレス/ });
		expect(trigger.textContent).toContain("ベンチプレス");

		await userEvent.click(trigger);
		await waitFor(() => {
			expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		});

		await waitFor(() => {
			const benchOption = findOptions(requireDrawerDialog()).find(
				(o) => o.textContent === "ベンチプレス",
			);
			expect(benchOption?.getAttribute("aria-selected")).toBe("true");
		});
	},
};

export const MobilePanelHeightStable: Story = {
	name: "狭画面: パネル高さ不変",
	globals: { viewport: { value: "mobile" } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("button", { name: /種目を選択/ });

		await userEvent.click(trigger);
		await waitFor(() => {
			expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		});
		await new Promise((resolve) => setTimeout(resolve, 400));
		const initialHeight = getDrawerPanel().getBoundingClientRect().height;

		const searchInput = requireDrawerSearchInput();
		await userEvent.type(searchInput, "ベ");
		await waitFor(() => {
			expect(findOptions(requireDrawerDialog()).length).toBeGreaterThan(0);
		});
		expect(getDrawerPanel().getBoundingClientRect().height).toBe(initialHeight);

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "存在しない");
		await waitFor(() => {
			expect(findOptions(requireDrawerDialog()).length).toBe(0);
		});
		expect(getDrawerPanel().getBoundingClientRect().height).toBe(initialHeight);
	},
};

export const MobileEmptyList: Story = {
	name: "狭画面: 種目登録0件",
	args: { exercises: [] },
	globals: { viewport: { value: "mobile" } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("button", { name: /種目を選択/ });

		await userEvent.click(trigger);
		await waitFor(() => {
			expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		});

		await userEvent.type(requireDrawerSearchInput(), "新規種目");
		await waitFor(() => {
			expect(findDrawerCreateButton()?.hasAttribute("disabled")).toBe(false);
		});

		const createButton = findDrawerCreateButton();
		if (createButton === undefined) throw new Error("create button not found");
		await userEvent.click(createButton);

		await waitFor(() => {
			expect(args.onCreateExercise).toHaveBeenCalledWith("新規種目");
			expect(document.querySelector('[role="dialog"]')).toBeNull();
		});
	},
};

const InteractiveDemo = () => {
	const [exercises, setExercises] = useState<Exercise[]>([
		{ id: "ex-bench", name: "ベンチプレス" },
		{ id: "ex-squat", name: "バックスクワット" },
	]);
	const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

	const handleCreate = (name: string) => {
		const id = `ex-${Date.now()}`;
		setExercises((prev) => [...prev, { id, name }]);
		setSelectedId(id);
	};

	const selectedName =
		exercises.find((exercise) => exercise.id === selectedId)?.name ?? null;

	return (
		<div className="flex flex-col gap-4">
			<ExerciseSelector
				exercises={exercises}
				{...(selectedId !== undefined
					? { selectedExerciseId: selectedId }
					: {})}
				onSelect={setSelectedId}
				onCreateExercise={handleCreate}
			/>
			<p className="text-muted-fg text-sm">
				選択中: <span className="text-fg">{selectedName ?? "-"}</span>
			</p>
			<p className="text-muted-fg text-sm">登録済み: {exercises.length} 件</p>
		</div>
	);
};

export const Interactive: Story = {
	name: "インタラクティブ（選択 + 新規追加の動作確認）",
	args: { exercises: [] },
	render: () => <InteractiveDemo />,
};
