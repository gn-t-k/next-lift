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
import { getUserData } from "../_queries/get-user-data";

const getCachedUserData = async () => {
	"use cache";
	cacheTag("user");
	return getUserData();
};

export const UserDisplayFallback: FC = () => {
	return (
		<DemoCard>
			<DemoCardHeader priority="B">
				<DemoCardTitle>ユーザー情報</DemoCardTitle>
				<DemoCardDescription>
					cacheTag("user")でタグ付けされたデータ
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<SkeletonLoading lines={2} className="space-y-3" />
			</DemoCardContent>
		</DemoCard>
	);
};

export const UserDisplay: FC = async () => {
	const { data, timestamp } = await getCachedUserData();

	return (
		<DemoCard>
			<DemoCardHeader priority="B">
				<DemoCardTitle>ユーザー情報</DemoCardTitle>
				<DemoCardDescription>
					cacheTag("user")でタグ付けされたデータ
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<div className="space-y-3">
					<DataFieldList>
						<DataFieldLabel>名前</DataFieldLabel>
						<DataFieldValue>{data.name}</DataFieldValue>
						<DataFieldLabel>メールアドレス</DataFieldLabel>
						<DataFieldValue>{data.email}</DataFieldValue>
					</DataFieldList>
					<DataFieldList className="mt-4 border-border border-t pt-3">
						<DataFieldLabel>キャッシュ時刻</DataFieldLabel>
						<DataFieldValue>
							<TimestampValue dateTime={timestamp.toString()} />
						</DataFieldValue>
					</DataFieldList>
				</div>
			</DemoCardContent>
		</DemoCard>
	);
};
