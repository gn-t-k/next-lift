import type { Meta, StoryObj } from "@storybook/react";
import { Heading, Section } from "../heading";
import { PageSection } from "./page-section";

const meta = {
	title: "UI/PageSection",
	component: PageSection,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
	argTypes: {
		as: {
			control: "select",
			options: ["main", "section"],
		},
		width: {
			control: "select",
			options: ["narrow", "wide"],
		},
	},
} satisfies Meta<typeof PageSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Narrow: Story = {
	args: {
		as: "main",
		width: "narrow",
		children: (
			<>
				<Heading>narrow ページ</Heading>
				<p>
					max-w-2xl で表示される。フォームや記事など読みやすさ重視のページ向け。
				</p>
			</>
		),
	},
};

export const Wide: Story = {
	args: {
		as: "main",
		width: "wide",
		children: (
			<>
				<Heading>wide ページ</Heading>
				<p>
					max-w-screen-xl
					で表示される。一覧画面やダッシュボードなど情報量の多いページ向け。
				</p>
			</>
		),
	},
};

export const NestedSection: Story = {
	args: { children: null },
	render: () => (
		<PageSection as="main" width="wide">
			<Heading>メインタイトル</Heading>
			<p>main コンテナ。配下に section をネストできる。</p>
			<Section>
				<Heading>サブセクション</Heading>
				<p>section コンテナとして使う例。</p>
			</Section>
		</PageSection>
	),
};
