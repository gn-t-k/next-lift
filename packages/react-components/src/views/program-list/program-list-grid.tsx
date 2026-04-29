import type { ComponentProps, FC } from "react";
import { cn } from "../../libs/utils";

export const ProgramListGrid: FC<ComponentProps<"ul">> = ({
	className,
	...props
}) => (
	<ul
		className={cn(
			"grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3",
			className,
		)}
		{...props}
	/>
);

export const ProgramListGridItem: FC<ComponentProps<"li">> = (props) => (
	<li {...props} />
);
