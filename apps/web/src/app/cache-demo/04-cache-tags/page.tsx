import {
	DemoCard,
	DemoCardContent,
	DemoCardDescription,
	DemoCardHeader,
	DemoCardTitle,
	MessageBox,
	MessageBoxBody,
	MessageBoxTitle,
} from "@next-lift/react-components/demo";
import type { FC } from "react";
import { Suspense } from "react";
import {
	CombinedDisplay,
	CombinedDisplayFallback,
} from "./_components/combined-display";
import {
	PostsDisplay,
	PostsDisplayFallback,
} from "./_components/posts-display";
import { RevalidateAllButton } from "./_components/revalidate-all-button";
import { RevalidatePostsButton } from "./_components/revalidate-posts-button";
import { RevalidateUserButton } from "./_components/revalidate-user-button";
import { UserDisplay, UserDisplayFallback } from "./_components/user-display";

const Page: FC<PageProps<"/cache-demo/04-cache-tags">> = async (_props) => {
	return (
		<main className="space-y-8">
			<header className="space-y-2">
				<h1 className="font-bold text-3xl text-fg">04. cacheTag()再検証</h1>
				<p className="text-lg text-muted-fg">
					cacheTag()を使用してキャッシュにタグを付け、revalidateTag()で特定のタグのキャッシュを再検証する方法を示します。
				</p>
			</header>

			<MessageBox variant="muted">
				<MessageBoxTitle>概念</MessageBoxTitle>
				<MessageBoxBody>
					<p>
						<code className="rounded bg-accent px-2 py-1 font-mono">
							cacheTag()
						</code>
						を使用すると、キャッシュされた関数に1つ以上のタグを付けることができます。
					</p>
					<p>
						タグを付けることで、
						<code className="rounded bg-accent px-2 py-1 font-mono">
							revalidateTag()
						</code>
						を使って特定のタグが付いたキャッシュだけを選択的に再検証できます。
					</p>
					<p>
						複数のタグを持つキャッシュは、いずれかのタグが再検証されると無効化されます。
					</p>
				</MessageBoxBody>
			</MessageBox>

			<div className="grid gap-6 md:grid-cols-2">
				<Suspense fallback={<UserDisplayFallback />}>
					<UserDisplay />
				</Suspense>

				<Suspense fallback={<PostsDisplayFallback />}>
					<PostsDisplay />
				</Suspense>

				<Suspense fallback={<CombinedDisplayFallback />}>
					<CombinedDisplay />
				</Suspense>

				<DemoCard>
					<DemoCardHeader priority="B">
						<DemoCardTitle>再検証コントロール</DemoCardTitle>
						<DemoCardDescription>
							各タグまたは全タグを再検証できます
						</DemoCardDescription>
					</DemoCardHeader>
					<DemoCardContent>
						<div className="space-y-3">
							<RevalidateUserButton />
							<RevalidatePostsButton />
							<RevalidateAllButton />
						</div>
					</DemoCardContent>
				</DemoCard>
			</div>

			<MessageBox variant="muted">
				<MessageBoxTitle>試してみよう</MessageBoxTitle>
				<MessageBoxBody>
					<ol className="list-inside list-decimal space-y-2">
						<li>各カードのキャッシュ時刻を確認してください。</li>
						<li>
							"user"タグを再検証ボタンをクリックし、ユーザー情報と複合データが更新されることを確認してください。
						</li>
						<li>
							"posts"タグを再検証ボタンをクリックし、投稿リストと複合データが更新されることを確認してください。
						</li>
						<li>
							複合データは両方のタグを持つため、どちらのタグが再検証されても更新されます。
						</li>
					</ol>
				</MessageBoxBody>
			</MessageBox>
		</main>
	);
};

export default Page;
