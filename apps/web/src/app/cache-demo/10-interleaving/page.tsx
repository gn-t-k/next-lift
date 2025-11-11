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
import { Suspense } from "react";
import { PageContent, PageContentSkeleton } from "./_components/page-content";
import { SlotContent, SlotContentSkeleton } from "./_components/slot-content";

const Page: FC = () => {
	return (
		<main className="space-y-8">
			<header className="space-y-2">
				<h1 className="font-bold text-3xl text-fg">10. Interleavingパターン</h1>
				<p className="text-lg text-muted-fg">
					children/slotsを使った柔軟なキャッシュ構成を示します。
				</p>
			</header>

			<MessageBox variant="muted">
				<MessageBoxTitle>概念</MessageBoxTitle>
				<MessageBoxBody>
					<p>
						Interleavingパターンでは、異なるcacheLifeを持つコンポーネントを組み合わせて、柔軟なキャッシュ構成を実現します。
					</p>
					<p>
						レイアウト、ページ、スロットがそれぞれ独立したキャッシュを持ち、更新頻度に応じて最適化できます。
					</p>
				</MessageBoxBody>
			</MessageBox>

			<div className="grid gap-6 md:grid-cols-2">
				<Suspense fallback={<PageContentSkeleton />}>
					<PageContent />
				</Suspense>

				<Suspense fallback={<SlotContentSkeleton slotName="サイドバー" />}>
					<SlotContent slotName="サイドバー" />
				</Suspense>

				<DemoCard>
					<DemoCardHeader priority="C">
						<DemoCardTitle>Interleavingの利点</DemoCardTitle>
						<DemoCardDescription>柔軟なキャッシュ戦略</DemoCardDescription>
					</DemoCardHeader>
					<DemoCardContent>
						<div className="space-y-3">
							<MessageBox variant="accent">
								<strong>独立したキャッシュ</strong>
								<p className="mt-2">
									各コンポーネントが独自のcacheLifeを持ち、それぞれ最適化できます
								</p>
							</MessageBox>
							<MessageBox variant="accent">
								<strong>効率的な再検証</strong>
								<p className="mt-2">
									期限切れのコンポーネントだけが再取得されます
								</p>
							</MessageBox>
							<MessageBox variant="accent">
								<strong>パフォーマンス向上</strong>
								<p className="mt-2">
									不要な再計算を避け、高速なレスポンスを実現
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
								<strong>ダッシュボード</strong>
								<p className="mt-2">
									共通ヘッダー（長）+ メインコンテンツ（短）+ サイドバー（中）
								</p>
							</MessageBox>
							<MessageBox variant="accent">
								<strong>ECサイト</strong>
								<p className="mt-2">
									商品情報（長）+ 在庫数（短）+ レコメンド（中）
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
						<li>各コンポーネントのキャッシュ時刻を確認してください。</li>
						<li>
							ページをリロードして、レイアウトのキャッシュ時刻が変わらないことを確認してください。
						</li>
						<li>
							1分後にリロードして、ページコンテンツだけが更新されることを確認してください。
						</li>
						<li>
							<Link
								href="/cache-demo/10-interleaving/sub"
								className="text-primary hover:underline"
							>
								サブページ
							</Link>
							に移動して、レイアウトが共有されることを確認してください。
						</li>
					</ol>
				</MessageBoxBody>
			</MessageBox>
		</main>
	);
};

export default Page;
