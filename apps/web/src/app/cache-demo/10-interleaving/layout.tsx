import type { FC, ReactNode } from "react";
import { LayoutContent } from "./_components/layout-content";

type Props = {
	children: ReactNode;
};

const Layout: FC<Props> = ({ children }) => {
	return (
		<div className="space-y-8">
			<LayoutContent />
			{children}
		</div>
	);
};

export default Layout;
