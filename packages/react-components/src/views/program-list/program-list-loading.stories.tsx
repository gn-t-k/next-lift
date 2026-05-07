import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "../../primitives/heading";
import { PageSection } from "../../primitives/page-section";
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
			<PageSection width="wide">
				<Heading>プログラム</Heading>
				<Story />
			</PageSection>
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
