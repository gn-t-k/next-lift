import {
	DataFieldLabel,
	DataFieldList,
	DataFieldValue,
	DemoCard,
	DemoCardContent,
	DemoCardDescription,
	DemoCardHeader,
	DemoCardTitle,
	SkeletonLoading,
} from "@next-lift/react-components/demo";
import type { FC } from "react";
import type { CachedApiResponse } from "../api/cached/route";
import { RefreshButton } from "./refresh-button";

export const getCachedData = async (): Promise<CachedApiResponse> => {
	const response = await fetch(
		"http://localhost:3000/cache-demo/09-route-handlers/api/cached",
		{
			cache: "no-store", // Route Handler側でキャッシュ管理
		},
	);

	if (!response.ok) {
		throw new Error("Failed to fetch cached data");
	}

	return response.json();
};

export const CachedDataDisplaySkeleton: FC = () => {
	return <SkeletonLoading lines={3} className="space-y-4" />;
};

export const CachedDataDisplay: FC = async () => {
	const data = await getCachedData();

	return (
		<DemoCard>
			<DemoCardHeader>
				<DemoCardTitle>キャッシュあり（Route Handler）</DemoCardTitle>
				<DemoCardDescription>
					cacheLife + cacheTag を使用したRoute Handlerからのデータ取得
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<div className="space-y-4">
					<DataFieldList className="rounded-lg bg-secondary p-4">
						<DataFieldLabel>メッセージ</DataFieldLabel>
						<DataFieldValue className="text-sm text-muted-fg">
							{data.message}
						</DataFieldValue>
						<DataFieldLabel>タイムスタンプ</DataFieldLabel>
						<DataFieldValue className="font-mono text-sm text-muted-fg">
							{data.timestamp}
						</DataFieldValue>
						<DataFieldLabel>ランダム値</DataFieldLabel>
						<DataFieldValue className="font-mono text-sm text-muted-fg">
							{data.randomValue.toFixed(6)}
						</DataFieldValue>
					</DataFieldList>

					<div className="flex gap-2">
						<RefreshButton />
					</div>

					<div className="rounded-lg border border-border bg-muted p-4 text-sm">
						<p className="text-muted-fg">
							💡 「キャッシュを再検証」ボタンでrevalidateTag()を実行できます。
							タイムスタンプとランダム値が更新されます。
						</p>
					</div>
				</div>
			</DemoCardContent>
		</DemoCard>
	);
};
