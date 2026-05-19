import type { Meta, StoryObj } from "@storybook/react";
import { NumberField, NumberFieldInput } from "../number-field/number-field";
import { Label } from "./label";

const meta = {
	title: "UI/Label",
	component: Label,
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
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "重量",
	},
};

export const Required: Story = {
	name: "親の data-required で * が付く",
	render: () => (
		<NumberField isRequired>
			<Label>重量</Label>
			<NumberFieldInput />
		</NumberField>
	),
};

export const Disabled: Story = {
	name: "親の disabled で透明度が下がる",
	render: () => (
		<NumberField isDisabled defaultValue={60}>
			<Label>重量</Label>
			<NumberFieldInput />
		</NumberField>
	),
};
