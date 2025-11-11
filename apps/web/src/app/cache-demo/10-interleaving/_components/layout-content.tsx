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
import { getLayoutData } from "../_queries/get-layout-data";

const getLayoutDataCache = async () => {
	"use cache";
	cacheLife("hours");

	return getLayoutData();
};

export const LayoutContent: FC = async () => {
	const layoutData = await getLayoutDataCache();

	return (
		<DemoCard>
			<DemoCardHeader priority="C">
				<DemoCardTitle>共通レイアウト（長いキャッシュ）</DemoCardTitle>
				<DemoCardDescription>
					cacheLife('hours') - 全ページで共有
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<div className="space-y-3">
					<DataFieldList>
						<DataFieldLabel>タイトル</DataFieldLabel>
						<DataFieldValue>{layoutData.title}</DataFieldValue>
						<DataFieldLabel>キャッシュ時刻</DataFieldLabel>
						<DataFieldValue>
							<TimestampValue dateTime={layoutData.timestamp} />
						</DataFieldValue>
					</DataFieldList>
					<div className="rounded bg-accent p-3 text-sm text-muted-fg">
						<p>
							このレイアウトは1時間キャッシュされ、すべてのページで共有されます。
						</p>
					</div>
				</div>
			</DemoCardContent>
		</DemoCard>
	);
};
