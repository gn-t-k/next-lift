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

const getCachedPostsData = async () => {
	"use cache";
	cacheTag("posts");
	return getPostsData();
};

export const PostsDisplayFallback: FC = () => {
	return (
		<DemoCard>
			<DemoCardHeader priority="B">
				<DemoCardTitle>投稿リスト</DemoCardTitle>
				<DemoCardDescription>
					cacheTag("posts")でタグ付けされたデータ
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<SkeletonLoading lines={3} className="space-y-3" />
			</DemoCardContent>
		</DemoCard>
	);
};

export const PostsDisplay: FC = async () => {
	const { data, timestamp } = await getCachedPostsData();

	return (
		<DemoCard>
			<DemoCardHeader priority="B">
				<DemoCardTitle>投稿リスト</DemoCardTitle>
				<DemoCardDescription>
					cacheTag("posts")でタグ付けされたデータ
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<div>
					<ul className="space-y-3">
						{data.map((post) => (
							<li
								key={post.id}
								className="border-b border-border pb-3 last:border-0"
							>
								<div className="text-sm font-medium text-fg">{post.title}</div>
								<div className="text-sm text-muted-fg">{post.content}</div>
							</li>
						))}
					</ul>
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
