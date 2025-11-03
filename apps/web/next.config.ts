import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	// biome-ignore lint: Next.js config requires process.cwd() for monorepo paths
	outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
	turbopack: {
		// biome-ignore lint: Next.js config requires process.cwd() for monorepo paths
		root: path.resolve(process.cwd(), "../.."),
	},
};

export default nextConfig;
