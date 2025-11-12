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
import { headers } from "next/headers";
import type { FC } from "react";

type DeviceInfoData = {
	deviceType: string;
	userAgent: string;
	timestamp: string;
};

const getDeviceInfo = async (): Promise<DeviceInfoData> => {
	"use cache: private";
	cacheLife("hours");

	const headersList = await headers();
	const userAgent = headersList.get("user-agent") || "";
	const isMobile = /mobile/i.test(userAgent);

	return {
		deviceType: isMobile ? "モバイル" : "デスクトップ",
		userAgent: `${userAgent.slice(0, 50)}...`,
		timestamp: new Date().toISOString(),
	};
};

export const DeviceInfoDisplay: FC = async () => {
	const data = await getDeviceInfo();

	return (
		<DemoCard>
			<DemoCardHeader priority="B">
				<DemoCardTitle>デバイス情報（headers）</DemoCardTitle>
				<DemoCardDescription>
					'use cache: private'でheadersにアクセス
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<div className="space-y-3">
					<DataFieldList>
						<DataFieldLabel>デバイスタイプ</DataFieldLabel>
						<DataFieldValue>{data.deviceType}</DataFieldValue>
						<DataFieldLabel>User-Agent</DataFieldLabel>
						<DataFieldValue className="font-mono text-xs text-muted-fg">
							{data.userAgent}
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

export const DeviceInfoDisplayFallback: FC = () => {
	return (
		<DemoCard>
			<DemoCardHeader priority="B">
				<DemoCardTitle>デバイス情報（headers）</DemoCardTitle>
				<DemoCardDescription>
					'use cache: private'でheadersにアクセス
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<SkeletonLoading lines={3} className="space-y-3" />
			</DemoCardContent>
		</DemoCard>
	);
};
