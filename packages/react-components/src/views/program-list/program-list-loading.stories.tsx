import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "../../primitives/heading";
import { Main } from "../../primitives/main";
import { ProgramListLoading } from "./program-list-loading";

const meta = {
	title: "View/V1 プログラム一覧/Loading",
	component: ProgramListLoading,
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
} satisfies Meta<typeof ProgramListLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
	globals: {
		viewport: { value: "mobile" },
	},
};

export const Desktop: Story = {
	globals: {
		viewport: { value: "desktop" },
	},
};
