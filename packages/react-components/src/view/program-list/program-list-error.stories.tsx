import type { Meta, StoryObj } from "@storybook/react";
import { PageHeading } from "../../primitive/page-heading";
import { PageSection } from "../../primitive/page-section";
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
			<PageSection width="wide">
				<PageHeading as="h1">プログラム</PageHeading>
				<Story />
			</PageSection>
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
