"use client";

import type { FC } from "react";
import { useState } from "react";
import { cn } from "../lib";
import { Button } from "../ui/button";

type Props = {
	code: string;
	title?: string;
	className?: string;
};

export const CodeBlock: FC<Props> = ({ code, title, className }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-lg border border-border bg-secondary",
				className,
			)}
		>
			{title && (
				<div className="border-border border-b bg-muted px-4 py-2">
					<span className="font-medium text-fg text-sm">{title}</span>
				</div>
			)}
			<div className="relative">
				<pre className="overflow-x-auto p-4 text-sm">
					<code className="font-mono text-fg">{code}</code>
				</pre>
				<div className="absolute top-2 right-2">
					<Button
						size="xs"
						intent="secondary"
						onPress={handleCopy}
						aria-label="コードをコピー"
					>
						{copied ? "コピーしました!" : "コピー"}
					</Button>
				</div>
			</div>
		</div>
	);
};
