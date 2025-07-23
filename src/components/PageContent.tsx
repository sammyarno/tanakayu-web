import type { PropsWithChildren } from 'react';

import PrivatePage from './PrivatePage';

interface PageContentProps extends PropsWithChildren {
  isAdmin?: boolean;
}

const PageContent = ({ children, isAdmin = false }: PageContentProps) => {
  const content = <main className="flex w-full flex-col gap-6 py-4">{children}</main>;

  return isAdmin ? <PrivatePage>{content}</PrivatePage> : content;
};

export default PageContent;
