import type { FC } from "react";
import { Welcome } from "../welcome/welcome";
import type { Route } from "./+types/home";

export const meta: Route.MetaFunction = () => {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
};

export const loader = ({ context }: Route.LoaderArgs) => {
	return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
};

const Home: FC<Route.ComponentProps> = ({ loaderData }) => {
	return <Welcome message={loaderData.message} />;
};
export default Home;
