import {
	DataFieldLabel,
	DataFieldList,
	DataFieldValue,
	DemoCard,
	DemoCardContent,
	DemoCardDescription,
	DemoCardHeader,
	DemoCardTitle,
	TimestampValue,
} from "@next-lift/react-components/demo";
import { cacheLife } from "next/cache";
import type { FC } from "react";
import { getSlotData } from "../_queries/get-slot-data";

const getSlotDataCache = async (slotName: string) => {
	"use cache";
	cacheLife("minutes");

	return getSlotData(slotName);
};

type Props = {
	slotName: string;
};

export const SlotContentSkeleton: FC<Props> = ({ slotName }) => {
	return (
		<DemoCard>
			<DemoCardHeader priority="C">
				<DemoCardTitle>{slotName}（中程度のキャッシュ）</DemoCardTitle>
				<DemoCardDescription>
					cacheLife('minutes') - 適度に更新
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<div className="text-muted-fg">読み込み中...</div>
			</DemoCardContent>
		</DemoCard>
	);
};

export const SlotContent: FC<Props> = async ({ slotName }) => {
	const slotData = await getSlotDataCache(slotName);

	return (
		<DemoCard>
			<DemoCardHeader priority="C">
				<DemoCardTitle>{slotName}（中程度のキャッシュ）</DemoCardTitle>
				<DemoCardDescription>
					cacheLife('minutes') - 適度に更新
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<DataFieldList>
					<DataFieldLabel>データ</DataFieldLabel>
					<DataFieldValue>{slotData.data}</DataFieldValue>
					<DataFieldLabel>キャッシュ時刻</DataFieldLabel>
					<DataFieldValue>
						<TimestampValue dateTime={slotData.timestamp} />
					</DataFieldValue>
				</DataFieldList>
			</DemoCardContent>
		</DemoCard>
	);
};
