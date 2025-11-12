export const fileLevelCode = `"use cache";

// このファイル全体がキャッシュされます
async function getData() {
  return {
    timestamp: new Date().toISOString(),
    value: Math.random(),
  };
}

export default async function Page() {
  const data = await getData();
  return <div>{data.timestamp}</div>;
}`;

export const componentLevelCode = `// コンポーネントレベルのキャッシュ
async function CachedComponent() {
  "use cache";

  const data = await fetchData();
  return <div>{data.value}</div>;
}

export default function Page() {
  return (
    <div>
      <CachedComponent /> {/* このコンポーネントだけキャッシュ */}
    </div>
  );
}`;

export const functionLevelCode = `// 関数レベルのキャッシュ
async function getCachedData() {
  "use cache";

  return await fetchExpensiveData();
}

export default async function Page() {
  const data = await getCachedData(); // この関数の結果がキャッシュ
  return <div>{data}</div>;
}`;
