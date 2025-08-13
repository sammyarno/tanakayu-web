# Role-Based Authorization Examples

This document shows how to implement role-based authorization in your pages and components.

## Available Roles
- `ADMIN`: Full access to all features
- `MEMBER`: Limited access to member features

## Usage Examples

### 1. Admin-Only Pages

```tsx
// pages/admin/dashboard/page.tsx
import PageContent from '@/components/PageContent';

const AdminDashboard = () => {
  return (
    <PageContent allowedRoles={['ADMIN']} fallbackPath="/dashboard">
      <h1>Admin Dashboard</h1>
      <p>Only admins can see this content</p>
    </PageContent>
  );
};

export default AdminDashboard;
```

### 2. Member-Only Pages

```tsx
// pages/member/profile/page.tsx
import PageContent from '@/components/PageContent';

const MemberProfile = () => {
  return (
    <PageContent allowedRoles={['MEMBER']} fallbackPath="/login">
      <h1>Member Profile</h1>
      <p>Only members can access this page</p>
    </PageContent>
  );
};

export default MemberProfile;
```

### 3. Multi-Role Access (Admin + Member)

```tsx
// pages/shared/announcements/page.tsx
import PageContent from '@/components/PageContent';

const AnnouncementsPage = () => {
  return (
    <PageContent allowedRoles={['ADMIN', 'MEMBER']} fallbackPath="/login">
      <h1>Announcements</h1>
      <p>Both admins and members can see this</p>
    </PageContent>
  );
};

export default AnnouncementsPage;
```

### 4. Conditional Content Based on Role

```tsx
// components/ConditionalContent.tsx
import { useRoleCheck } from '@/hooks/auth/useRoleCheck';

const ConditionalContent = () => {
  const { isAdmin, isMember, hasRole } = useRoleCheck();

  return (
    <div>
      {isAdmin() && (
        <div>
          <h2>Admin Controls</h2>
          <button>Delete User</button>
          <button>Manage Settings</button>
        </div>
      )}
      
      {isMember() && (
        <div>
          <h2>Member Features</h2>
          <button>View Profile</button>
          <button>Update Info</button>
        </div>
      )}
      
      {hasRole('ADMIN') && (
        <p>You have admin privileges</p>
      )}
    </div>
  );
};

export default ConditionalContent;
```

### 5. Any Authenticated User (Both Roles)

```tsx
// For content accessible to any authenticated user
import PageContent from '@/components/PageContent';

const AuthenticatedPage = () => {
  return (
    <PageContent allowedRoles={['ADMIN', 'MEMBER']}>
      <h1>Any authenticated user can see this</h1>
    </PageContent>
  );
};

export default AuthenticatedPage;
```

### 6. Direct Role-Based Component Usage

```tsx
// For more complex scenarios
import RoleBasedPage from '@/components/RoleBasedPage';

const ComplexPage = () => {
  return (
    <div>
      <h1>Public Header</h1>
      
      <RoleBasedPage allowedRoles={['ADMIN']} fallbackPath="/unauthorized">
        <div>Admin-only section</div>
      </RoleBasedPage>
      
      <RoleBasedPage allowedRoles={['MEMBER', 'ADMIN']}>
        <div>Member and Admin section</div>
      </RoleBasedPage>
      
      <footer>Public Footer</footer>
    </div>
  );
};

export default ComplexPage;
```

## Migration Guide

### From Legacy Authentication

**Before (Legacy - No Longer Supported):**
```tsx
<PageContent mustAuthenticate={true}>
  {/* content */}
</PageContent>
```

**After (Admin only):**
```tsx
<PageContent allowedRoles={['ADMIN']}>
  {/* content */}
</PageContent>
```

**After (Any authenticated user):**
```tsx
<PageContent allowedRoles={['ADMIN', 'MEMBER']}>
  {/* content */}
</PageContent>
```

**After (Public content):**
```tsx
<PageContent>
  {/* No authentication required */}
</PageContent>
```

## Best Practices

1. **Use specific roles**: Always use `allowedRoles` with specific roles for proper authorization
2. **Set fallback paths**: Always specify where unauthorized users should be redirected
3. **Component-level checks**: Use `useRoleCheck` hook for conditional rendering within components
4. **Server-side validation**: Always validate roles on the API level as well
5. **Consistent naming**: Use uppercase role names ('ADMIN', 'MEMBER') consistently

## Security Notes

- Client-side role checks are for UX only - always validate on the server
- The role information comes from the JWT token and user store
- Unauthorized users are automatically redirected to prevent access
- The system gracefully handles loading states and authentication failures