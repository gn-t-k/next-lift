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
import { getHoursData } from "../_queries/get-hours-data";

const getCachedHoursData = async () => {
	"use cache";
	cacheLife("hours");
	return getHoursData();
};

export const HoursDemoFallback: FC = () => {
	return (
		<MessageBox variant="secondary">
			<MessageBoxTitle>hours プロファイル</MessageBoxTitle>
			<MessageBoxBody>
				<SkeletonLoading lines={2} className="space-y-2" />
			</MessageBoxBody>
		</MessageBox>
	);
};

export const HoursDemo: FC = async () => {
	const data = await getCachedHoursData();

	return (
		<MessageBox variant="secondary">
			<div className="flex items-center justify-between">
				<MessageBoxTitle>hours プロファイル</MessageBoxTitle>
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
