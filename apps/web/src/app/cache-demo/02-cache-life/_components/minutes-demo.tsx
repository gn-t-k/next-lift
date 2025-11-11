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
import { getMinutesData } from "../_queries/get-minutes-data";

const getCachedMinutesData = async () => {
	"use cache";
	cacheLife("minutes");
	return getMinutesData();
};

export const MinutesDemoFallback: FC = () => {
	return (
		<MessageBox variant="secondary">
			<MessageBoxTitle>minutes プロファイル</MessageBoxTitle>
			<MessageBoxBody>
				<SkeletonLoading lines={2} className="space-y-2" />
			</MessageBoxBody>
		</MessageBox>
	);
};

export const MinutesDemo: FC = async () => {
	const data = await getCachedMinutesData();

	return (
		<MessageBox variant="secondary">
			<div className="flex items-center justify-between">
				<MessageBoxTitle>minutes プロファイル</MessageBoxTitle>
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
