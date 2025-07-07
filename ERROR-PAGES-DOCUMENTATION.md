# Error Pages Documentation - VBTicket Application

## Overview

This document provides comprehensive documentation for all error pages and loading states implemented in the VBTicket application. These pages provide user-friendly error handling with consistent Magic UI/shadcn design patterns and responsive layouts.

## ✅ Implemented Error Pages

### 1. 404 Not Found Page (`src/app/not-found.tsx`)

**Purpose**: Displayed when users navigate to non-existent routes

**Features**:
- ✅ Friendly error message in Indonesian: "Halaman yang Anda cari tidak ditemukan"
- ✅ Navigation options (Back, Home, Refresh)
- ✅ Popular links section with quick access to common pages
- ✅ Help and support section
- ✅ Magic UI components with gradient backgrounds
- ✅ Fully responsive design
- ✅ Accessibility compliant

**Key Components**:
- Large "404" display with animated compass icon
- Action buttons with proper touch targets
- Popular pages grid with hover effects
- Help section with support links

**Usage**:
```typescript
// Automatically triggered by Next.js for non-existent routes
// Can be tested by visiting: /any-non-existent-page
```

### 2. Unauthorized Access Page (`src/app/unauthorized/page.tsx`)

**Purpose**: Displayed when users try to access restricted areas without proper permissions

**Features**:
- ✅ Role-specific messaging (admin vs organizer vs buyer access)
- ✅ Clear explanation of access restrictions
- ✅ Login/registration options for unauthenticated users
- ✅ Role information display
- ✅ URL parameter support for return URLs
- ✅ Responsive design with Magic UI components

**URL Parameters**:
- `required`: Required role (admin, organizer, buyer)
- `current`: Current user role (admin, organizer, buyer, guest)
- `returnUrl`: URL to redirect after successful authentication

**Usage**:
```typescript
// Redirect to unauthorized page with parameters
router.push('/unauthorized?required=admin&current=guest&returnUrl=/admin/dashboard');
```

**Example URLs**:
- `/unauthorized?required=admin&current=guest`
- `/unauthorized?required=organizer&current=buyer&returnUrl=/organizer/events`

### 3. 500 Server Error Page (`src/app/error.tsx`)

**Purpose**: Displayed when internal server errors occur

**Features**:
- ✅ Error details in development mode
- ✅ Error reporting functionality via email
- ✅ Troubleshooting steps for users
- ✅ Retry mechanism
- ✅ Status information and help
- ✅ Professional error handling

**Props Interface**:
```typescript
interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}
```

**Development Features**:
- Error message display
- Error digest information
- Stack trace (development only)
- Automatic error logging

**User Features**:
- Retry functionality
- Error reporting via email
- Troubleshooting guide
- Navigation options

### 4. Maintenance Mode Page (`src/app/maintenance/page.tsx`)

**Purpose**: Displayed during planned system maintenance

**Features**:
- ✅ Real-time progress tracking
- ✅ Estimated completion time
- ✅ Maintenance task list with status
- ✅ Current time display
- ✅ Social media and status page links
- ✅ Auto-refresh functionality

**Maintenance Tasks Display**:
- Database updates (completed/in-progress/pending)
- Server upgrades
- System testing
- Deployment status

**Time Features**:
- Current time in Indonesian timezone
- Estimated completion time
- Progress percentage
- Real-time updates

### 5. Network Error Page (`src/app/network-error/page.tsx`)

**Purpose**: Displayed when network connectivity issues occur

**Features**:
- ✅ Connection status detection
- ✅ Network speed detection
- ✅ Troubleshooting guide
- ✅ Retry mechanism with attempt counter
- ✅ Online/offline status monitoring
- ✅ Step-by-step problem resolution

**Connection Detection**:
- Online/offline status
- Connection speed (4G/3G/2G)
- Network quality assessment
- Real-time status updates

**Troubleshooting Steps**:
1. Check WiFi connection
2. Restart router/modem
3. Try other websites
4. Refresh page

## 🔄 Loading Components (`src/components/ui/loading-components.tsx`)

### Global Loading Page (`src/app/loading.tsx`)

**Features**:
- ✅ VBTicket branding with animated logo
- ✅ Progress indicators
- ✅ Loading messages in Indonesian
- ✅ Animated background elements
- ✅ Responsive design

### Component-Level Loading States

#### Available Components:
1. **LoadingSpinner** - Basic spinner with optional text
2. **CardLoading** - Skeleton for card components
3. **EventCardLoading** - Specific loading for event cards
4. **TableLoading** - Loading state for data tables
5. **DashboardStatsLoading** - Loading for dashboard statistics
6. **FormLoading** - Loading state for forms
7. **PageLoading** - Full page loading with context
8. **ButtonLoading** - Button with loading state
9. **ListLoading** - Loading for list components
10. **ChartLoading** - Loading for charts and graphs

