// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

// monorepoのルートパス
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// monorepoのnode_modulesを参照できるようにする
config.watchFolders = [monorepoRoot];

// 依存関係の解決順序を設定
// iOSアプリのnode_modulesを優先し、次にmonorepoルートを参照
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(monorepoRoot, "node_modules"),
];

// Reactとreact-nativeの重複を防ぐため、明示的なエイリアスを設定
const reactPath = path.resolve(monorepoRoot, "node_modules/react");
const reactNativePath = path.resolve(projectRoot, "node_modules/react-native");

config.resolver.extraNodeModules = {
	react: reactPath,
	"react-native": reactNativePath,
};

// 全てのreactインポートを単一のパスに強制解決
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
	if (moduleName === "react") {
		return {
			filePath: path.resolve(reactPath, "index.js"),
			type: "sourceFile",
		};
	}
	if (originalResolveRequest) {
		return originalResolveRequest(context, moduleName, platform);
	}
	return context.resolveRequest(context, moduleName, platform);
};

// Drizzle ORMのマイグレーション用に.sqlファイルを認識できるようにする
config.resolver.sourceExts.push("sql");

module.exports = config;
