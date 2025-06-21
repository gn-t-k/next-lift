import type { Metadata } from 'next';
import type { FC, PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: 'Next Lift',
  description: 'ウェイトトレーニングの計画と記録を行うアプリケーション',
};

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
};

export default Layout;
