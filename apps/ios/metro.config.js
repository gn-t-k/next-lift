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
config.resolver.extraNodeModules = {
	react: path.resolve(projectRoot, "node_modules/react"),
	"react-native": path.resolve(projectRoot, "node_modules/react-native"),
};

// Drizzle ORMのマイグレーション用に.sqlファイルを認識できるようにする
config.resolver.sourceExts.push("sql");

module.exports = config;
