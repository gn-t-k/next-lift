import {
	DataFieldLabel,
	DataFieldList,
	DataFieldValue,
	DemoCard,
	DemoCardContent,
	DemoCardDescription,
	DemoCardHeader,
	DemoCardTitle,
	SkeletonLoading,
	TimestampValue,
} from "@next-lift/react-components/demo";
import { type FC, Suspense } from "react";
import { getShortCacheData } from "../_queries/get-short-cache-data";

const Skeleton: FC = () => {
	return <SkeletonLoading lines={2} className="space-y-3" />;
};

const DataContent: FC = async () => {
	const data = await getShortCacheData();

	return (
		<div className="space-y-3">
			<DataFieldList>
				<DataFieldLabel>データ</DataFieldLabel>
				<DataFieldValue>{data.data}</DataFieldValue>
			</DataFieldList>
			<DataFieldList className="mt-4 border-border border-t pt-3">
				<DataFieldLabel>キャッシュ時刻</DataFieldLabel>
				<DataFieldValue>
					<TimestampValue dateTime={data.timestamp} />
				</DataFieldValue>
			</DataFieldList>
		</div>
	);
};

export const ShortCacheDisplay: FC = () => {
	return (
		<DemoCard>
			<DemoCardHeader priority="C">
				<DemoCardTitle>短いキャッシュ（seconds）</DemoCardTitle>
				<DemoCardDescription>
					30秒stale, 1秒revalidate, 1分expire
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<Suspense fallback={<Skeleton />}>
					<DataContent />
				</Suspense>
			</DemoCardContent>
		</DemoCard>
	);
};
