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
import { connection } from "next/server";
import { type FC, Suspense } from "react";
import { getDynamicData } from "../_queries/get-dynamic-data";

const getDynamicDataWithConnection = async () => {
	// connection()を使う場合は"use cache"を使えない
	await connection();
	return getDynamicData();
};

const Skeleton: FC = () => {
	return <SkeletonLoading lines={3} className="space-y-3" />;
};

const DataContent: FC = async () => {
	const data = await getDynamicDataWithConnection();

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
					ページをリロードすると、この値が更新されます（リクエストごとに生成）。
				</p>
			</MessageBox>
		</div>
	);
};

export const WithConnectionDisplay: FC = () => {
	return (
		<DemoCard>
			<DemoCardHeader priority="B">
				<DemoCardTitle>connection()あり</DemoCardTitle>
				<DemoCardDescription>
					動的レンダリング - リクエストごとに新しい値が生成される
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
