"use client";

import type { FC } from "react";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

const errorAlertStyles = tv({
	slots: {
		container: [
			"relative rounded-lg border border-danger bg-danger/10 p-4",
			"[--alert-fg:var(--color-danger-fg)]",
		],
		header: "flex items-start justify-between gap-2",
		title: "font-medium text-(--alert-fg)",
		closeButton: [
			"shrink-0 rounded-sm opacity-70 transition-opacity",
			"hover:opacity-100",
			"focus:outline-0 focus-visible:ring-2 focus-visible:ring-danger",
			"text-(--alert-fg)",
		],
		message: "mt-2 text-(--alert-fg)/90 text-sm",
	},
});

const styles = errorAlertStyles();

type Props = {
	title?: string;
	message: string;
	onClose?: () => void;
	className?: string;
};

export const ErrorAlert: FC<Props> = ({
	title = "エラー",
	message,
	onClose,
	className,
}) => {
	return (
		<div role="alert" className={twMerge(styles.container(), className)}>
			<div className={styles.header()}>
				<span className={styles.title()}>{title}</span>
				{onClose && (
					<button
						onClick={onClose}
						type="button"
						aria-label="閉じる"
						className={styles.closeButton()}
					>
						×
					</button>
				)}
			</div>
			<p className={styles.message()}>{message}</p>
		</div>
	);
};