#### Usage Examples:
```typescript
import { LoadingSpinner, CardLoading, EventCardLoading } from '~/components/ui/loading-components';

// Basic spinner
<LoadingSpinner size="lg" text="Memuat data..." />

// Card skeleton
<CardLoading showHeader showFooter lines={4} />

// Event card skeleton
<EventCardLoading />
```

## 🎨 Design System Integration

### Magic UI Components Used:
- **MagicCard**: Primary container with gradient effects
- **MagicButton**: Enhanced buttons with animations
- **Shimmer**: Loading shimmer effects
- **GradientText**: Gradient text effects (where available)

### Responsive Design:
- **Mobile-first approach**: Base styles for mobile, enhanced for larger screens
- **Touch targets**: Minimum 44px for all interactive elements
- **Responsive typography**: Text scales appropriately across devices
- **Flexible layouts**: Grid and flexbox layouts adapt to screen size

### Color Schemes:
- **404 Page**: Blue to indigo gradient
- **Unauthorized**: Red to orange gradient (warning theme)
- **500 Error**: Red to orange gradient (error theme)
- **Maintenance**: Amber to orange gradient (warning theme)
- **Network Error**: Blue to indigo gradient (info theme)

## 🧪 Testing

### Test Page (`src/app/(public)/error-pages-test/page.tsx`)

**Purpose**: Comprehensive testing interface for all error pages

**Features**:
- ✅ Visual overview of all error pages
- ✅ Direct links to test each page
- ✅ Feature lists for each error page
- ✅ Testing scenarios and instructions
- ✅ Responsive design validation

**Test Scenarios**:
1. **Responsive Design Test**
   - Mobile (320px - 768px)
   - Tablet (768px - 1024px)
   - Desktop (1024px+)
   - Touch target validation
   - Text readability

2. **Navigation Test**
   - Back button functionality
   - Home page navigation
   - External links
   - Retry mechanisms
   - URL parameter handling

3. **Accessibility Test**
   - Screen reader compatibility
   - Keyboard navigation
   - Color contrast ratios
   - Focus indicators
   - ARIA labels

### Manual Testing Checklist:

#### For Each Error Page:
- [ ] Page loads correctly
- [ ] All text is in Indonesian
- [ ] Navigation buttons work
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Touch targets are minimum 44px
- [ ] Colors have sufficient contrast
- [ ] Icons and animations work properly
- [ ] Help/support links function

#### Specific Tests:
- [ ] **404**: Test with various non-existent URLs
- [ ] **Unauthorized**: Test with different role parameters
- [ ] **500**: Test error reporting functionality
- [ ] **Maintenance**: Test progress updates and time display
- [ ] **Network**: Test online/offline detection

## 🚀 Usage Guidelines

### When to Use Each Page:

1. **404 Not Found**:
   - Non-existent routes
   - Deleted content
   - Mistyped URLs

2. **Unauthorized**:
   - Insufficient permissions
   - Role-based access control
   - Authentication required

3. **500 Server Error**:
   - Internal server errors
   - Database connection issues
   - Application crashes

4. **Maintenance**:
   - Planned system maintenance
   - Server upgrades
   - Feature deployments

5. **Network Error**:
   - Connection timeouts
   - Network unavailable
   - API unreachable

### Implementation Best Practices:

1. **Consistent Messaging**: All error messages are in Indonesian and user-friendly
2. **Clear Actions**: Each page provides clear next steps for users
3. **Responsive Design**: All pages work across all device sizes
4. **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support
5. **Performance**: Optimized loading and minimal dependencies
6. **SEO**: Proper meta tags and structured data where applicable

## 🔧 Maintenance

### Regular Updates Needed:
- Update maintenance page progress during actual maintenance
- Review error messages for clarity and accuracy
- Test all links and navigation regularly
- Update contact information and support links
- Monitor error page analytics for user behavior

### Performance Monitoring:
- Track error page visit frequency
- Monitor user actions on error pages
- Analyze bounce rates from error pages
- Measure error resolution success rates

## 📊 Analytics and Monitoring

### Recommended Tracking:
- Error page views by type
- User actions taken on error pages
- Error resolution success rates
- Time spent on error pages
- Device/browser breakdown for errors

### Error Reporting:
- Automatic error logging for 500 errors
- User-initiated error reports
- Error categorization and trending
- Integration with monitoring tools

## 🎯 Future Enhancements

### Potential Improvements:
- [ ] Animated illustrations for each error type
- [ ] Multi-language support
- [ ] Dark/light theme optimization
- [ ] Progressive Web App offline support
- [ ] Voice assistance integration
- [ ] Chatbot integration for help
- [ ] Real-time status updates
- [ ] Error analytics dashboard

This documentation ensures that all error pages provide a consistent, user-friendly experience while maintaining the high-quality design standards of the VBTicket application.
