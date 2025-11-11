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
	TimestampValue,
} from "@next-lift/react-components/demo";
import { cacheLife } from "next/cache";
import type { FC } from "react";
import { getPageData } from "../_queries/get-page-data";

const getPageDataCache = async () => {
	"use cache";
	cacheLife("seconds");

	return getPageData();
};

export const PageContentSkeleton: FC = () => {
	return (
		<DemoCard>
			<DemoCardHeader priority="C">
				<DemoCardTitle>ページコンテンツ（短いキャッシュ）</DemoCardTitle>
				<DemoCardDescription>
					cacheLife('seconds') - 頻繁に更新
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<div className="text-muted-fg">読み込み中...</div>
			</DemoCardContent>
		</DemoCard>
	);
};

export const PageContent: FC = async () => {
	const pageData = await getPageDataCache();

	return (
		<DemoCard>
			<DemoCardHeader priority="C">
				<DemoCardTitle>ページコンテンツ（短いキャッシュ）</DemoCardTitle>
				<DemoCardDescription>
					cacheLife('seconds') - 頻繁に更新
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<div className="space-y-3">
					<DataFieldList>
						<DataFieldLabel>コンテンツ</DataFieldLabel>
						<DataFieldValue>{pageData.content}</DataFieldValue>
						<DataFieldLabel>キャッシュ時刻</DataFieldLabel>
						<DataFieldValue>
							<TimestampValue dateTime={pageData.timestamp} />
						</DataFieldValue>
					</DataFieldList>
					<MessageBox variant="accent">
						<p>このコンテンツは1分ごとに更新されます。</p>
					</MessageBox>
				</div>
			</DemoCardContent>
		</DemoCard>
	);
};
