import type { FC, PropsWithChildren } from "react";
import { tv } from "tailwind-variants";

const messageBox = tv({
	base: "space-y-2",
	variants: {
		variant: {
			secondary: "rounded-lg border border-border bg-secondary p-4",
			warning:
				"rounded-lg border border-yellow-500/50 bg-yellow-50 p-4 text-yellow-700 dark:bg-yellow-900/10 dark:text-yellow-300",
			success:
				"rounded-lg border border-green-500/50 bg-green-50 p-4 text-green-700 dark:bg-green-900/10 dark:text-green-300",
			info: "rounded-lg border border-blue-500/50 bg-blue-50 p-4 text-blue-700 dark:bg-blue-900/10 dark:text-blue-300",
			muted: "rounded-lg border border-border bg-muted p-4 text-muted-fg",
			accent: "rounded bg-accent p-3 text-muted-fg",
		},
	},
});

type MessageBoxVariant = keyof typeof messageBox.variants.variant;

type MessageBoxProps = {
	variant: MessageBoxVariant;
};

export const MessageBox: FC<PropsWithChildren<MessageBoxProps>> = ({
	variant,
	children,
}) => {
	return <div className={messageBox({ variant })}>{children}</div>;
};

export const MessageBoxTitle: FC<PropsWithChildren> = ({ children }) => {
	return <p className="font-semibold text-fg">{children}</p>;
};

export const MessageBoxBody: FC<PropsWithChildren> = ({ children }) => {
	return <div className="space-y-4 text-sm">{children}</div>;
};
