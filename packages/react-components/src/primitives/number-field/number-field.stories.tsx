import type { Meta, StoryObj } from "@storybook/react";
import {
	NumberField,
	NumberFieldDescription,
	NumberFieldError,
	NumberFieldInput,
	NumberFieldLabel,
} from "./number-field";

const meta = {
	title: "UI/NumberField",
	component: NumberField,
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
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<NumberField defaultValue={10}>
			<NumberFieldLabel>回数</NumberFieldLabel>
			<NumberFieldInput />
		</NumberField>
	),
};

export const WithDescription: Story = {
	render: () => (
		<NumberField defaultValue={60} step={2.5}>
			<NumberFieldLabel>重量</NumberFieldLabel>
			<NumberFieldInput />
			<NumberFieldDescription>
				+/- ボタンで 2.5kg ずつ調整
			</NumberFieldDescription>
		</NumberField>
	),
};

export const WeightWithUnitLabel: Story = {
	name: "重量 (kg, step=2.5、単位は外側ラベルで表示)",
	render: () => (
		<NumberField defaultValue={60} step={2.5} minValue={0}>
			<NumberFieldLabel>重量 (kg)</NumberFieldLabel>
			<NumberFieldInput />
			<NumberFieldDescription>
				単位はラベルに含めて、入力欄は数値だけにする
			</NumberFieldDescription>
		</NumberField>
	),
};

export const WeightWithUnitSuffix: Story = {
	name: "重量 (kg, step=2.5、単位は input 隣に suffix で表示)",
	render: () => (
		<div className="flex items-end gap-2">
			<NumberField defaultValue={60} step={2.5} minValue={0}>
				<NumberFieldLabel>重量</NumberFieldLabel>
				<NumberFieldInput />
			</NumberField>
			<span className="pb-2 text-fg text-sm">kg</span>
		</div>
	),
};

export const WeightLbsWithUnitLabel: Story = {
	name: "重量 (lbs, step=5、単位はラベルで表示)",
	render: () => (
		<NumberField defaultValue={135} step={5} minValue={0}>
			<NumberFieldLabel>重量 (lbs)</NumberFieldLabel>
			<NumberFieldInput />
		</NumberField>
	),
};

export const Reps: Story = {
	name: "回数 (step=1)",
	render: () => (
		<NumberField defaultValue={10} step={1} minValue={0}>
			<NumberFieldLabel>回数</NumberFieldLabel>
			<NumberFieldInput />
			<NumberFieldDescription>1 回ずつ調整</NumberFieldDescription>
		</NumberField>
	),
};

export const WithMinMax: Story = {
	name: "min / max あり",
	render: () => (
		<NumberField defaultValue={5} minValue={0} maxValue={10}>
			<NumberFieldLabel>セット数</NumberFieldLabel>
			<NumberFieldInput />
			<NumberFieldDescription>0〜10 の範囲で入力</NumberFieldDescription>
		</NumberField>
	),
};

export const Required: Story = {
	render: () => (
		<NumberField isRequired>
			<NumberFieldLabel>重量</NumberFieldLabel>
			<NumberFieldInput />
		</NumberField>
	),
};

export const Invalid: Story = {
	render: () => (
		<NumberField isInvalid defaultValue={-10} minValue={0}>
			<NumberFieldLabel>重量</NumberFieldLabel>
			<NumberFieldInput />
			<NumberFieldError>0 以上の値を入力してください</NumberFieldError>
		</NumberField>
	),
};

export const Disabled: Story = {
	render: () => (
		<NumberField isDisabled defaultValue={60}>
			<NumberFieldLabel>重量</NumberFieldLabel>
			<NumberFieldInput />
			<NumberFieldDescription>変更できません</NumberFieldDescription>
		</NumberField>
	),
};

export const ReadOnly: Story = {
	render: () => (
		<NumberField isReadOnly defaultValue={60}>
			<NumberFieldLabel>重量</NumberFieldLabel>
			<NumberFieldInput />
		</NumberField>
	),
};

export const Empty: Story = {
	render: () => (
		<NumberField>
			<NumberFieldLabel>重量</NumberFieldLabel>
			<NumberFieldInput placeholder="未入力" />
			<NumberFieldDescription>
				値未入力 (paramsなし) のセット計画相当
			</NumberFieldDescription>
		</NumberField>
	),
};
