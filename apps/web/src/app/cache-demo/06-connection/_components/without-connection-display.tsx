import {
	DataFieldLabel,
	DataFieldList,
	DataFieldValue,
	DemoCard,
	DemoCardContent,
	DemoCardDescription,
	DemoCardHeader,
	DemoCardTitle,
	MessageBox,
	SkeletonLoading,
	TimestampValue,
} from "@next-lift/react-components/demo";
import { type FC, Suspense } from "react";
import { getStaticData } from "../_queries/get-static-data";

const getCachedStaticData = async () => {
	"use cache";
	return getStaticData();
};

const Skeleton: FC = () => {
	return <SkeletonLoading lines={3} className="space-y-3" />;
};

const DataContent: FC = async () => {
	const data = await getCachedStaticData();

	return (
		<div className="space-y-3">
			<DataFieldList>
				<DataFieldLabel>乱数</DataFieldLabel>
				<DataFieldValue className="font-mono text-xl text-muted-fg">
					{data.random.toFixed(10)}
				</DataFieldValue>
				<DataFieldLabel>タイムスタンプ</DataFieldLabel>
				<DataFieldValue>
					<TimestampValue dateTime={data.timestamp} className="text-muted-fg" />
				</DataFieldValue>
				<DataFieldLabel>レンダリングタイプ</DataFieldLabel>
				<DataFieldValue>{data.renderType}</DataFieldValue>
			</DataFieldList>
			<MessageBox variant="accent">
				<p>
					ページをリロードしても、この値は変わりません（キャッシュされている）。
				</p>
			</MessageBox>
		</div>
	);
};

export const WithoutConnectionDisplay: FC = () => {
	return (
		<DemoCard>
			<DemoCardHeader priority="B">
				<DemoCardTitle>connection()なし</DemoCardTitle>
				<DemoCardDescription>
					静的レンダリング - ビルド時に値が固定される
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
