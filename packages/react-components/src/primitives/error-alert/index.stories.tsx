import type { Meta, StoryObj } from "@storybook/react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorAlert } from ".";

const meta = {
	title: "UI/ErrorAlert",
	component: ErrorAlert,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof ErrorAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "エラーが発生しました。",
	},
};

export const LongMessage: Story = {
	args: {
		children:
			"通信エラーが発生しました。ネットワーク接続を確認した上で、しばらく経ってから再度お試しください。問題が解決しない場合はサポートまでお問い合わせください。",
	},
};

const ThrowingComponent = () => {
	throw new Error("意図的に発生させたエラー");
};

export const AsErrorBoundaryFallback: Story = {
	args: { children: null },
	render: () => (
		<ErrorBoundary
			fallback={<ErrorAlert>データの取得に失敗しました。</ErrorAlert>}
		>
			<ThrowingComponent />
		</ErrorBoundary>
	),
};
