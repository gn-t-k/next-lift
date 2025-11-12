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
	TimestampValue,
} from "@next-lift/react-components/demo";
import { cacheTag } from "next/cache";
import type { FC } from "react";
import { getPostsData } from "../_queries/get-posts-data";
import { getUserData } from "../_queries/get-user-data";

const getCachedCombinedData = async () => {
	"use cache";
	cacheTag("user", "posts");

	const [userData, postsData] = await Promise.all([
		getUserData(),
		getPostsData(),
	]);

	return {
		userData,
		postsData,
		timestamp: new Date().toISOString(),
	};
};

export const CombinedDisplayFallback: FC = () => {
	return (
		<DemoCard>
			<DemoCardHeader priority="B">
				<DemoCardTitle>複合データ</DemoCardTitle>
				<DemoCardDescription>
					cacheTag("user", "posts")で両方のタグが付けられたデータ
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<SkeletonLoading lines={2} className="space-y-4" />
			</DemoCardContent>
		</DemoCard>
	);
};

export const CombinedDisplay: FC = async () => {
	const { userData, postsData, timestamp } = await getCachedCombinedData();

	return (
		<DemoCard>
			<DemoCardHeader priority="B">
				<DemoCardTitle>複合データ</DemoCardTitle>
				<DemoCardDescription>
					cacheTag("user", "posts")で両方のタグが付けられたデータ
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<div className="space-y-3">
					<DataFieldList>
						<DataFieldLabel>ユーザー</DataFieldLabel>
						<DataFieldValue>{userData.data.name}</DataFieldValue>
						<DataFieldLabel>投稿数</DataFieldLabel>
						<DataFieldValue>{postsData.data.length}件</DataFieldValue>
					</DataFieldList>
					<DataFieldList className="mt-4 border-border border-t pt-3">
						<DataFieldLabel>複合データのキャッシュ時刻</DataFieldLabel>
						<DataFieldValue>
							<TimestampValue dateTime={timestamp} />
						</DataFieldValue>
					</DataFieldList>
				</div>
			</DemoCardContent>
		</DemoCard>
	);
};
