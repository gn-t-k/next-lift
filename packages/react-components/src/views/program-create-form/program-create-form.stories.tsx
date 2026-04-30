import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { PageHeading } from "../../primitives/page-heading";
import { PageSection } from "../../primitives/page-section";
import { ProgramCreateForm } from "./program-create-form";

const meta = {
	title: "View/V14 プログラム作成",
	component: ProgramCreateForm,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
	args: {
		formProps: {
			onSubmit: (event) => {
				event.preventDefault();
				fn()(new FormData(event.currentTarget));
			},
		},
	},
	decorators: [
		(Story) => (
			<PageSection>
				<PageHeading as="h1">プログラムを始める</PageHeading>
				<Story />
			</PageSection>
		),
	],
} satisfies Meta<typeof ProgramCreateForm>;

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
