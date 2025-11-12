import type { FC } from "react";
import { LayoutContent } from "./_components/layout-content";

const Layout: FC<LayoutProps<"/cache-demo/10-interleaving">> = async (
	props,
) => {
	return (
		<div className="space-y-8">
			<LayoutContent />
			{props.children}
		</div>
	);
};

export default Layout;
