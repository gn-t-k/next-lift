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
import type { UncachedApiResponse } from "../api/uncached/route";

export const getUncachedData = async (): Promise<UncachedApiResponse> => {
	const response = await fetch(
		"http://localhost:3000/cache-demo/09-route-handlers/api/uncached",
		{
			cache: "no-store",
		},
	);

	if (!response.ok) {
		throw new Error("Failed to fetch uncached data");
	}

	return response.json();
};

export const UncachedDataDisplaySkeleton: FC = () => {
	return <SkeletonLoading lines={3} className="space-y-4" />;
};

export const UncachedDataDisplay: FC = async () => {
	const data = await getUncachedData();

	return (
		<DemoCard>
			<DemoCardHeader>
				<DemoCardTitle>キャッシュなし（Route Handler）</DemoCardTitle>
				<DemoCardDescription>
					キャッシュを使用しないRoute Handlerからのデータ取得
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

					<div className="rounded-lg border border-border bg-muted p-4 text-sm">
						<p className="text-muted-fg">
							💡
							ページをリロードするたびにタイムスタンプとランダム値が変わります。
						</p>
					</div>
				</div>
			</DemoCardContent>
		</DemoCard>
	);
};
