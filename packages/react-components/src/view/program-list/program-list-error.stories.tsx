import type { Meta, StoryObj } from "@storybook/react";
import { ProgramListError } from "./program-list-error";

const meta = {
	title: "View/V1 プログラム一覧/Error",
	component: ProgramListError,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof ProgramListError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMessage: Story = {
	args: {
		message: "ネットワーク接続を確認して再試行してください。",
	},
};
