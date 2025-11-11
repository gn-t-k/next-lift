import {
	DataFieldLabel,
	DataFieldList,
	DataFieldValue,
	MessageBox,
	MessageBoxBody,
	MessageBoxTitle,
	SkeletonLoading,
	StatusBadge,
	TimestampValue,
} from "@next-lift/react-components/demo";
import { cacheLife } from "next/cache";
import type { FC } from "react";
import { getCustomData } from "../_queries/get-custom-data";

const getCachedCustomData = async () => {
	"use cache";
	cacheLife({
		stale: 30, // 30秒後にstaleになる
		revalidate: 60, // 60秒後に再検証
		expire: 180, // 180秒後に期限切れ
	});
	return getCustomData();
};

export const CustomDemoFallback: FC = () => {
	return (
		<MessageBox variant="secondary">
			<MessageBoxTitle>カスタム設定の結果</MessageBoxTitle>
			<MessageBoxBody>
				<SkeletonLoading lines={2} className="space-y-2" />
			</MessageBoxBody>
		</MessageBox>
	);
};

export const CustomDemo: FC = async () => {
	const data = await getCachedCustomData();

	return (
		<MessageBox variant="secondary">
			<div className="flex items-center justify-between">
				<MessageBoxTitle>カスタム設定の結果</MessageBoxTitle>
				<StatusBadge status="HIT" timestamp={data.timestamp} />
			</div>
			<MessageBoxBody>
				<p>{data.description}</p>
				<DataFieldList className="mt-4 border-border border-t pt-3">
					<DataFieldLabel>キャッシュ時刻</DataFieldLabel>
					<DataFieldValue>
						<TimestampValue dateTime={data.timestamp} />
					</DataFieldValue>
				</DataFieldList>
			</MessageBoxBody>
		</MessageBox>
	);
};
