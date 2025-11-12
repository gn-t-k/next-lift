import {
	DemoCard,
	DemoCardContent,
	DemoCardDescription,
	DemoCardHeader,
	DemoCardTitle,
} from "@next-lift/react-components/demo";
import { Link } from "@next-lift/react-components/ui";
import type { Route } from "next";
import type { FC } from "react";

type DemoItem = {
	id: string;
	title: string;
	description: string;
	priority: "A" | "B" | "C";
	href: Route;
	status: "完了" | "実装中" | "未実装";
};

const demos: DemoItem[] = [
	{
		id: "01",
		title: "基本的な use cache",
		description:
			"ファイルレベル、コンポーネントレベル、関数レベルのキャッシュ動作を確認",
		priority: "A",
		href: "/cache-demo/01-basic-use-cache",
		status: "未実装",
	},
	{
		id: "02",
		title: "cacheLife() プロファイル",
		description: "プリセットとカスタムプロファイルによる再検証タイミングの制御",
		priority: "A",
		href: "/cache-demo/02-cache-life",
		status: "未実装",
	},
	{
		id: "03",
		title: "Suspense境界との統合",
		description: "静的シェルと動的コンテンツを組み合わせたストリーミング",
		priority: "A",
		href: "/cache-demo/03-suspense-boundaries",
		status: "未実装",
	},
	{
		id: "04",
		title: "cacheTag() による再検証",
		description: "タグベースの再検証とupdateTag/revalidateTagの使用方法",
		priority: "B",
		href: "/cache-demo/04-cache-tags",
		status: "未実装",
	},
	{
		id: "05",
		title: "プライベートキャッシュ",
		description:
			"'use cache: private'を使ったcookies/headers/searchParamsの扱い",
		priority: "B",
		href: "/cache-demo/05-private-cache",
		status: "未実装",
	},
	{
		id: "06",
		title: "connection() API",
		description: "動的レンダリングの強制とMath.random/Date.nowの正しい扱い",
		priority: "B",
		href: "/cache-demo/06-connection",
		status: "未実装",
	},
	{
		id: "07",
		title: "generateStaticParams統合",
		description: "動的ルートの静的生成とビルド時の動作",
		priority: "C",
		href: "/cache-demo/07-static-params",
		status: "未実装",
	},
	{
		id: "08",
		title: "ネストしたキャッシュ",
		description: "異なるcacheLifeを持つコンポーネントのネスト動作",
		priority: "C",
		href: "/cache-demo/08-nested-cache",
		status: "未実装",
	},
	{
		id: "09",
		title: "Route Handlersのキャッシュ",
		description: "GET Route HandlersでのCache Components動作",
		priority: "C",
		href: "/cache-demo/09-route-handlers",
		status: "未実装",
	},
	{
		id: "10",
		title: "Interleavingパターン",
		description: "children/slotsを使った柔軟なキャッシュ構成",
		priority: "C",
		href: "/cache-demo/10-interleaving",
		status: "未実装",
	},
];

const Page: FC<PageProps<"/cache-demo">> = (_props) => {
	return (
		<div className="space-y-8">
			<header>
				<h1 className="text-3xl font-bold text-fg">Cache Components デモ集</h1>
				<p className="mt-2 text-muted-fg">
					Next.js 16のCache Components機能を網羅的に確認できるデモページ集です。
					<br />
					基礎（A）→ 実用（B）→
					高度（C）の順に段階的に学習することを推奨します。
				</p>
			</header>

			<section className="rounded-lg border border-border bg-muted p-6">
				<h2 className="text-lg font-semibold text-fg">
					Cache Componentsとは？
				</h2>
				<p className="mt-2 text-sm text-muted-fg">
					Cache Componentsは、Next.js
					16で導入された新しいキャッシング機能です。従来の暗黙的なキャッシングから、明示的なオプトイン方式に変更されました。
				</p>
				<ul className="mt-3 space-y-1 text-sm text-muted-fg">
					<li>
						• <strong>デフォルトで動的</strong>:{" "}
						すべてのコンテンツはデフォルトでリクエスト時にレンダリング
					</li>
					<li>
						• <strong>明示的なキャッシング</strong>: 「use cache」で静的化を選択
					</li>
					<li>
						• <strong>柔軟な制御</strong>: cacheLife、cacheTagによる細かい制御
					</li>
					<li>
						• <strong>部分的プリレンダリング</strong>:{" "}
						静的シェルと動的ホールの組み合わせ
					</li>
				</ul>
				<p className="mt-4 text-sm">
					<a
						href="https://nextjs.org/docs/app/building-your-application/caching"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline"
					>
						Next.js 公式ドキュメント →
					</a>
				</p>
			</section>

			<section className="space-y-6">
				<h2 className="text-2xl font-semibold text-fg">デモ一覧</h2>
				<div className="grid gap-6 md:grid-cols-2">
					{demos.map((demo) => (
						<Link key={demo.id} href={demo.href} className="block">
							<DemoCard className="transition-shadow hover:shadow-md">
								<DemoCardHeader priority={demo.priority}>
									<DemoCardTitle>{`${demo.id}. ${demo.title}`}</DemoCardTitle>
									<DemoCardDescription>{demo.description}</DemoCardDescription>
								</DemoCardHeader>
								<DemoCardContent>
									<div className="flex items-center justify-between">
										<span
											className={`text-sm ${
												demo.status === "完了"
													? "text-green-600 dark:text-green-400"
													: demo.status === "実装中"
														? "text-yellow-600 dark:text-yellow-400"
														: "text-muted-fg"
											}`}
										>
											{demo.status}
										</span>
										<span className="text-sm text-primary hover:underline">
											デモを見る →
										</span>
									</div>
								</DemoCardContent>
							</DemoCard>
						</Link>
					))}
				</div>
			</section>

			<section className="rounded-lg border border-border bg-muted p-6">
				<h2 className="text-lg font-semibold text-fg">学習の進め方</h2>
				<ol className="mt-3 space-y-2 text-sm text-muted-fg">
					<li>
						1. <strong>優先度Aから開始</strong>: 基礎機能を確実に理解しましょう
					</li>
					<li>
						2. <strong>コードを読む</strong>:{" "}
						各デモのソースコードを確認して実装方法を学びます
					</li>
					<li>
						3. <strong>動作を確認</strong>:{" "}
						タイムスタンプやキャッシュステータスで挙動を観察
					</li>
					<li>
						4. <strong>実験する</strong>:{" "}
						設定を変えたり、コードを書き換えて試してみましょう
					</li>
				</ol>
			</section>
		</div>
	);
};

export default Page;
