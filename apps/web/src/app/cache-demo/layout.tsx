import { Link } from "@next-lift/react-components/ui";
import type { FC, PropsWithChildren } from "react";
import { GlobalNavigation } from "./_components/global-navigation";
import { ToggleThemeButton } from "./_components/toggle-theme-button";

const Layout: FC<PropsWithChildren> = ({ children }) => {
	return (
		<div className="flex min-h-screen">
			{/* サイドバー */}
			<aside className="w-64 border-border border-r bg-bg">
				<div className="sticky top-0 flex h-screen flex-col">
					<div className="border-border border-b px-6 py-4">
						<div className="flex items-center justify-between">
							<Link
								href="/cache-demo"
								className="font-semibold text-fg text-lg hover:text-primary"
							>
								Cache Components デモ
							</Link>
							<ToggleThemeButton />
						</div>
					</div>
					<GlobalNavigation />
					<div className="border-border border-t px-6 py-4">
						<Link href="/" className="text-muted-fg text-sm hover:text-fg">
							← ホームに戻る
						</Link>
					</div>
				</div>
			</aside>

			{/* メインコンテンツ */}
			<main className="flex-1 overflow-y-auto">
				<div className="mx-auto max-w-5xl p-8">{children}</div>
			</main>
		</div>
	);
};

export default Layout;
