import { Link } from "@next-lift/react-components/ui";
import type { FC } from "react";

const Page: FC<PageProps<"/">> = (_props) => {
	return (
		<ul>
			<li>
				<Link href="/auth/sign-in">サインインページ（動作確認用）</Link>
			</li>
			<li>
				<Link href="/test-intent">test-intent</Link>
			</li>
			<li>
				<Link href="/sentry-test">sentry-test</Link>
			</li>
			<li>
				<Link href="/cache-demo">cache-demo</Link>
			</li>
		</ul>
	);
};

export default Page;
