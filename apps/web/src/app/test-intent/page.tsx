"use client";

import { Button } from "@next-lift/react-components/ui";
import { useTheme } from "next-themes";
import type { FC } from "react";
import { useEffect, useState } from "react";

const TestIntentUI: FC = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// クライアント側でのみレンダリングする
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<div className="min-h-screen bg-bg p-8 text-fg">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-2xl">Intent UI Test</h1>
				<div className="flex gap-2">
					<Button
						intent="outline"
						onPress={() => setTheme("light")}
						aria-pressed={theme === "light"}
					>
						Light
					</Button>
					<Button
						intent="outline"
						onPress={() => setTheme("dark")}
						aria-pressed={theme === "dark"}
					>
						Dark
					</Button>
					<Button
						intent="outline"
						onPress={() => setTheme("system")}
						aria-pressed={theme === "system"}
					>
						System
					</Button>
				</div>
			</div>
			<div className="mb-4 text-muted-fg text-sm">Current theme: {theme}</div>
			<div className="flex flex-wrap gap-4">
				<Button intent="primary">Primary Button</Button>
				<Button intent="secondary">Secondary Button</Button>
				<Button intent="warning">Warning Button</Button>
				<Button intent="danger">Danger Button</Button>
				<Button intent="outline">Outline Button</Button>
				<Button intent="plain">Plain Button</Button>
			</div>
		</div>
	);
};

export default TestIntentUI;
