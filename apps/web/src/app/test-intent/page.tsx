import type { FC } from "react";
import { Button } from "../../ui/ui/button";

const TestIntentUI: FC = () => {
	return (
		<div className="p-8">
			<h1 className="mb-4 font-bold text-2xl">Intent UI Test</h1>
			<div className="flex gap-4">
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
