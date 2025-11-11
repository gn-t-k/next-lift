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
} from "@next-lift/react-components/demo";
import { connection } from "next/server";
import { type FC, Suspense } from "react";
import { getDateComparison } from "../_queries/get-date-comparison";

const getDateComparisonWithConnection = async () => {
	// connection()を使う場合は"use cache"を使えない
	// Date.now()を使う前にconnection()を呼ぶ必要がある
	await connection();
	return getDateComparison();
};

const Skeleton: FC = () => {
	return <SkeletonLoading lines={3} className="space-y-3" />;
};

const DataContent: FC = async () => {
	const data = await getDateComparisonWithConnection();

	return (
		<div className="space-y-3">
			<DataFieldList>
				<DataFieldLabel>1回目のDate.now()</DataFieldLabel>
				<DataFieldValue className="font-mono text-sm text-muted-fg">
					{data.withoutConnection}
				</DataFieldValue>
				<DataFieldLabel>2回目のDate.now()( 100ms後)</DataFieldLabel>
				<DataFieldValue className="font-mono text-sm text-muted-fg">
					{data.withConnection}
				</DataFieldValue>
				<DataFieldLabel>差分（ミリ秒）</DataFieldLabel>
				<DataFieldValue className="font-mono text-sm text-muted-fg">
					{data.difference}ms
				</DataFieldValue>
			</DataFieldList>
			<MessageBox variant="accent">
				<p>
					connection()を呼び出した後は、Date.now()がリクエスト時の値を返します。
				</p>
			</MessageBox>
		</div>
	);
};

export const DateComparisonDisplay: FC = () => {
	return (
		<DemoCard>
			<DemoCardHeader priority="B">
				<DemoCardTitle>Date.nowの動作比較</DemoCardTitle>
				<DemoCardDescription>
					connection()呼び出し後のDate.now()の挙動
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
