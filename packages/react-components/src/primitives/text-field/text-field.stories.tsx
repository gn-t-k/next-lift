import type { Meta, StoryObj } from "@storybook/react";
import {
	TextField,
	TextFieldDescription,
	TextFieldError,
	TextFieldInput,
	TextFieldLabel,
} from "./text-field";

const meta = {
	title: "UI/TextField",
	component: TextField,
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
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<TextField>
			<TextFieldLabel>プログラム名</TextFieldLabel>
			<TextFieldInput placeholder="例: 上半身" />
		</TextField>
	),
};

export const WithDescription: Story = {
	render: () => (
		<TextField>
			<TextFieldLabel>プログラム名</TextFieldLabel>
			<TextFieldInput placeholder="例: 上半身" />
			<TextFieldDescription>
				あとから種目や Day を追加できます
			</TextFieldDescription>
		</TextField>
	),
};

export const Required: Story = {
	render: () => (
		<TextField isRequired>
			<TextFieldLabel>プログラム名</TextFieldLabel>
			<TextFieldInput placeholder="例: 上半身" />
		</TextField>
	),
};

export const Invalid: Story = {
	render: () => (
		<TextField isInvalid>
			<TextFieldLabel>プログラム名</TextFieldLabel>
			<TextFieldInput defaultValue="" />
			<TextFieldError>プログラム名を入力してください</TextFieldError>
		</TextField>
	),
};

export const WithValidation: Story = {
	render: () => (
		<TextField isRequired>
			<TextFieldLabel>プログラム名</TextFieldLabel>
			<TextFieldInput />
			<TextFieldError>
				{({ validationDetails }) =>
					validationDetails.valueMissing ? "プログラム名を入力してください" : ""
				}
			</TextFieldError>
		</TextField>
	),
};

export const Disabled: Story = {
	render: () => (
		<TextField isDisabled>
			<TextFieldLabel>プログラム名</TextFieldLabel>
			<TextFieldInput defaultValue="上半身" />
			<TextFieldDescription>変更できません</TextFieldDescription>
		</TextField>
	),
};

export const ReadOnly: Story = {
	render: () => (
		<TextField isReadOnly>
			<TextFieldLabel>プログラム名</TextFieldLabel>
			<TextFieldInput defaultValue="上半身" />
		</TextField>
	),
};
