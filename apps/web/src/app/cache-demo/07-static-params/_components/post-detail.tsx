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
import type { FC } from "react";
import { getPost } from "../_queries/get-post";

type Props = {
	id: string;
};

export const PostDetailSkeleton: FC = () => {
	return (
		<div className="space-y-8">
			<div className="h-64 animate-pulse rounded-lg bg-accent" />
			<div className="h-48 animate-pulse rounded-lg bg-accent" />
		</div>
	);
};

export const PostDetail: FC<Props> = async ({ id }) => {
	const post = await getPost(id);

	return (
		<div className="space-y-8">
			<DemoCard>
				<DemoCardHeader priority="C">
					<DemoCardTitle>投稿内容</DemoCardTitle>
					<DemoCardDescription>
						この投稿は{" "}
						{id === "1" || id === "2" || id === "3"
							? "generateStaticParamsで事前生成"
							: "オンデマンド生成"}{" "}
						されました
					</DemoCardDescription>
				</DemoCardHeader>
				<DemoCardContent>
					<div className="space-y-4">
						<div>
							<h2 className="font-bold text-fg text-xl">{post.title}</h2>
							<p className="mt-1 text-muted-fg text-sm">著者: {post.author}</p>
						</div>
						<p className="text-fg">{post.content}</p>
						<DataFieldList className="border-border border-t pt-4">
							<DataFieldLabel>キャッシュ時刻</DataFieldLabel>
							<DataFieldValue>
								<TimestampValue dateTime={post.timestamp} />
							</DataFieldValue>
						</DataFieldList>
					</div>
				</DemoCardContent>
			</DemoCard>

			<DemoCard>
				<DemoCardHeader priority="C">
					<DemoCardTitle>このページの情報</DemoCardTitle>
					<DemoCardDescription>ビルドとキャッシュの詳細</DemoCardDescription>
				</DemoCardHeader>
				<DemoCardContent>
					<div className="space-y-3 text-sm text-muted-fg">
						<div className="rounded bg-accent p-3">
							<strong className="text-fg">生成タイミング</strong>
							<p className="mt-2">
								{id === "1" || id === "2" || id === "3"
									? "ビルド時に事前生成されました（generateStaticParams）"
									: "リクエスト時にオンデマンドで生成されました"}
							</p>
						</div>
						<div className="rounded bg-accent p-3">
							<strong className="text-fg">キャッシュ戦略</strong>
							<p className="mt-2">
								cacheLife(&quot;hours&quot;) -
								5分間stale、1時間revalidate、1日expire
							</p>
						</div>
						<div className="rounded bg-accent p-3">
							<strong className="text-fg">パフォーマンス</strong>
							<p className="mt-2">
								事前生成されたページは即座に配信され、非常に高速です
							</p>
						</div>
					</div>
				</DemoCardContent>
			</DemoCard>
		</div>
	);
};
