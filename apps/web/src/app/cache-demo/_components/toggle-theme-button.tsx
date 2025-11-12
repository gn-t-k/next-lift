"use client";

import { Button } from "@next-lift/react-components/ui";
import { useTheme } from "next-themes";
import { type FC, useEffect, useState } from "react";

export const ToggleThemeButton: FC = () => {
	const [mounted, setMounted] = useState(false);

	const { theme, setTheme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<Button
			type="button"
			onPress={toggleTheme}
			intent="plain"
			size="sq-sm"
			aria-label="テーマを切り替え"
		>
			{mounted ? (theme === "dark" ? "🌙" : "☀️") : "⌛️"}
		</Button>
	);
};
