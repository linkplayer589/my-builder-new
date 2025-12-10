# Analytics Feature Documentation

## Overview

The Analytics feature provides comprehensive user feedback and analytics integration for the LifePass Admin application. Currently, it includes the Userback widget integration for collecting user feedback, bug reports, and feature requests directly from users within the application.

**Purpose**: Enable seamless user feedback collection integrated with Clerk authentication

**Key Functionality**:
- Automatic Userback widget initialization
- Clerk user data integration
- Anonymous user support
- Debug logging for development
- Type-safe configuration

**User Interactions**:
- Users can submit feedback via the Userback widget (typically a floating button)
- Feedback automatically includes user identity and context
- Works for both authenticated and anonymous users

**Business Logic**:
- Integrates with Clerk authentication to automatically populate user data
- Falls back to anonymous mode if user is not authenticated
- Lazy-loads Userback widget only after Clerk has fully loaded
- Handles errors gracefully with console warnings

**Integration Points**:
- `@clerk/nextjs` - User authentication data
- `@userback/widget` - Feedback widget library
- Environment variables for API token configuration

---

## File Tree

```
analytics/
├── analytics-components/
│   ├── analytics-userback-widget.tsx
│   │   → Main Userback widget component
│   │   → Handles Clerk authentication integration
│   │   → Initializes Userback with user data
│   │   → Manages widget lifecycle (mount, cleanup)
│   │   → Logs initialization events for debugging
│   │   → Supports both authenticated and anonymous users
│   │
│   └── index.ts
│       → Public API exports for analytics components
│       → Exports AnalyticsUserbackWidget component
│
├── analytics-types/
│   └── analytics-types.ts
│       → TAnalyticsUserData: User data structure for feedback
│       → TAnalyticsUserbackOptions: Widget configuration options
│       → TAnalyticsUserbackWidgetProps: Component prop types
│
├── index.ts
│   → Main feature entry point
│   → Exports all analytics components and types
│   → Public API for external consumption
│
└── analytics-docs.md
    → Comprehensive feature documentation (this file)
```

---

## Functions & Components

### AnalyticsUserbackWidget

**Purpose**: Initialize and manage the Userback feedback widget with Clerk user integration

**Type**: React Client Component

**Props**:
- `token?: string` - Optional custom Userback token (defaults to `NEXT_PUBLIC_USERBACK_TOKEN` env var)
- `debug?: boolean` - Enable debug logging in development mode (default: `false`)

**Returns**: `null` (no visual output - side effects only)

**Side Effects**:
1. Subscribes to Clerk user authentication state
2. Initializes Userback widget on component mount (after Clerk loads)
3. Configures widget with user data from Clerk
4. Logs initialization events to console
5. Handles errors with console warnings

**Dependencies**:
- `react` - useEffect hook for lifecycle management
- `@clerk/nextjs` - useUser hook for authentication data
- `@userback/widget` - Userback SDK for widget initialization
- `../analytics-types/analytics-types` - TypeScript type definitions

**Environment Variables Required**:
- `NEXT_PUBLIC_USERBACK_TOKEN` - Userback API token (can be overridden via props)
- `NODE_ENV` - Used to determine debug logging behavior

**Example Usage**:

```tsx
// Basic usage in app layout
import { AnalyticsUserbackWidget } from '@/features/analytics'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <AnalyticsUserbackWidget />
      </body>
    </html>
  )
}
```

```tsx
// With custom token and debug mode
import { AnalyticsUserbackWidget } from '@/features/analytics'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <AnalyticsUserbackWidget 
          token="custom-token-123" 
          debug={true} 
        />
      </body>
    </html>
  )
}
```

**Internal Logic**:

1. **Component Mount**:
   - Component subscribes to Clerk's `useUser()` hook
   - Waits for Clerk to fully load (`isLoaded === true`)

2. **Token Retrieval**:
   - Checks for custom token in props
   - Falls back to `NEXT_PUBLIC_USERBACK_TOKEN` environment variable
   - Logs warning and exits if no token is available

3. **User Data Configuration**:
   - If user is authenticated:
     - Extracts user ID, name, email from Clerk
     - Includes optional metadata (firstName, lastName, avatar)
   - If user is not authenticated:
     - Uses anonymous user data with placeholder values

