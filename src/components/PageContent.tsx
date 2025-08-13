import type { PropsWithChildren } from 'react';

import RoleBasedPage, { type UserRole } from './RoleBasedPage';

interface PageContentProps extends PropsWithChildren {
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

const PageContent = (props: PageContentProps) => {
  const { children, allowedRoles, fallbackPath = '/login' } = props;
  const content = <main className="flex w-full flex-col gap-6 py-4">{children}</main>;

  if (allowedRoles && allowedRoles.length > 0) {
    return (
      <RoleBasedPage allowedRoles={allowedRoles} fallbackPath={fallbackPath}>
        {content}
      </RoleBasedPage>
    );
  }

  return content;
};

export default PageContent;
