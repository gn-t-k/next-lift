import type { Meta, StoryObj } from "@storybook/react";
import {
	type FC,
	useMemo,
	useOptimistic,
	useState,
	useTransition,
} from "react";
import type { Key } from "react-aria-components";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
	ComboBox,
	ComboBoxDescription,
	ComboBoxError,
	ComboBoxInput,
	ComboBoxItem,
	ComboBoxLabel,
	ComboBoxList,
} from "./combo-box";

type Exercise = { id: string; name: string };

const exercises: Exercise[] = [
	{ id: "bench-press", name: "ベンチプレス" },
	{ id: "incline-bench-press", name: "インクラインベンチプレス" },
	{ id: "dumbbell-press", name: "ダンベルプレス" },
	{ id: "shoulder-press", name: "ショルダープレス" },
	{ id: "lat-pulldown", name: "ラットプルダウン" },
	{ id: "deadlift", name: "デッドリフト" },
	{ id: "squat", name: "スクワット" },
	{ id: "leg-press", name: "レッグプレス" },
	{ id: "leg-extension", name: "レッグエクステンション" },
	{ id: "leg-curl", name: "レッグカール" },
];

const meta = {
	title: "UI/ComboBox",
	component: ComboBox,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<ComboBox aria-label="種目を選択">
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索" />
			<ComboBoxList items={exercises}>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

export const WithDescription: Story = {
	render: () => (
		<ComboBox>
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索" />
			<ComboBoxDescription>
				一覧から選ぶか、入力して絞り込めます
			</ComboBoxDescription>
			<ComboBoxList items={exercises}>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

export const WithDefaultSelection: Story = {
	name: "選択済み",
	render: () => (
		<ComboBox defaultSelectedKey="squat">
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索" />
			<ComboBoxList items={exercises}>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

export const Empty: Story = {
	name: "0件 (まだ種目未登録)",
	render: () => (
		<ComboBox>
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索" />
			<ComboBoxList<{ id: string; name: string }>
				items={[]}
				renderEmptyState={() => (
					<div className="px-3 py-6 text-center text-muted-fg text-sm">
						種目が登録されていません
					</div>
				)}
			>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

export const NoMatches: Story = {
	name: "検索結果なし",
	render: () => (
		<ComboBox defaultInputValue="存在しない種目">
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索" />
			<ComboBoxList
				items={exercises}
				renderEmptyState={() => (
					<div className="px-3 py-6 text-center text-muted-fg text-sm">
						一致する種目がありません
					</div>
				)}
			>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

export const Required: Story = {
	render: () => (
		<ComboBox isRequired>
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索" />
			<ComboBoxList items={exercises}>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

export const Invalid: Story = {
	render: () => (
		<ComboBox isInvalid>
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索" />
			<ComboBoxError>種目を選択してください</ComboBoxError>
			<ComboBoxList items={exercises}>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

export const Disabled: Story = {
	render: () => (
		<ComboBox isDisabled defaultInputValue="ベンチプレス">
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput />
			<ComboBoxList items={exercises}>
				{(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
			</ComboBoxList>
		</ComboBox>
	),
};

const CREATE_OPTION_ID = "__create__";

// 実アプリでは apps/web/.../_mutations/add-exercise.ts に "use server" で配置する。
// 戻り値は @praha/byethrow の R.Result<Exercise, AddExerciseError> となり、
// 成功時は server action 内で revalidatePath を呼んで RSC を再評価し、
// 親 Server Component から流れてくる exercises props が新しい一覧で再流入する。
// このストーリーではネットワーク遅延だけを模倣している。
type AddExerciseAction = (name: string) => Promise<Exercise>;

const simulateAddExerciseAction: AddExerciseAction = async (name) => {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return { id: `srv-${Date.now()}`, name };
};

// 実アプリで apps/web 側に置く Client Component の想定。
// - exercises は親の Server Component で取得した一覧を props で受け取る
// - addExercise は server action (直接 import するか props 経由で受け取る)
type ExerciseComboBoxProps = {
	exercises: Exercise[];
	addExercise: AddExerciseAction;
};

const ExerciseComboBox: FC<ExerciseComboBoxProps> = ({
	exercises,
	addExercise,
}) => {
	// useOptimistic は server action 完了 (= props の exercises 再流入) を
	// 待たずに新規種目を一覧へ反映する。props が更新された時点で
	// optimistic state は破棄され、サーバー由来の値に置き換わる。
	const [optimisticExercises, addOptimisticExercise] = useOptimistic(
		exercises,
		(current, draft: Exercise) => [...current, draft],
	);

	const [, startTransition] = useTransition();
	const [inputValue, setInputValue] = useState("");
	const [selectedKey, setSelectedKey] = useState<Key | null>(null);

	const items = useMemo(() => {
		const trimmed = inputValue.trim();
		if (trimmed === "") return optimisticExercises;
		// React Aria の ComboBox は controlled inputValue では自動フィルタしないので
		// 自前で contains フィルタ + 一致なし時の CREATE 候補挿入を行う
		const lower = trimmed.toLowerCase();
		const filtered = optimisticExercises.filter((e) =>
			e.name.toLowerCase().includes(lower),
		);
		if (filtered.length === 0) {
			return [{ id: CREATE_OPTION_ID, name: `「${trimmed}」を登録する` }];
		}
		return filtered;
	}, [inputValue, optimisticExercises]);

	const onSelectionChange = (key: Key | null) => {
		if (key === CREATE_OPTION_ID) {
			const trimmed = inputValue.trim();
			const optimisticId = `optimistic-${Date.now()}`;
			// useOptimistic と server action は transition 内で呼ぶ必要がある
			startTransition(async () => {
				addOptimisticExercise({ id: optimisticId, name: trimmed });
				setSelectedKey(optimisticId);
				setInputValue(trimmed);

				const created = await addExercise(trimmed);
				// 実アプリでは server action 内の revalidatePath で
				// 親 RSC が再評価され exercises props が新しい値で再流入し、
				// optimistic state はその時点で捨てられる。
				// 選択キーは server 採番の id に切り替える。
				setSelectedKey(created.id);
			});
			return;
		}
		setSelectedKey(key);
		const matched = optimisticExercises.find((e) => e.id === key);
		if (matched !== undefined) {
			setInputValue(matched.name);
		}
	};

	return (
		<ComboBox
			items={items}
			inputValue={inputValue}
			onInputChange={setInputValue}
			selectedKey={selectedKey}
			onSelectionChange={onSelectionChange}
			allowsCustomValue
		>
			<ComboBoxLabel>種目</ComboBoxLabel>
			<ComboBoxInput placeholder="種目名で検索 / 新規登録" />
			<ComboBoxDescription>
				一致する種目がなければ「<strong>○○を登録する</strong>」が候補に出ます
			</ComboBoxDescription>
			<ComboBoxList<Exercise>>
				{(item) =>
					item.id === CREATE_OPTION_ID ? (
						<ComboBoxItem
							id={item.id}
							className="text-primary data-[focused]:bg-primary/10 data-[focused]:text-primary"
						>
							{item.name}
						</ComboBoxItem>
					) : (
						<ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>
					)
				}
			</ComboBoxList>
		</ComboBox>
	);
};

// ストーリー専用ラッパ。実アプリでは Server Component が exercises を取得し、
// server action 内の revalidatePath が再取得を起こす。
// ストーリーでは local state でその挙動を模倣する。
const CreateNewOptionDemo: FC = () => {
	const [registered, setRegistered] = useState(exercises);
	const addExercise: AddExerciseAction = async (name) => {
		const created = await simulateAddExerciseAction(name);
		setRegistered((prev) => [...prev, created]);
		return created;
	};
	return <ExerciseComboBox exercises={registered} addExercise={addExercise} />;
};

export const CreateNewOption: Story = {
	name: "未登録項目をその場で登録 (拡張性確認)",
	render: () => <CreateNewOptionDemo />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole("combobox");

		// 「懸垂」と入力 (登録済みに存在しない)
		await userEvent.click(input);
		await userEvent.type(input, "懸垂");

		// portal に出る popover から「「懸垂」を登録する」候補を待つ
		const createOption = await waitFor(() => {
			const options = Array.from(
				document.querySelectorAll<HTMLElement>('[role="option"]'),
			);
			const labels = options.map((el) => el.textContent ?? "");
			const listbox = document.querySelector('[role="listbox"]');
			const ariaExpanded = input.getAttribute("aria-expanded");
			const inputValue = (input as HTMLInputElement).value;
			const found = options.find((el) =>
				el.textContent?.includes("「懸垂」を登録する"),
			);
			if (found === undefined) {
				throw new Error(
					`CREATE option not found. inputValue=${inputValue}, ariaExpanded=${ariaExpanded}, listboxExists=${Boolean(listbox)}, options=${JSON.stringify(labels)}`,
				);
			}
			return found;
		});

		// 候補をクリックすると、input が「懸垂」に置き換わる
		await userEvent.click(createOption);
		await waitFor(() => {
			expect(input).toHaveValue("懸垂");
		});

		// 同じ「懸垂」を入力し直しても登録済みになっているので
		// CREATE option は出ず、登録済みの項目が選択候補に出る
		await userEvent.clear(input);
		await userEvent.type(input, "懸垂");
		await waitFor(() => {
			const options = Array.from(
				document.querySelectorAll<HTMLElement>('[role="option"]'),
			);
			const labels = options.map((el) => el.textContent ?? "");
			// 「懸垂」を登録する」候補が消えていること
			expect(labels.some((l) => l.includes("「懸垂」を登録する"))).toBe(false);
			// 登録済みの「懸垂」が候補に出ていること
			expect(labels.some((l) => l.trim() === "懸垂")).toBe(true);
		});

		// 部分一致 (「ベ」) を入力すると登録済みの該当項目だけが絞り込まれ
		// CREATE 候補は出ない (一部マッチがあるなら新規登録は不要というUX)
		await userEvent.clear(input);
		await userEvent.type(input, "ベ");
		await waitFor(() => {
			const options = Array.from(
				document.querySelectorAll<HTMLElement>('[role="option"]'),
			);
			const labels = options.map((el) => el.textContent ?? "");
			expect(labels.some((l) => l.includes("「ベ」を登録する"))).toBe(false);
			// ベンチプレス / インクラインベンチプレス / ダンベルプレス の 3 件が contains で絞られて出る
			expect(options.length).toBeGreaterThan(0);
			expect(
				labels.every((l) => l.toLowerCase().includes("ベ".toLowerCase())),
			).toBe(true);
		});
	},
};
