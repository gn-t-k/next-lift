"use client";

import type { FC } from "react";
import { Link } from "../../primitive/link";

type Props = {
	name: string;
	lastUsedAt: Date | null;
	href: string;
};

export const ProgramListItem: FC<Props> = ({ name, lastUsedAt, href }) => {
	return (
		<li>
			<Link
				href={href}
				className="block rounded-lg border border-border bg-overlay p-4 text-overlay-fg no-underline outline-none transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
			>
				<span className="wrap-break-word line-clamp-2 font-medium text-base">
					{name}
				</span>
				<span className="mt-1 block text-muted-fg text-xs">
					{formatLastUsed(lastUsedAt)}
				</span>
			</Link>
		</li>
	);
};

const formatLastUsed = (date: Date | null): string => {
	if (date === null) {
		return "未使用";
	}
	const formatted = new Intl.DateTimeFormat("ja-JP", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
	return `最終使用 ${formatted}`;
};
