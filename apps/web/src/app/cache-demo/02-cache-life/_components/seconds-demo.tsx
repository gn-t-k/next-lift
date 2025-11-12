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
import { getSecondsData } from "../_queries/get-seconds-data";

const getCachedSecondsData = async () => {
	"use cache";
	cacheLife("seconds");
	return getSecondsData();
};

export const SecondsDemoFallback: FC = () => {
	return (
		<MessageBox variant="secondary">
			<MessageBoxTitle>seconds プロファイル</MessageBoxTitle>
			<MessageBoxBody>
				<SkeletonLoading lines={2} className="space-y-2" />
			</MessageBoxBody>
		</MessageBox>
	);
};

export const SecondsDemo: FC = async () => {
	const data = await getCachedSecondsData();

	return (
		<MessageBox variant="secondary">
			<div className="flex items-center justify-between">
				<MessageBoxTitle>seconds プロファイル</MessageBoxTitle>
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
