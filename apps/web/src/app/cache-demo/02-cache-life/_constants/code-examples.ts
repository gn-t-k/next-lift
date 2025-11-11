export const presetCode = `import { cacheLife } from "next/cache";

async function getData() {
  "use cache";
  cacheLife("hours"); // プリセット: seconds, minutes, hours, days, weeks, max

  return await fetchData();
}`;

export const customCode = `import { cacheLife } from "next/cache";

async function getData() {
  "use cache";
  cacheLife({
    stale: 30,        // 30秒後にstaleになる
    revalidate: 60,   // 60秒後に再検証開始
    expire: 180,      // 180秒後に完全に期限切れ
  });

  return await fetchData();
}`;

export const configCode = `// next.config.ts
export default {
  experimental: {
    cacheLife: {
      // カスタムプロファイルを定義
      frequent: {
        stale: 10,
        revalidate: 30,
        expire: 60,
      },
    },
  },
};

// 使用例
async function getData() {
  "use cache";
  cacheLife("frequent"); // 定義したプロファイルを使用
  return await fetchData();
}`;
