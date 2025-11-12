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
import Link from "next/link";
import type { FC } from "react";

const Page: FC<PageProps<"/cache-demo/07-static-params">> = (_props) => {
	return (
		<main className="space-y-8">
			<header className="space-y-2">
				<h1 className="font-bold text-3xl text-fg">
					07. generateStaticParams統合
				</h1>
				<p className="text-lg text-muted-fg">
					generateStaticParamsを使用した動的ルートの静的生成とビルド時の動作を示します。
				</p>
			</header>

			<MessageBox variant="muted">
				<MessageBoxTitle>概念</MessageBoxTitle>
				<MessageBoxBody>
					<p>
						<code className="rounded bg-accent px-2 py-1 font-mono">
							generateStaticParams
						</code>
						は、動的ルートセグメントと組み合わせて使用し、ビルド時に複数のページを静的生成します。
					</p>
					<p>
						Cache
						Componentsと組み合わせることで、効率的な静的生成とキャッシュ管理が可能になります。
					</p>
				</MessageBoxBody>
			</MessageBox>

			<div className="grid gap-6 md:grid-cols-2">
				<DemoCard>
					<DemoCardHeader priority="C">
						<DemoCardTitle>動的ルートの例</DemoCardTitle>
						<DemoCardDescription>
							generateStaticParamsで生成されたページ
						</DemoCardDescription>
					</DemoCardHeader>
					<DemoCardContent>
						<div className="space-y-3">
							<p className="text-muted-fg text-sm">
								以下のリンクは、generateStaticParamsで事前生成されたページです:
							</p>
							<div className="space-y-2">
								<Link
									href="/cache-demo/07-static-params/post/1"
									className="block rounded bg-primary px-4 py-2 text-center text-primary-fg transition-colors hover:bg-primary/90"
								>
									投稿 1 を見る
								</Link>
								<Link
									href="/cache-demo/07-static-params/post/2"
									className="block rounded bg-primary px-4 py-2 text-center text-primary-fg transition-colors hover:bg-primary/90"
								>
									投稿 2 を見る
								</Link>
								<Link
									href="/cache-demo/07-static-params/post/3"
									className="block rounded bg-primary px-4 py-2 text-center text-primary-fg transition-colors hover:bg-primary/90"
								>
									投稿 3 を見る
								</Link>
							</div>
						</div>
					</DemoCardContent>
				</DemoCard>

				<DemoCard>
					<DemoCardHeader priority="C">
						<DemoCardTitle>ビルド時の動作</DemoCardTitle>
						<DemoCardDescription>
							どのようにページが生成されるか
						</DemoCardDescription>
					</DemoCardHeader>
					<DemoCardContent>
						<div className="space-y-3">
							<MessageBox variant="accent">
								<strong>1. ビルド時</strong>
								<p className="mt-2">
									generateStaticParamsで指定したIDのページがすべて生成されます
								</p>
							</MessageBox>
							<MessageBox variant="accent">
								<strong>2. リクエスト時</strong>
								<p className="mt-2">
									事前生成されたページは即座に返されます（キャッシュから）
								</p>
							</MessageBox>
							<MessageBox variant="accent">
								<strong>3. 未生成のパス</strong>
								<p className="mt-2">
									dynamicParams設定により、オンデマンドで生成またはエラー
								</p>
							</MessageBox>
						</div>
					</DemoCardContent>
				</DemoCard>

				<DemoCard>
					<DemoCardHeader priority="C">
						<DemoCardTitle>キャッシュとの関係</DemoCardTitle>
						<DemoCardDescription>Cache Componentsとの連携</DemoCardDescription>
					</DemoCardHeader>
					<DemoCardContent>
						<div className="space-y-3 text-sm text-muted-fg">
							<p>
								<code className="rounded bg-accent px-2 py-1 font-mono">
									&quot;use cache&quot;
								</code>
								と組み合わせることで:
							</p>
							<ul className="list-inside list-disc space-y-1">
								<li>ビルド時にデータを取得してキャッシュ</li>
								<li>ページ全体が静的HTMLとして生成</li>
								<li>高速な配信が可能</li>
								<li>再検証も柔軟に設定可能</li>
							</ul>
						</div>
					</DemoCardContent>
				</DemoCard>

				<DemoCard>
					<DemoCardHeader priority="C">
						<DemoCardTitle>使用例</DemoCardTitle>
						<DemoCardDescription>実際の活用シーン</DemoCardDescription>
					</DemoCardHeader>
					<DemoCardContent>
						<div className="space-y-3">
							<MessageBox variant="accent">
								<strong>✅ 適している場合</strong>
								<ul className="mt-2 space-y-1">
									<li>• ブログ記事一覧</li>
									<li>• 商品カタログ</li>
									<li>• ドキュメントページ</li>
									<li>• 事前に知っているIDのページ</li>
								</ul>
							</MessageBox>
							<MessageBox variant="accent">
								<strong>❌ 不向きな場合</strong>
								<ul className="mt-2 space-y-1">
									<li>• ユーザーごとのダッシュボード</li>
									<li>• 動的に変わるコンテンツ</li>
									<li>• 無限に増え続けるID</li>
								</ul>
							</MessageBox>
						</div>
					</DemoCardContent>
				</DemoCard>
			</div>

			<MessageBox variant="muted">
				<MessageBoxTitle>試してみよう</MessageBoxTitle>
				<MessageBoxBody>
					<ol className="list-inside list-decimal space-y-2">
						<li>上のリンクから各投稿ページにアクセスしてください。</li>
						<li>
							ページの読み込みが非常に高速なことを確認してください（事前生成済み）。
						</li>
						<li>
							存在しないID（例:
							/post/999）にアクセスして、dynamicParamsの動作を確認してください。
						</li>
					</ol>
				</MessageBoxBody>
			</MessageBox>
		</main>
	);
};

export default Page;
