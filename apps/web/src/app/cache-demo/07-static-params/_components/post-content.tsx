import {
	DataFieldLabel,
	DataFieldList,
	DataFieldValue,
	TimestampValue,
} from "@next-lift/react-components/demo";
import { cacheLife } from "next/cache";
import type { FC } from "react";
import { getPost } from "../_queries/get-post";

const getCachedPost: typeof getPost = async (id) => {
	"use cache";
	cacheLife("hours"); // 5分stale, 1時間revalidate, 1日expire

	return getPost(id);
};

export const PostContentSkeleton: FC = () => {
	return (
		<div className="space-y-4 animate-pulse">
			<div className="h-16 rounded bg-accent" />
			<div className="h-24 rounded bg-accent" />
			<div className="mt-4 h-12 rounded border-border border-t bg-accent pt-4" />
		</div>
	);
};

type Props = {
	id: string;
};

export const PostContent: FC<Props> = async ({ id }) => {
	const post = await getCachedPost(id);

	return (
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
	);
};
