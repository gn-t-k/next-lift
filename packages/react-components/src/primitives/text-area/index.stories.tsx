import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "../label";
import { TextField, TextFieldDescription, TextFieldError } from "../text-field";
import { TextArea } from ".";

const meta = {
	title: "UI/TextArea",
	component: TextArea,
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
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<TextField>
			<Label>メモ</Label>
			<TextArea placeholder="例: Deload week は 4 週ごと" />
		</TextField>
	),
};

export const WithDescription: Story = {
	render: () => (
		<TextField>
			<Label>メモ</Label>
			<TextArea placeholder="例: Deload week は 4 週ごと" />
			<TextFieldDescription>任意入力です</TextFieldDescription>
		</TextField>
	),
};

export const Invalid: Story = {
	render: () => (
		<TextField isInvalid>
			<Label>メモ</Label>
			<TextArea defaultValue="短すぎるメモ" />
			<TextFieldError>もう少し詳しく入力してください</TextFieldError>
		</TextField>
	),
};

export const Disabled: Story = {
	render: () => (
		<TextField isDisabled>
			<Label>メモ</Label>
			<TextArea defaultValue="変更できません" />
		</TextField>
	),
};
