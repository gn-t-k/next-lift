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
import { cacheLife } from "next/cache";
import { cookies } from "next/headers";
import type { FC } from "react";

type UserGreetingData = {
	username: string;
	timestamp: string;
};

const getUserGreeting = async (): Promise<UserGreetingData> => {
	"use cache: private";
	cacheLife("minutes");

	const cookieStore = await cookies();
	const username = cookieStore.get("demo-username")?.value || "ゲスト";

	return {
		username,
		timestamp: new Date().toISOString(),
	};
};

export const UserGreetingDisplay: FC = async () => {
	const data = await getUserGreeting();

	return (
		<DemoCard>
			<DemoCardHeader priority="B">
				<DemoCardTitle>ユーザー情報（cookies）</DemoCardTitle>
				<DemoCardDescription>
					'use cache: private'でcookiesにアクセス
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<div className="space-y-3">
					<DataFieldList>
						<DataFieldLabel>ユーザー名</DataFieldLabel>
						<DataFieldValue className="text-xl text-muted-fg">
							{data.username}
						</DataFieldValue>
					</DataFieldList>
					<DataFieldList className="mt-4 border-border border-t pt-3">
						<DataFieldLabel>キャッシュ時刻</DataFieldLabel>
						<DataFieldValue>
							<TimestampValue dateTime={data.timestamp} />
						</DataFieldValue>
					</DataFieldList>
				</div>
			</DemoCardContent>
		</DemoCard>
	);
};

export const UserGreetingDisplayFallback: FC = () => {
	return (
		<DemoCard>
			<DemoCardHeader priority="B">
				<DemoCardTitle>ユーザー情報（cookies）</DemoCardTitle>
				<DemoCardDescription>
					'use cache: private'でcookiesにアクセス
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<SkeletonLoading lines={2} className="space-y-3" />
			</DemoCardContent>
		</DemoCard>
	);
};
