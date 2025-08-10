import type { PropsWithChildren } from 'react';

import PrivatePage from './PrivatePage';

interface PageContentProps extends PropsWithChildren {
  mustAuthenticate?: boolean;
}

const PageContent = ({ children, mustAuthenticate = false }: PageContentProps) => {
  const content = <main className="flex w-full flex-col gap-6 py-4">{children}</main>;

  return mustAuthenticate ? <PrivatePage>{content}</PrivatePage> : content;
};

export default PageContent;
