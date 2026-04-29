import type { FC } from "react";
import { cn } from "../../libs/utils";
import { Link } from "../../primitives/link";

type Props = {
	name: string;
	lastUsedAt: Date | null;
	href: string;
};

export const ProgramListItem: FC<Props> = ({ name, lastUsedAt, href }) => {
	return (
		<Link
			href={href}
			className={cn(
				"block h-full min-h-20 rounded-lg p-4 no-underline outline-none",
				"bg-overlay text-overlay-fg shadow-sm",
				"transition-all",
				"hover:bg-secondary hover:shadow-md",
				"focus-visible:bg-secondary focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
			)}
		>
			<span className="wrap-break-word line-clamp-2 font-medium text-base">
				{name}
			</span>
			<span className="mt-1 block text-muted-fg text-xs">
				{formatLastUsed(lastUsedAt)}
			</span>
		</Link>
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
