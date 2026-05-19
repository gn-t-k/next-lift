import type { Meta, StoryObj } from "@storybook/react";
import { Main } from "../main";
import { Heading, Section } from ".";

const meta = {
	title: "UI/Heading",
	component: Heading,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<Main>
				<Story />
			</Main>
		),
	],
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "プログラム名",
	},
};

export const Nested: Story = {
	args: { children: "" },
	render: () => (
		<div className="flex flex-col gap-4">
			<Heading>h1: ページタイトル</Heading>
			<Section>
				<Heading>h2: セクションタイトル</Heading>
				<Section>
					<Heading>h3: サブセクション</Heading>
					<Section>
						<Heading>h4: 小見出し</Heading>
						<Section>
							<Heading>h5: より小さい見出し</Heading>
							<Section>
								<Heading>h6: 最小の見出し</Heading>
							</Section>
						</Section>
					</Section>
				</Section>
			</Section>
		</div>
	),
};
