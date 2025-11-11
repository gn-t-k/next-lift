import {
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
import { getSubPageData } from "../_queries/get-sub-page-data";

const getSubPageDataCache = async () => {
	"use cache";
	cacheLife("seconds");

	return getSubPageData();
};

export const SubPageContentSkeleton: FC = () => {
	return (
		<DemoCard>
			<DemoCardHeader priority="C">
				<DemoCardTitle>サブページコンテンツ</DemoCardTitle>
				<DemoCardDescription>レイアウトは共有されています</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<div className="text-muted-fg">読み込み中...</div>
			</DemoCardContent>
		</DemoCard>
	);
};

export const SubPageContent: FC = async () => {
	const data = await getSubPageDataCache();

	return (
		<DemoCard>
			<DemoCardHeader priority="C">
				<DemoCardTitle>サブページコンテンツ</DemoCardTitle>
				<DemoCardDescription>レイアウトは共有されています</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<div className="space-y-3">
					<div>
						<div className="font-medium text-fg text-sm">コンテンツ</div>
						<div className="text-muted-fg">{data.content}</div>
					</div>
					<div className="mt-4 border-border border-t pt-3">
						<div className="font-medium text-fg text-sm">キャッシュ時刻</div>
						<TimestampValue
							dateTime={data.timestamp}
							className="text-muted-fg"
						/>
					</div>
					<MessageBox variant="accent">
						<p>
							上の共通レイアウトは、メインページと同じキャッシュが使われています。
						</p>
					</MessageBox>
				</div>
			</DemoCardContent>
		</DemoCard>
	);
};
