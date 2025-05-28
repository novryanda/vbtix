# Dashboard Redirect System

This directory contains the shared redirect system for admin and organizer dashboard pages.

## Overview

The redirect system provides a clean, consistent, and structural approach to handling redirects across the application. It replaces the previous inconsistent patterns with a unified solution.

## Components

### `use-dashboard-redirect.ts`

Main hook file containing:

- **`useDashboardRedirect(config)`** - Core redirect hook with configurable options
- **`useAdminDashboardRedirect()`** - Specialized hook for admin redirects
- **`useOrganizerDashboardRedirect(organizerId)`** - Specialized hook for organizer redirects with ID
- **`useOrganizerRedirectWithSession()`** - Hook for session-based organizer redirects

### `../components/ui/redirect-loading.tsx`

Shared loading components:

- **`RedirectLoading`** - Full-screen loading component for redirect pages
- **`RedirectLoadingCompact`** - Compact loading component for inline use

## Usage Examples

### Admin Page Redirect

```tsx
import { useAdminDashboardRedirect } from "~/lib/hooks/use-dashboard-redirect";
import { RedirectLoading } from "~/components/ui/redirect-loading";

export default function AdminPage() {
  useAdminDashboardRedirect();
  
  return (
    <AdminRoute>
      <RedirectLoading message="Redirecting to admin dashboard..." />
    </AdminRoute>
  );
}
```

### Organizer Page Redirect (with ID)

```tsx
import { useOrganizerDashboardRedirect } from "~/lib/hooks/use-dashboard-redirect";
import { RedirectLoading } from "~/components/ui/redirect-loading";

export default function OrganizerPage() {
  const params = useParams();
  const organizerId = params.id as string;
  
  useOrganizerDashboardRedirect(organizerId);
  
  return <RedirectLoading message="Redirecting to organizer dashboard..." />;
}
```

### Organizer Page Redirect (session-based)

```tsx
import { useOrganizerRedirectWithSession } from "~/lib/hooks/use-dashboard-redirect";
import { RedirectLoading } from "~/components/ui/redirect-loading";

export default function OrganizerPage() {
  const { isLoading } = useOrganizerRedirectWithSession();
  
  return (
    <RedirectLoading 
      message={isLoading ? "Loading..." : "Redirecting to organizer dashboard..."} 
    />
  );
}
```

## Benefits

1. **Consistency** - All redirect pages use the same pattern and components
2. **Type Safety** - Full TypeScript support with proper types
3. **Maintainability** - Centralized logic that's easy to update
4. **Performance** - Proper use of `router.replace()` instead of `window.location`
5. **User Experience** - Consistent loading states and messages
6. **Flexibility** - Configurable options for different use cases

## Migration

The following pages have been updated to use the new system:

- `src/app/(dashboard)/admin/page.tsx`
- `src/app/(dashboard)/organizer/[id]/page.tsx`
- `src/app/(dashboard)/organizer/page.tsx`

## Configuration Options

The `useDashboardRedirect` hook accepts a `RedirectConfig` object:

```typescript
interface RedirectConfig {
  targetPath: string;        // Target path to redirect to
  replace?: boolean;         // Whether to replace history entry (default: true)
  requireAuth?: boolean;     // Whether to check authentication (default: false)
  fallbackPath?: string;     // Fallback path if auth fails (default: "/login")
}
```
