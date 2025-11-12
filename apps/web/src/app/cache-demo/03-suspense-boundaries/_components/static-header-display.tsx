import {
	DataFieldLabel,
	DataFieldList,
	DataFieldValue,
	MessageBox,
	MessageBoxBody,
	MessageBoxTitle,
	StatusBadge,
	TimestampValue,
} from "@next-lift/react-components/demo";
import type { FC } from "react";
import { getStaticHeader } from "../_queries/get-static-header";

const getCachedHeader = async () => {
	"use cache";
	return getStaticHeader();
};

export const StaticHeaderDisplay: FC = async () => {
	const header = await getCachedHeader();

	return (
		<MessageBox variant="success">
			<div className="flex items-center justify-between">
				<MessageBoxTitle>静的シェル（即座に表示）</MessageBoxTitle>
				<StatusBadge status="HIT" timestamp={header.cachedAt} />
			</div>
			<MessageBoxBody>
				<h2 className="text-xl font-bold">{header.title}</h2>
				<p>{header.description}</p>
				<DataFieldList className="mt-4 border-border border-t pt-3">
					<DataFieldLabel>キャッシュ時刻</DataFieldLabel>
					<DataFieldValue>
						<TimestampValue dateTime={header.cachedAt} />
					</DataFieldValue>
				</DataFieldList>
			</MessageBoxBody>
		</MessageBox>
	);
};
