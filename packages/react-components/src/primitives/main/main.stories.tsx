import type { Meta, StoryObj } from "@storybook/react";
import { Heading, Section } from "../heading";
import { Main } from "./main";

const meta = {
	title: "UI/Main",
	component: Main,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
	argTypes: {
		width: {
			control: "select",
			options: ["narrow", "wide"],
		},
	},
} satisfies Meta<typeof Main>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Narrow: Story = {
	args: {
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
		<Main width="wide">
			<Heading>メインタイトル</Heading>
			<p>main コンテナ。配下に Section をネストできる。</p>
			<Section>
				<Heading>サブセクション</Heading>
				<p>section + heading scope の例。</p>
			</Section>
		</Main>
	),
};
