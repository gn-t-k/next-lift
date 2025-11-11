export const staticShellCode = `import { Suspense } from "react";

// 静的シェル(キャッシュされる)
async function Header() {
  "use cache";
  return <header>Static Header</header>;
}

// 動的コンテンツ
async function DynamicContent() {
  const data = await fetchRealtimeData();
  return <div>{data}</div>;
}

export default async function Page() {
  return (
    <div>
      <Header /> {/* 即座に表示 */}
      <Suspense fallback={<Loading />}>
        <DynamicContent /> {/* ストリーミング */}
      </Suspense>
    </div>
  );
}`;

export const nestedCode = `// ネストしたSuspense境界
export default function Page() {
  return (
    <div>
      <StaticHeader />

      <Suspense fallback={<HeaderSkeleton />}>
        <DynamicHeader />

        <div className="grid grid-cols-2">
          <Suspense fallback={<CardSkeleton />}>
            <StatsCard />
          </Suspense>

          <Suspense fallback={<CardSkeleton />}>
            <ActivityCard />
          </Suspense>
        </div>
      </Suspense>
    </div>
  );
}`;

export const hybridCode = `// ハイブリッドパターン
async function OptimizedPage() {
  "use cache";
  cacheLife("hours");

  const staticData = await getStaticData();

  return (
    <Layout data={staticData}> {/* キャッシュされた部分 */}
      <Suspense fallback={<Skeleton />}>
        <DynamicWidget /> {/* 動的な部分 */}
      </Suspense>
    </Layout>
  );
}`;
