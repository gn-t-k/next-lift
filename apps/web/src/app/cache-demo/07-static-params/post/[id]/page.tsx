import Link from "next/link";
import { type FC, Suspense } from "react";
import { PostDetail, PostDetailSkeleton } from "../../_components/post-detail";

// ビルド時に生成するIDを指定
export const generateStaticParams = () => {
	return [{ id: "1" }, { id: "2" }, { id: "3" }];
};

const Page: FC<PageProps<"/cache-demo/07-static-params/post/[id]">> = async (props) => {
	const params = await props.params;
	const { id } = params;

	return (
		<div className="space-y-8">
			{/* データ不要部分：即座に表示 */}
			<div>
				<Link
					href="/cache-demo/07-static-params"
					className="text-primary hover:underline"
				>
					← 戻る
				</Link>
				<h1 className="mt-4 font-bold text-3xl text-fg">投稿詳細</h1>
				<p className="mt-2 text-muted-fg">投稿ID: {id}</p>
			</div>

			{/* データ必要部分：Suspense境界で分離 */}
			<Suspense fallback={<PostDetailSkeleton />}>
				<PostDetail id={id} />
			</Suspense>

			{/* データ不要部分：即座に表示 */}
			<div className="rounded-lg border border-border bg-muted p-6">
				<h2 className="font-semibold text-fg text-xl">他の投稿</h2>
				<div className="mt-4 flex gap-3">
					<Link
						href="/cache-demo/07-static-params/post/1"
						className="rounded bg-primary px-4 py-2 text-primary-fg transition-colors hover:bg-primary/90"
					>
						投稿 1
					</Link>
					<Link
						href="/cache-demo/07-static-params/post/2"
						className="rounded bg-primary px-4 py-2 text-primary-fg transition-colors hover:bg-primary/90"
					>
						投稿 2
					</Link>
					<Link
						href="/cache-demo/07-static-params/post/3"
						className="rounded bg-primary px-4 py-2 text-primary-fg transition-colors hover:bg-primary/90"
					>
						投稿 3
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Page;
