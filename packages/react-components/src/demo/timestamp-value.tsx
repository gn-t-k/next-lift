import type { ComponentProps, FC } from "react";
import { cn } from "../lib";

type Props = ComponentProps<"time"> & {
	dateTime: string;
};

export const TimestampValue: FC<Props> = ({
	dateTime,
	className,
	...props
}) => {
	return (
		<time
			{...props}
			dateTime={dateTime}
			className={cn(className, "font-mono text-xs")}
		>
			{new Date(dateTime).toLocaleString("ja-JP")}
		</time>
	);
};
