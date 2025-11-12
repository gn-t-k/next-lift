import {
	MessageBox,
	MessageBoxBody,
	MessageBoxTitle,
} from "@next-lift/react-components/demo";
import Link from "next/link";
import type { FC } from "react";
import { Suspense } from "react";
import {
	SubPageContent,
	SubPageContentSkeleton,
} from "./_components/sub-page-content";

const Page: FC<PageProps<"/cache-demo/10-interleaving/sub">> = (_props) => {
	return (
		<main className="space-y-8">
			<header className="space-y-2">
				<Link
					href="/cache-demo/10-interleaving"
					className="text-primary hover:underline"
				>
					← メインページに戻る
				</Link>
				<h1 className="mt-4 font-bold text-3xl text-fg">サブページ</h1>
				<p className="text-lg text-muted-fg">
					レイアウトが共有され、ページコンテンツだけが異なります。
				</p>
			</header>

			<Suspense fallback={<SubPageContentSkeleton />}>
				<SubPageContent />
			</Suspense>

			<MessageBox variant="muted">
				<MessageBoxTitle>確認ポイント</MessageBoxTitle>
				<MessageBoxBody>
					<ul className="list-inside list-disc space-y-2">
						<li>
							上の「共通レイアウト」のキャッシュ時刻が、メインページと同じであることを確認してください。
						</li>
						<li>
							サブページのコンテンツのキャッシュ時刻は、独立していることを確認してください。
						</li>
						<li>
							これにより、レイアウトは一度だけキャッシュされ、複数のページで効率的に共有されます。
						</li>
					</ul>
				</MessageBoxBody>
			</MessageBox>
		</main>
	);
};

export default Page;
