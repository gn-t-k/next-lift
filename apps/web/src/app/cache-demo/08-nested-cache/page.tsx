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
import { LongCacheDisplay } from "./_components/long-cache-display";
import { MediumCacheDisplay } from "./_components/medium-cache-display";
import { ShortCacheDisplay } from "./_components/short-cache-display";

const Page: FC = async () => {
	return (
		<main className="space-y-8">
			<header className="space-y-2">
				<h1 className="font-bold text-3xl text-fg">08. ネストしたキャッシュ</h1>
				<p className="text-lg text-muted-fg">
					異なるcacheLifeを持つコンポーネントのネスト動作を示します。
				</p>
			</header>

			<MessageBox variant="muted">
				<MessageBoxTitle>概念</MessageBoxTitle>
				<MessageBoxBody>
					<p>
						<code className="rounded bg-accent px-2 py-1 font-mono">
							&quot;use cache&quot;
						</code>
						を使った関数は、他のキャッシュされた関数を呼び出すことができます。
					</p>
					<p>
						各関数は独自の
						<code className="rounded bg-accent px-2 py-1 font-mono">
							cacheLife
						</code>
						を持つことができ、それぞれ独立してキャッシュされます。
					</p>
					<p>
						親のキャッシュが有効でも、子のキャッシュが期限切れの場合、子だけが再取得されます。
					</p>
				</MessageBoxBody>
			</MessageBox>

			<div className="grid gap-6 md:grid-cols-2">
				<ShortCacheDisplay />
				<MediumCacheDisplay />

				<div className="md:col-span-2">
					<LongCacheDisplay />
				</div>

				<DemoCard>
					<DemoCardHeader priority="C">
						<DemoCardTitle>ネストの動作</DemoCardTitle>
						<DemoCardDescription>キャッシュの階層構造</DemoCardDescription>
					</DemoCardHeader>
					<DemoCardContent>
						<div className="space-y-3">
							<MessageBox variant="accent">
								<strong>独立したキャッシュ</strong>
								<p className="mt-2">
									各関数は独自のキャッシュキーとcacheLifeを持ちます
								</p>
							</MessageBox>
							<MessageBox variant="accent">
								<strong>効率的な再検証</strong>
								<p className="mt-2">期限切れのキャッシュだけが再取得されます</p>
							</MessageBox>
							<MessageBox variant="accent">
								<strong>柔軟な設計</strong>
								<p className="mt-2">
									データの更新頻度に応じて最適なcacheLifeを設定できます
								</p>
							</MessageBox>
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
								<strong>ユーザー情報 + 投稿</strong>
								<p className="mt-2">
									ユーザー情報（長いキャッシュ）と投稿一覧（短いキャッシュ）を組み合わせる
								</p>
							</MessageBox>
							<MessageBox variant="accent">
								<strong>商品 + 在庫</strong>
								<p className="mt-2">
									商品情報（長いキャッシュ）と在庫数（短いキャッシュ）を組み合わせる
								</p>
							</MessageBox>
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
							ページをリロードして、異なるcacheLifeによってキャッシュの有効期間が異なることを確認してください。
						</li>
						<li>
							長いキャッシュのカードには、ネストされたデータが含まれていることを確認してください。
						</li>
						<li>
							1分後にリロードして、短いキャッシュだけが更新されることを確認してください。
						</li>
					</ol>
				</MessageBoxBody>
			</MessageBox>
		</main>
	);
};

export default Page;
