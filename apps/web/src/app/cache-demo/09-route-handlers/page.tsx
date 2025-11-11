import {
	CodeBlock,
	DemoCard,
	DemoCardContent,
	DemoCardDescription,
	DemoCardHeader,
	DemoCardTitle,
	MessageBox,
	MessageBoxBody,
	MessageBoxTitle,
} from "@next-lift/react-components/demo";
import Link from "next/link";
import type { FC } from "react";
import { Suspense } from "react";
import {
	CachedDataDisplay,
	CachedDataDisplaySkeleton,
} from "./_components/cached-data-display";
import {
	UncachedDataDisplay,
	UncachedDataDisplaySkeleton,
} from "./_components/uncached-data-display";

const Page: FC = () => {
	return (
		<main className="space-y-8">
			<header className="space-y-2">
				<Link
					href="/cache-demo"
					className="inline-block text-primary hover:underline"
				>
					← デモ一覧に戻る
				</Link>
				<h1 className="font-bold text-3xl text-fg">
					09. Route Handlersのキャッシュ
				</h1>
				<p className="text-lg text-muted-fg">
					GET Route HandlersでのCache Components動作を示します。
				</p>
			</header>

			<MessageBox variant="muted">
				<MessageBoxTitle>概念</MessageBoxTitle>
				<MessageBoxBody>
					<p>
						Route HandlersでもCache Componentsを使用できます。GET
						メソッドのRoute Handlerで
						<code className="rounded bg-accent px-2 py-1 font-mono">
							&quot;use cache&quot;
						</code>
						を使うことで、レスポンスをキャッシュできます。
					</p>
					<p>
						これにより、APIエンドポイントのレスポンスを効率的にキャッシュし、パフォーマンスを向上させることができます。
					</p>
				</MessageBoxBody>
			</MessageBox>

			<div className="grid gap-6 md:grid-cols-2">
				<Suspense fallback={<CachedDataDisplaySkeleton />}>
					<CachedDataDisplay />
				</Suspense>

				<Suspense fallback={<UncachedDataDisplaySkeleton />}>
					<UncachedDataDisplay />
				</Suspense>

				<DemoCard>
					<DemoCardHeader>
						<DemoCardTitle>Route Handlersでのキャッシュ</DemoCardTitle>
						<DemoCardDescription>実装方法と注意点</DemoCardDescription>
					</DemoCardHeader>
					<DemoCardContent>
						<div className="space-y-3">
							<MessageBox variant="accent">
								<MessageBoxBody>
									<strong>実装方法</strong>
									<CodeBlock
										code={`const getData = async () => {
  "use cache";
  cacheLife("minutes");
  cacheTag("my-data");
  return { data: "..." };
};

export const GET = async () => {
  const data = await getData();
  return Response.json(data);
};`}
										className="mt-2"
									/>
								</MessageBoxBody>
							</MessageBox>
							<MessageBox variant="accent">
								<MessageBoxBody>
									<strong>注意点</strong>
									<ul className="mt-2 space-y-1">
										<li>• GETメソッドでのみ使用可能</li>
										<li>• POSTなど他のメソッドではキャッシュされない</li>
										<li>• cacheLifeで適切な期間を設定する</li>
										<li>• cacheTagで手動再検証が可能</li>
									</ul>
								</MessageBoxBody>
							</MessageBox>
						</div>
					</DemoCardContent>
				</DemoCard>

				<DemoCard>
					<DemoCardHeader>
						<DemoCardTitle>使用例</DemoCardTitle>
						<DemoCardDescription>実際の活用シーン</DemoCardDescription>
					</DemoCardHeader>
					<DemoCardContent>
						<div className="space-y-3">
							<MessageBox variant="success">
								<MessageBoxBody>
									<strong>✅ 適している場合</strong>
									<ul className="mt-2 space-y-1">
										<li>• 外部APIからのデータ取得</li>
										<li>• データベースクエリ結果</li>
										<li>• 計算コストの高い処理</li>
										<li>• 更新頻度が低いデータ</li>
									</ul>
								</MessageBoxBody>
							</MessageBox>
							<MessageBox variant="warning">
								<MessageBoxBody>
									<strong>❌ 不向きな場合</strong>
									<ul className="mt-2 space-y-1">
										<li>• リアルタイムデータ</li>
										<li>• ユーザーごとに異なるデータ</li>
										<li>• POST/PUT/DELETEメソッド</li>
									</ul>
								</MessageBoxBody>
							</MessageBox>
						</div>
					</DemoCardContent>
				</DemoCard>
			</div>

			<MessageBox variant="muted">
				<MessageBoxTitle>試してみよう</MessageBoxTitle>
				<MessageBoxBody>
					<ol className="list-inside list-decimal space-y-2">
						<li>各データの初期値を確認してください。</li>
						<li>
							キャッシュありの「キャッシュを再検証」ボタンを押して、revalidateTag()の動作を確認してください。
						</li>
						<li>
							ページをリロードして、キャッシュなしのデータだけが変わることを確認してください。
						</li>
						<li>
							1分以上待ってからページをリロードして、キャッシュありのデータも更新されることを確認してください（cacheLifeの効果）。
						</li>
					</ol>
				</MessageBoxBody>
			</MessageBox>
		</main>
	);
};

export default Page;
