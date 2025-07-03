import type { FC, PropsWithChildren } from 'react';

const PageContent: FC<PropsWithChildren> = ({ children }) => (
  <main className="flex w-full flex-col gap-6 py-4">{children}</main>
);

export default PageContent;
