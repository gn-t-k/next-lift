import {
	DemoCard,
	DemoCardContent,
	DemoCardDescription,
	DemoCardHeader,
	DemoCardTitle,
} from "@next-lift/react-components/demo";
import Link from "next/link";
import { type FC, Suspense } from "react";
import {
	PostContent,
	PostContentSkeleton,
} from "../../_components/post-content";

// ビルド時に生成するIDを指定
export const generateStaticParams = () => {
	return [{ id: "1" }, { id: "2" }, { id: "3" }];
};

const Page: FC<PageProps<"/cache-demo/07-static-params/post/[id]">> = async (
	props,
) => {
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

			{/* 投稿内容カード（Suspense境界を絞る） */}
			<DemoCard>
				<DemoCardHeader priority="C">
					<DemoCardTitle>投稿内容</DemoCardTitle>
					<DemoCardDescription>
						この投稿は
						{id === "1" || id === "2" || id === "3"
							? "generateStaticParamsで事前生成"
							: "オンデマンド生成"}
						されました
					</DemoCardDescription>
				</DemoCardHeader>
				<DemoCardContent>
					<Suspense fallback={<PostContentSkeleton />}>
						<PostContent id={id} />
					</Suspense>
				</DemoCardContent>
			</DemoCard>

			{/* このページの情報カード（静的） */}
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