4. **Widget Initialization**:
   - Calls `Userback(token, options)` with configuration
   - Handles promise resolution with success logging
   - Catches and logs any initialization errors

5. **Debug Logging**:
   - Logs user data in development mode or when `debug` prop is true
   - Logs success/error status to console

6. **Cleanup**:
   - Effect re-runs if user, isLoaded, customToken, or debug changes
   - Userback widget automatically handles cleanup

**Error Handling**:
- Missing token: Logs warning and exits gracefully
- Initialization failure: Catches error and logs to console
- Invalid user data: Falls back to anonymous mode

**Performance Considerations**:
- Widget initialization is deferred until Clerk has loaded (avoids race conditions)
- Uses React's useEffect with proper dependencies
- No visual rendering (returns null)
- Lazy-loads Userback SDK

**PostHog Events**: None (uses console logging instead)

---

## Type Definitions

### TAnalyticsUserData

**Purpose**: Define the structure for user data sent to Userback

**Properties**:
- `id: string` - Unique user identifier (Clerk user ID or 'anonymous')
- `info: object` - User information object
  - `name: string` - User's full name or display name
  - `email: string` - User's email address
  - `firstName?: string` - User's first name (optional)
  - `lastName?: string` - User's last name (optional)
  - `avatar?: string` - URL to user's avatar image (optional)

**Usage**:
```typescript
const userData: TAnalyticsUserData = {
  id: 'user_123',
  info: {
    name: 'John Doe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://example.com/avatar.jpg'
  }
}
```

---

### TAnalyticsUserbackOptions

**Purpose**: Configuration options for Userback widget initialization

**Properties**:
- `user_data?: TAnalyticsUserData` - Optional user data to associate with feedback

**Usage**:
```typescript
const options: TAnalyticsUserbackOptions = {
  user_data: {
    id: 'user_123',
    info: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  }
}
```

---

### TAnalyticsUserbackWidgetProps

**Purpose**: Props type for AnalyticsUserbackWidget component

**Properties**:
- `token?: string` - Optional custom Userback API token
- `debug?: boolean` - Enable debug logging in development

**Usage**:
```typescript
const props: TAnalyticsUserbackWidgetProps = {
  token: 'custom-token',
  debug: true
}
```

---

## State Management

### Local State
- None (component uses no local state)

### External State (via hooks)
- `user` (from Clerk) - Current authenticated user object
- `isLoaded` (from Clerk) - Boolean indicating if Clerk has finished loading

### Global State
- None (fully self-contained)

### Server State
- None (client-side only component)

---

## External Dependencies

### Production Dependencies

**@clerk/nextjs** (^6.8.3)
- **Purpose**: User authentication and identity management
- **Usage**: `useUser()` hook to access authenticated user data
- **Why**: Provides user information to associate with feedback submissions

**@userback/widget** (^2.11.1)
- **Purpose**: User feedback widget integration
- **Usage**: Initialize and configure Userback feedback widget
- **Why**: Core functionality for collecting user feedback, bug reports, and feature requests

**react** (^18.2.0)
- **Purpose**: Component framework
- **Usage**: `useEffect` hook for lifecycle management
- **Why**: Standard React component patterns

### Internal Dependencies

**None** - This feature is fully self-contained and has no internal dependencies

### Development Dependencies

**TypeScript** (^5.3.0)
- **Purpose**: Type safety and IDE support
- **Usage**: Type definitions for all props and configurations
- **Why**: Ensures type safety and better developer experience

---

## Environment Variables

### Required

