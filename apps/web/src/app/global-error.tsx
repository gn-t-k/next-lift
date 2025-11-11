"use client";

import * as Sentry from "@sentry/nextjs";
import { type FC, useEffect } from "react";

type Props = {
	error: Error & { digest?: string };
	reset: () => void;
};

const GlobalError: FC<Props> = ({ error }) => {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html lang="ja">
			<body>
				<h2>エラーが発生しました</h2>
			</body>
		</html>
	);
};

export default GlobalError;
