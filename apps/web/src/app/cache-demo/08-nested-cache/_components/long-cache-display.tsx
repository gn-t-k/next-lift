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
import { getLongCacheData } from "../_queries/get-long-cache-data";

const Skeleton: FC = () => {
	return <SkeletonLoading lines={3} className="space-y-3" />;
};

const DataContent: FC = async () => {
	const data = await getLongCacheData();

	return (
		<div className="space-y-3">
			<DataFieldList>
				<DataFieldLabel>データ</DataFieldLabel>
				<DataFieldValue>{data.data}</DataFieldValue>
			</DataFieldList>
			<div className="rounded bg-accent p-3 text-sm">
				<DataFieldList>
					<DataFieldLabel>ネストされたデータ</DataFieldLabel>
					<DataFieldValue>{data.nestedData.data}</DataFieldValue>
					<DataFieldLabel>タイムスタンプ</DataFieldLabel>
					<DataFieldValue>
						<TimestampValue dateTime={data.nestedData.timestamp} />
					</DataFieldValue>
				</DataFieldList>
				<DataFieldList className="ml-4 mt-2">
					<DataFieldLabel className="text-xs">
						さらにネストされたデータ
					</DataFieldLabel>
					<DataFieldValue className="text-xs">
						{data.nestedData.nestedData.data}
					</DataFieldValue>
					<DataFieldLabel className="text-xs">タイムスタンプ</DataFieldLabel>
					<DataFieldValue className="text-xs">
						<TimestampValue dateTime={data.nestedData.nestedData.timestamp} />
					</DataFieldValue>
				</DataFieldList>
			</div>
			<DataFieldList className="mt-4 border-border border-t pt-3">
				<DataFieldLabel>キャッシュ時刻</DataFieldLabel>
				<DataFieldValue>
					<TimestampValue dateTime={data.timestamp} />
				</DataFieldValue>
			</DataFieldList>
		</div>
	);
};

export const LongCacheDisplay: FC = () => {
	return (
		<DemoCard>
			<DemoCardHeader priority="C">
				<DemoCardTitle>長いキャッシュ（hours）</DemoCardTitle>
				<DemoCardDescription>
					5分stale, 1時間revalidate, 1日expire
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
