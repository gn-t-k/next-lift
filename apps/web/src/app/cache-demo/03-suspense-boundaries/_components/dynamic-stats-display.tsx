import {
	MessageBox,
	MessageBoxBody,
	MessageBoxTitle,
	SkeletonLoading,
	StatusBadge,
} from "@next-lift/react-components/demo";
import { type FC, Suspense } from "react";
import { getDynamicStats } from "../_queries/get-dynamic-stats";

export const DynamicStatsDisplay: FC = () => {
	return (
		<MessageBox variant="info">
			<MessageBoxTitle>動的コンテンツ（ストリーミング）</MessageBoxTitle>
			<MessageBoxBody>
				<Suspense fallback={<Skeleton />}>
					<DynamicStats />
				</Suspense>
			</MessageBoxBody>
		</MessageBox>
	);
};

const Skeleton: FC = () => {
	return <SkeletonLoading lines={2} className="space-y-3" />;
};

const DynamicStats: FC = async () => {
	const stats = await getDynamicStats();

	return (
		<div className="space-y-3">
			<StatusBadge status="MISS" timestamp={stats.timestamp} />
			<div className="grid grid-cols-2 gap-4">
				<div className="rounded bg-white p-3 dark:bg-gray-800">
					<p className="text-xs text-muted-fg">アクティブユーザー</p>
					<p className="text-2xl font-bold text-fg">{stats.activeUsers}</p>
				</div>
				<div className="rounded bg-white p-3 dark:bg-gray-800">
					<p className="text-xs text-muted-fg">今日のワークアウト</p>
					<p className="text-2xl font-bold text-fg">{stats.todayWorkouts}</p>
				</div>
			</div>
			<p className="font-mono text-xs text-muted-fg">
				取得時刻: {stats.timestamp}
			</p>
		</div>
	);
};
