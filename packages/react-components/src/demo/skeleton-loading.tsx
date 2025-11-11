type Props = {
	lines?: number;
	widths?: string[];
	heights?: string[];
	className?: string;
};

export const SkeletonLoading = ({
	lines = 2,
	widths = ["w-32", "w-48"],
	heights = ["h-4", "h-8"],
	className,
}: Props) => {
	return (
		<div className={className}>
			{Array.from({ length: lines }).map((_, index) => (
				<div
					key={`skeleton-${
						// biome-ignore lint/suspicious/noArrayIndexKey: スケルトンローディングのため一意なキーが不要
						index
					}`}
					className={`animate-pulse rounded bg-muted ${heights[index % heights.length]} ${widths[index % widths.length]}`}
				/>
			))}
		</div>
	);
};
