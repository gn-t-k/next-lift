import type { FC } from "react";
import { cn } from "../../libs/utils";
import { Link } from "../../primitives/link";
import { surfaceCardClass } from "../../primitives/surface-card";

type Props = {
	name: string;
	lastUsedAt: Date | null;
	href: string;
};

export const ProgramListItem: FC<Props> = ({ name, lastUsedAt, href }) => {
	return (
		<Link
			href={href}
			className={cn(surfaceCardClass, "block h-full min-h-20 p-4")}
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