**NEXT_PUBLIC_USERBACK_TOKEN**
- **Type**: String
- **Description**: API token for Userback widget initialization
- **Where to get it**: Userback dashboard (https://app.userback.io)
- **Example**: `NEXT_PUBLIC_USERBACK_TOKEN=abc123xyz456`
- **Fallback**: Widget will not load and a warning will be logged

### Optional

**NODE_ENV**
- **Type**: 'development' | 'production' | 'test'
- **Description**: Node environment mode
- **Usage**: Controls debug logging behavior
- **Set by**: Next.js automatically

---

## Usage Examples

### Basic Usage (App Layout)

```tsx
// app/layout.tsx
import { AnalyticsUserbackWidget } from '@/features/analytics'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Userback widget will appear as a floating button */}
        <AnalyticsUserbackWidget />
      </body>
    </html>
  )
}
```

### With Custom Configuration

```tsx
// app/layout.tsx
import { AnalyticsUserbackWidget } from '@/features/analytics'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Custom token and debug mode enabled */}
        <AnalyticsUserbackWidget 
          token={process.env.NEXT_PUBLIC_CUSTOM_USERBACK_TOKEN} 
          debug={process.env.NODE_ENV === 'development'}
        />
      </body>
    </html>
  )
}
```

### Conditional Rendering

```tsx
// app/layout.tsx
import { AnalyticsUserbackWidget } from '@/features/analytics'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Only show in production
  const showUserback = process.env.NODE_ENV === 'production'

  return (
    <html lang="en">
      <body>
        {children}
        {showUserback && <AnalyticsUserbackWidget />}
      </body>
    </html>
  )
}
```

### Type-Safe Import

```tsx
import { 
  AnalyticsUserbackWidget,
  type TAnalyticsUserbackWidgetProps 
} from '@/features/analytics'

// Type-safe props
const userbackProps: TAnalyticsUserbackWidgetProps = {
  debug: true
}

export default function Layout() {
  return <AnalyticsUserbackWidget {...userbackProps} />
}
```

---

## Testing Guidelines

### Unit Tests Required For

**AnalyticsUserbackWidget Component**:
- Renders without crashing
- Does not render any visible DOM elements (returns null)
- Waits for Clerk to load before initializing
- Uses environment token when no custom token provided
- Uses custom token when provided via props
- Handles missing token gracefully (logs warning)
- Configures user data correctly for authenticated users
- Falls back to anonymous data for unauthenticated users
- Calls Userback initialization function
- Handles initialization errors gracefully
- Logs debug information in development mode
- Re-initializes when user changes

### Integration Tests Required For

- Widget initialization with Clerk authentication flow
- Widget behavior with authenticated vs anonymous users
- Error handling when Userback fails to load
- Environment variable configuration

### Mocking Requirements

```typescript
// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    user: {
      id: 'user_123',
      fullName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
      imageUrl: 'https://example.com/avatar.jpg'
    },
    isLoaded: true
  }))
}))

// Mock Userback
jest.mock('@userback/widget', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({}))
}))
```

### Test Files

- `analytics-userback-widget.test.tsx` - Component behavior tests
- `analytics-types.test.ts` - Type validation tests (if needed)

### Example Test

```typescript
import { render } from '@testing-library/react'
import { AnalyticsUserbackWidget } from './analytics-userback-widget'

describe('AnalyticsUserbackWidget', () => {
  it('should render nothing visually', () => {
    const { container } = render(<AnalyticsUserbackWidget />)
    expect(container.firstChild).toBeNull()
  })

  it('should initialize Userback with user data', async () => {
    const mockUserback = jest.fn(() => Promise.resolve({}))
    jest.mock('@userback/widget', () => mockUserback)

    render(<AnalyticsUserbackWidget />)

    // Wait for initialization
    await waitFor(() => {
      expect(mockUserback).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          user_data: expect.objectContaining({
            id: 'user_123'
          })
        })
      )
    })
  })
})
```

---

## Known Issues & Limitations

### Current Limitations

1. **Single Widget Instance**: Only one Userback widget can be initialized per page
2. **No Server-Side Rendering**: Widget is client-side only (uses `'use client'` directive)
3. **Environment Dependency**: Requires `NEXT_PUBLIC_USERBACK_TOKEN` to be set
4. **No Widget Customization**: Widget appearance is controlled via Userback dashboard, not code
5. **Limited Error Recovery**: If initialization fails, it only logs the error (no retry mechanism)

### Browser Compatibility

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Performance Notes

- Widget script loads asynchronously after Clerk authentication completes
- Minimal performance impact (no visual rendering)
- Widget SDK is lazy-loaded by Userback

### Known Issues

None at this time.

---

## Security Considerations

### API Token

- **NEXT_PUBLIC_USERBACK_TOKEN** is exposed to the client (as it starts with `NEXT_PUBLIC_`)
- This is expected and safe as Userback tokens are designed for client-side use
- Userback provides additional security through domain whitelisting

### User Data

- User email and personal data is sent to Userback
- Ensure users are aware of this in your privacy policy
- Data is sent securely over HTTPS
- Userback is GDPR compliant

### Recommendations

- Whitelist your domains in Userback dashboard to prevent unauthorized usage
- Review Userback's privacy policy and data handling practices
- Consider adding user consent for feedback data collection
- Do not include sensitive information in custom user data fields

---

## Troubleshooting

### Widget Not Appearing

**Problem**: Userback widget doesn't show on the page

**Solutions**:
1. Check if `NEXT_PUBLIC_USERBACK_TOKEN` is set correctly
2. Check browser console for error messages
3. Verify token is valid in Userback dashboard
4. Check if domain is whitelisted in Userback settings
5. Clear browser cache and reload

### User Data Not Appearing in Feedback

**Problem**: Feedback submissions don't include user information

**Solutions**:
1. Verify Clerk authentication is working (`user` object is populated)
2. Check if Clerk has finished loading (`isLoaded === true`)
3. Review console logs for initialization errors
4. Enable debug mode to see user data configuration

### Console Warnings

**Warning**: "NEXT_PUBLIC_USERBACK_TOKEN environment variable not set"

**Solution**: Add the token to your `.env.local` file:
```bash
NEXT_PUBLIC_USERBACK_TOKEN=your-token-here
```

**Warning**: "Failed to load Userback widget"

**Possible Causes**:
- Invalid token
- Network connectivity issues
- Domain not whitelisted
- Ad blocker preventing widget load

---

## Change Log

### [1.0.0] - 2025-10-02

**Initial Release**
- Created analytics feature following project architecture rules
- Implemented Userback widget integration with Clerk authentication
- Added comprehensive TypeScript types
- Added full JSDoc documentation
- Created analytics-docs.md comprehensive documentation
- Structured with proper naming conventions (analytics- prefix)
- Made feature fully portable and self-contained

**Features**:
- ✅ Userback widget initialization
- ✅ Clerk user data integration
- ✅ Anonymous user support
- ✅ Debug logging
- ✅ Type-safe configuration
- ✅ Comprehensive documentation

---

## Future Enhancements

### Planned Features

1. **PostHog Integration**
   - Add analytics event tracking
   - Track widget interactions
   - Monitor feedback submission rates

2. **Multiple Widget Support**
   - Support for different widget types (feedback, roadmap, changelog)
   - Configurable widget positioning
   - Custom widget themes

3. **Advanced Configuration**
   - Custom widget labels
   - Language localization
   - Widget visibility rules
   - Custom feedback categories

4. **Error Recovery**
   - Automatic retry on initialization failure
   - Fallback feedback mechanism
   - Offline support

5. **Analytics Dashboard**
   - Admin panel for viewing feedback
   - Feedback trends and statistics
   - Integration with existing admin features

### Contribution Guidelines

When extending this feature:
1. ✅ Follow the analytics- prefix naming convention
2. ✅ Add comprehensive JSDoc comments
3. ✅ Update this documentation file
4. ✅ Add TypeScript types to analytics-types.ts
5. ✅ Ensure feature remains portable
6. ✅ Add tests for new functionality
7. ✅ Update the change log

---

## References

### External Documentation
- [Userback Documentation](https://www.userback.io/docs)
- [Userback React Integration](https://www.userback.io/docs/installation/react)
- [Clerk Documentation](https://clerk.com/docs)
- [Clerk useUser Hook](https://clerk.com/docs/references/react/use-user)

### Internal Documentation
- `.cursor/ARCHITECTURE.md` - Project architecture overview
- `.cursor/QUICK_REFERENCE.md` - Quick reference guide
- `.cursor/rules/` - Complete project rules

---

**Last Updated**: 2025-10-02  
**Maintained By**: Development Team  
**Feature Status**: ✅ Active

