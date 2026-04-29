import type { Meta, StoryObj } from "@storybook/react";
import { PageHeading } from "../../primitive/page-heading";
import { PageSection } from "../../primitive/page-section";
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
				<PageHeading as="h1">プログラム</PageHeading>
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
