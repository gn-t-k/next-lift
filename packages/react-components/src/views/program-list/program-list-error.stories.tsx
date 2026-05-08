import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "../../primitives/heading";
import { Main } from "../../primitives/main";
import { ProgramListError } from "./program-list-error";

const meta = {
	title: "View/V1 プログラム一覧/Error",
	component: ProgramListError,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
	args: {
		createHref: "/programs/new",
	},
	decorators: [
		(Story) => (
			<Main width="wide">
				<Heading>プログラム</Heading>
				<Story />
			</Main>
		),
	],
} satisfies Meta<typeof ProgramListError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMessage: Story = {
	args: {
		message: "ネットワーク接続を確認して再試行してください。",
	},
};

export const Mobile: Story = {
	args: {
		message: "ネットワーク接続を確認して再試行してください。",
	},
	globals: {
		viewport: { value: "mobile" },
	},
};

export const Desktop: Story = {
	args: {
		message: "ネットワーク接続を確認して再試行してください。",
	},
	globals: {
		viewport: { value: "desktop" },
	},
};
