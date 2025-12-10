# User Table Documentation

## Overview

The User Table feature provides a comprehensive interface for managing user data in the admin panel. It displays user information in a sortable, filterable table format with pagination support. The feature includes search functionality, bulk operations, and individual user actions (view, edit, delete).

**Primary Use Cases**:
- View all users in the system
- Search users by name or email
- Filter users by status (active/inactive)
- Sort users by any column
- Paginate through large user datasets
- Perform individual or bulk actions

**Key Functionality**:
- Client-side search with 500ms debounce
- Server-side pagination (20 items per page)
- Multi-column sorting
- Real-time data updates every 30 seconds
- Error handling with user-friendly messages
- PostHog analytics integration

**Integration Points**:
- Database: `/db/queries/user-table-queries.ts`
- API: `/api/users` endpoint
- Auth: Requires admin role
- Analytics: PostHog event tracking

---

## File Tree

```
user-table/
├── user-table-components/
│   ├── user-table-header.tsx
│   │   → Renders the header section with title, search input, and add button
│   │   → Manages search input state with 500ms debounce
│   │   → Emits onSearch event when debounced query changes
│   │   → Emits onAdd event when add button clicked
│   │   → Logs 'user_table_search' and 'user_table_add_clicked' to PostHog
│   │
│   ├── user-table-row.tsx
│   │   → Individual row component displaying user data (name, email, status, created date)
│   │   → Handles row click events for navigation to user detail page
│   │   → Renders action buttons (view, edit, delete) with confirmation dialogs
│   │   → Shows status badge (active = green, inactive = gray)
│   │   → Formats dates using dd/mm/yyyy format
│   │   → Logs 'user_table_row_clicked' and 'user_table_action_performed' events
│   │
│   ├── user-table-body.tsx
│   │   → Container for all table rows
│   │   → Applies filters and sorts to data before rendering
│   │   → Shows loading skeleton while data fetching
│   │   → Shows empty state when no data matches filters
│   │   → Handles virtualization for large datasets (>100 items)
│   │
│   ├── user-table-footer.tsx
│   │   → Pagination controls (previous, next, page numbers)
│   │   → Page size selector (10, 20, 50, 100 items)
│   │   → Displays total count and current range (e.g., "1-20 of 150")
│   │   → Logs 'user_table_page_changed' and 'user_table_page_size_changed' events
│   │
│   └── user-table-skeleton.tsx
│       → Loading skeleton displayed while data fetches
│       → Matches actual table structure for smooth transition
│       → Shows shimmer animation
│
├── user-table-hooks/
│   └── user-table-hooks.ts
│       → useUserTable: Main data fetching hook with auto-refresh
│       →   - Fetches data from getUsersQuery every 30 seconds
│       →   - Manages loading, error, and data states
│       →   - Provides refetch function for manual updates
│       →   - Caches data with 5-minute stale time
│       →
│       → useUserTableFilters: Filter state management
│       →   - Manages search query, status filter, date range
│       →   - Validates filter combinations
│       →   - Persists filters to URL query params
│       →
│       → useUserTableSort: Sorting logic
│       →   - Manages sort field and direction
│       →   - Provides sort toggle function
│       →   - Applies multi-column sort when needed
│       →
│       → useUserTablePagination: Pagination state
│       →   - Manages current page and page size
│       →   - Calculates total pages
│       →   - Provides navigation functions
│       →   - Persists pagination to URL
│
├── user-table-utils/
│   └── user-table-utils.ts
│       → sortUserTableData: Sorts array by field (name, email, createdAt)
│       →   - Handles string, date, and numeric sorting
│       →   - Supports ascending/descending order
│       →   - Case-insensitive string comparison
│       →
│       → filterUserTableData: Multi-criteria filtering
│       →   - Filters by search query (name OR email match)
│       →   - Filters by status (active/inactive)
│       →   - Filters by date range
│       →   - Returns filtered array
│       →
│       → validateUserTableInput: Input validation
│       →   - Validates email format
│       →   - Validates required fields
│       →   - Returns error messages for invalid inputs
│       →
│       → formatUserTableRow: Formats user data for display
│       →   - Formats dates to dd/mm/yyyy
│       →   - Truncates long text fields
│       →   - Sanitizes HTML in user-generated content
│       →
│       → exportUserTableData: Exports data to CSV
│       →   - Formats data for export
│       →   - Handles special characters
│       →   - Triggers browser download
│
├── user-table-types/
│   └── user-table-types.ts
│       → TUserTable: Core user data structure
│       →   - id: string (UUID)
│       →   - name: string
│       →   - email: string
│       →   - status: 'active' | 'inactive'
│       →   - role: 'admin' | 'user'
│       →   - createdAt: string (ISO format)
│       →   - updatedAt: string (ISO format)
│       →
│       → TUserTableProps: Main component props
│       →   - initialData?: TUserTable[]
│       →   - onRowClick?: (user: TUserTable) => void
│       →   - onAdd?: () => void
│       →
│       → TUserTableFilter: Filter configuration
│       →   - search?: string
│       →   - status?: 'active' | 'inactive' | 'all'
│       →   - dateFrom?: string
│       →   - dateTo?: string
│       →
│       → TUserTableSort: Sort configuration
│       →   - field: keyof TUserTable
│       →   - direction: 'asc' | 'desc'
│
├── user-table-constants/
│   └── user-table-constants.ts
│       → USER_TABLE_DEFAULT_PAGE_SIZE: 20
│       → USER_TABLE_MAX_PAGE_SIZE: 100
│       → USER_TABLE_REFRESH_INTERVAL: 30000 (30 seconds)
│       → USER_TABLE_SEARCH_DEBOUNCE: 500 (ms)
│       → USER_TABLE_SORT_OPTIONS: Array of sortable fields
│       → USER_TABLE_STATUS_OPTIONS: ['active', 'inactive']
│
└── index.ts
    → Public API exports:
    →   - UserTable (default export): Main component
    →   - useUserTable: Primary hook
    →   - TUserTable, TUserTableProps: Type exports
```

---

## Functions & Components

### useUserTable()

**Purpose**: Primary hook for managing user table data, fetching, and state management. Handles data fetching with automatic refresh, error handling, and caching.

**Parameters**:
- `initialData?: TUserTable[]` - Optional initial data to hydrate state before first fetch
- `options?: TUserTableOptions` - Configuration options
  - `refreshInterval?: number` - Auto-refresh interval in ms (default: 30000)
  - `enableRefresh?: boolean` - Enable auto-refresh (default: true)
  - `onError?: (error: Error) => void` - Error callback

**Returns**:
```typescript
{
  data: TUserTable[] | undefined        // Current user data array
  isLoading: boolean                    // True during initial fetch
  isFetching: boolean                   // True during any fetch (including refresh)
  error: Error | null                   // Error object if fetch fails
  refetch: () => Promise<void>          // Manual refetch function
  invalidate: () => void                // Invalidate cache, trigger refetch
}
```

**Side Effects**:
1. Fetches data from `/api/users` on mount
2. Sets up interval for auto-refresh every 30 seconds (if enabled)
3. Logs `user_table_loaded` event to PostHog on successful fetch
4. Logs `user_table_error` event to PostHog on error
5. Updates React Query cache with fetched data

**Example Usage**:
```typescript
// Basic usage
const { data, isLoading, error } = useUserTable()

// With initial data
const { data, isLoading } = useUserTable({ 
  initialData: serverSideData 
})

// With custom options
const { data, refetch } = useUserTable({
  options: {
    refreshInterval: 60000, // 1 minute
    onError: (error) => toast.error(error.message)
  }
})

// Manual refetch
<button onClick={refetch}>Refresh</button>
```

**Internal Logic**:
1. Initializes React Query with cache key `['users']`
2. Calls `getUsersQuery()` from database layer on mount
3. If initialData provided, uses it to hydrate cache immediately
4. Transforms response data using `transformUserData` utility
5. Updates internal state with transformed data
6. If auto-refresh enabled, sets up `setInterval` for periodic refetch
7. On error, catches exception and updates error state
8. Logs appropriate PostHog events based on success/failure
9. Cleanup: Clears interval on component unmount

**Dependencies**:
- `@tanstack/react-query` (v5.0.0) - Data fetching and caching
- `@/db/queries/user-table-queries` - `getUsersQuery` function
- `@/lib/posthog` - Event logging (`posthog.capture`)
- `../utils/user-table-utils` - `transformUserData` utility
- `../constants/user-table-constants` - Default values

**Error Handling**:
- Network errors: Retries 3 times with exponential backoff
- 401/403 errors: Redirects to login page
- 404 errors: Shows empty state
- 500 errors: Shows error message with retry button
- All errors logged to PostHog with context

**Performance**:
- Uses React Query caching (5-minute stale time)
- Debounces rapid refetch calls
- Memoizes transformed data
- Time complexity: O(n) for data transformation

---

### UserTableHeader

**Purpose**: Header component displaying title, search input, and action buttons. Manages search input state with debouncing to prevent excessive filtering.

**Props**:
```typescript
type TUserTableHeaderProps = {
  onSearch?: (query: string) => void  // Callback fired when search query changes (debounced)
  onAdd?: () => void                  // Callback fired when add button clicked
  title?: string                      // Optional custom title (default: "Users")
  showSearch?: boolean                // Show/hide search input (default: true)
  showAddButton?: boolean             // Show/hide add button (default: true)
}
```

**State**:
- `searchQuery: string` - Local search input value (controlled)
- `debouncedQuery: string` - Debounced search value (500ms delay)

**Events**:
- `onSearch(query: string)` - Emitted when debounced query changes (not on every keystroke)
- `onAdd()` - Emitted when add user button clicked

**Rendering Logic**:
1. Renders container div with flex layout
2. Displays title in h2 heading with proper typography
3. Renders search input (if showSearch = true):
   - Controlled input bound to searchQuery state
   - Shows search icon (magnifying glass)
   - Placeholder: "Search by name or email"
   - Clears on escape key
4. Shows add button (if showAddButton = true AND onAdd provided):
   - Icon: Plus symbol
   - Text: "Add User"
   - Primary button style
5. Applies responsive layout:
   - Mobile (< 768px): Stack vertically
   - Desktop (>= 768px): Horizontal row with space between

**PostHog Events**:
- `user_table_search_performed` - When debounced search executes
  - Properties: `{ query: string, resultCount: number }`
- `user_table_add_clicked` - When add button clicked
  - Properties: `{ timestamp: string }`

**Example Usage**:
```typescript
// Basic usage
<UserTableHeader 
  onSearch={(q) => setSearchQuery(q)} 
  onAdd={() => router.push('/users/new')} 
/>

// Custom title, no add button
<UserTableHeader 
  title="Team Members"
  onSearch={handleSearch}
  showAddButton={false}
/>

// Search only
<UserTableHeader 
  onSearch={handleSearch}
  showAddButton={false}
/>
```

**Accessibility**:
- Search input has `aria-label="Search users"`
- Add button has `aria-label="Add new user"`
- Keyboard navigation: Tab through controls
- Enter key in search triggers immediate search (bypasses debounce)

**Styling**:
- Uses Tailwind CSS classes
- Responsive breakpoints: sm, md, lg
- Dark mode support via `dark:` classes

---

### sortUserTableData()

**Purpose**: Sorts user array by specified field in ascending or descending order. Handles different data types (strings, dates, numbers) with appropriate comparison logic.

**Parameters**:
```typescript
function sortUserTableData(
  data: TUserTable[],                 // Array of users to sort
  field: keyof TUserTable,            // Field to sort by (name, email, createdAt, etc.)
  direction: 'asc' | 'desc' = 'asc'   // Sort direction (default: ascending)
): TUserTable[]
```

**Returns**:
- `TUserTable[]` - New sorted array (does not mutate input)

**Side Effects**:
- None (pure function)

**Example Usage**:
```typescript
// Sort by name ascending
const sorted = sortUserTableData(users, 'name', 'asc')

// Sort by creation date descending (newest first)
const sorted = sortUserTableData(users, 'createdAt', 'desc')

// Sort by email
const sorted = sortUserTableData(users, 'email')
```

**Internal Logic**:
1. Creates shallow copy of input array to avoid mutation
2. Determines data type of sort field:
   - If field is 'createdAt' or 'updatedAt': Date comparison
   - If field is 'name' or 'email': String comparison (case-insensitive)
   - Otherwise: Generic comparison
3. Applies JavaScript `.sort()` with custom comparator:
   - For strings: Converts to lowercase, uses `localeCompare`
   - For dates: Converts to timestamps, numeric comparison
   - For numbers: Direct numeric comparison
4. Reverses array if direction is 'desc'
5. Returns sorted array

**Dependencies**:
- None (vanilla JavaScript)

**Error Handling**:
- If field doesn't exist on objects: Returns original array unsorted
- If field values are null/undefined: Treats as empty string or 0
- Handles mixed types gracefully (converts to string for comparison)

**Performance**:
- Time complexity: O(n log n) - JavaScript native sort
- Space complexity: O(n) - Creates copy of array
- Optimized for arrays < 10,000 items

**Edge Cases**:
- Empty array: Returns empty array
- Single item: Returns same array
- All equal values: Maintains original order (stable sort)
- Null values: Sorted to end of array

---

## State Management

### Local Component State

**UserTableHeader**:
- `searchQuery: string` - Uncontrolled search input value
- `debouncedQuery: string` - Debounced version (500ms) used for actual filtering

**UserTableBody**:
- `selectedRows: Set<string>` - Set of selected user IDs for bulk operations
- `sortConfig: TUserTableSort` - Current sort field and direction

**UserTableFooter**:
- `currentPage: number` - Current pagination page (1-based)
- `pageSize: number` - Number of items per page (default: 20)

### Global State
- **None** - Feature is fully self-contained with no global state dependencies

### Server State (React Query)

**Cache Configuration**:
```typescript
{
  queryKey: ['users', filters],          // Cache key includes filters for proper invalidation
  staleTime: 5 * 60 * 1000,             // 5 minutes - data considered fresh
  cacheTime: 10 * 60 * 1000,            // 10 minutes - cache persists in memory
  refetchInterval: 30 * 1000,           // 30 seconds - auto-refetch interval
  refetchOnWindowFocus: true,           // Refetch when window gains focus
  refetchOnReconnect: true,             // Refetch when network reconnects
  retry: 3,                             // Retry failed requests 3 times
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000) // Exponential backoff
}
```

**Cache Invalidation**:
- Manual: `queryClient.invalidateQueries(['users'])`
- Automatic: After mutations (create, update, delete user)
- Automatic: On window focus if data is stale

### URL State (Query Params)

**Synced to URL**:
- `?search=query` - Current search query
- `?status=active|inactive` - Status filter
- `?page=2` - Current page number
- `?pageSize=50` - Items per page
- `?sortBy=name` - Sort field
- `?sortDir=asc` - Sort direction

**Benefits**:
- Shareable URLs with filters
- Browser back/forward navigation
- Bookmark specific views

---

## External Dependencies

### Production Dependencies

**React Ecosystem**:
- `react` (^18.2.0) - Component framework
  - **Why**: Core UI framework, required for all components
  - **Usage**: JSX, hooks (useState, useEffect, useCallback)

- `@tanstack/react-query` (^5.0.0) - Data fetching and caching
  - **Why**: Robust data fetching with caching, auto-refresh, and error handling
  - **Usage**: `useQuery` hook in `useUserTable`
  - **Alternative considered**: SWR (chose React Query for better TypeScript support)

**Validation & Types**:
- `zod` (^3.22.4) - Schema validation
  - **Why**: Runtime type validation for API responses
  - **Usage**: Schema definition in `user-table-types.ts`
  - **Validates**: API response shape, user input

**Date Handling**:
- `date-fns` (^2.30.0) - Date manipulation and formatting
  - **Why**: Consistent date formatting (dd/mm/yyyy), no mutation, tree-shakeable
  - **Usage**: `formatDate` utility function
  - **Functions used**: `format`, `parseISO`, `isValid`

**Analytics**:
- `posthog-js` (^1.96.0) - Product analytics
  - **Why**: Required for user behavior tracking
  - **Usage**: Event logging throughout feature
  - **Events tracked**: 12 different user interactions

### Internal Dependencies

**UI Components** (`@/components/ui/`):
- `button` - Generic button component
  - Used in: Header (add button), Row (action buttons), Footer (pagination)
- `input` - Generic input component
  - Used in: Header (search input)
- `badge` - Status badge component
  - Used in: Row (status indicator)
- `skeleton` - Loading skeleton
  - Used in: Skeleton component
- `table` - Generic table wrapper
  - Used in: Body component

**Utilities** (`@/lib/`):
- `utils.ts` - Utility functions
  - `cn()`: className merging with Tailwind
  - `formatDate()`: Date formatting helper
- `posthog.ts` - PostHog client instance
  - Pre-configured with project API key

**Database** (`@/db/queries/`):
- `user-table-queries.ts` - Database query functions
  - `getUsersQuery()`: Fetch all users
  - `getUserByIdQuery()`: Fetch single user
  - `searchUsersQuery()`: Search users

### Development Dependencies

**Testing**:
- `@testing-library/react` (^14.0.0) - Component testing
- `@testing-library/user-event` (^14.5.0) - User interaction simulation
- `vitest` (^1.0.0) - Test runner

**Type Checking**:
- `typescript` (^5.2.0) - Type safety
- `@types/react` (^18.2.0) - React types

### Why These Dependencies?

**React Query over fetch**:
- Built-in caching reduces API calls
- Automatic retry logic
- Loading/error states handled
- Optimistic updates support

**Zod over manual validation**:
- Type-safe runtime validation
- Automatic TypeScript type inference
- Composable schemas
- Better error messages

**date-fns over Moment.js**:
- Immutable (no mutation bugs)
- Tree-shakeable (smaller bundle)
- Modern API
- Better TypeScript support

---

## Usage Examples

### 1. Basic Usage

Display user table with all default settings:

```typescript
import { UserTable } from '@/features/user-table'

export default function UsersPage() {
  return (
    <div className="container mx-auto py-8">
      <UserTable />
    </div>
  )
}
```

### 2. With Initial Server-Side Data

Hydrate with server-fetched data for faster initial render:

```typescript
import { UserTable } from '@/features/user-table'
import { getUsersQuery } from '@/db/queries/user-table-queries'

export default async function UsersPage() {
  // Fetch on server
  const initialData = await getUsersQuery()

  return (
    <div className="container mx-auto py-8">
      <UserTable initialData={initialData} />
    </div>
  )
}
```

### 3. With Custom Event Handlers

Handle user interactions with custom logic:

```typescript
'use client'

import { UserTable } from '@/features/user-table'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function UsersPage() {
  const router = useRouter()

  const handleRowClick = (user) => {
    router.push(`/users/${user.id}`)
  }

  const handleAddUser = () => {
    router.push('/users/new')
  }

  return (
    <div className="container mx-auto py-8">
      <UserTable 
        onRowClick={handleRowClick}
        onAdd={handleAddUser}
      />
    </div>
  )
}
```

### 4. Custom Configuration

Customize refresh interval and error handling:

```typescript
'use client'

import { UserTable } from '@/features/user-table'
import { toast } from 'sonner'

export default function UsersPage() {
  return (
    <div className="container mx-auto py-8">
      <UserTable 
        options={{
          refreshInterval: 60000, // 1 minute
          enableRefresh: true,
          onError: (error) => {
            toast.error('Failed to load users', {
              description: error.message
            })
          }
        }}
      />
    </div>
  )
}
```

### 5. With Search and Filter Persistence

Persist filters in URL for shareable links:

```typescript
'use client'

import { UserTable, useUserTableFilters } from '@/features/user-table'
import { useSearchParams, useRouter } from 'next/navigation'

export default function UsersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize filters from URL
  const initialFilters = {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
  }

  const handleFiltersChange = (filters) => {
    // Update URL with new filters
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status !== 'all') params.set('status', filters.status)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="container mx-auto py-8">
      <UserTable 
        initialFilters={initialFilters}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  )
}
```

---

## Testing Guidelines

### Unit Tests Required For

**Utility Functions** (`user-table-utils.test.ts`):
- `sortUserTableData()`
  - Test ascending/descending sort
  - Test different field types (string, date, number)
  - Test edge cases (empty array, null values)
- `filterUserTableData()`
  - Test search query matching
  - Test status filtering
  - Test combined filters
- `validateUserTableInput()`
  - Test email validation
  - Test required fields
  - Test error messages

**Custom Hooks** (`user-table-hooks.test.ts`):
- `useUserTable()`
  - Test initial data loading
  - Test auto-refresh behavior
  - Test error handling
  - Test manual refetch
- `useUserTableFilters()`
  - Test filter state management
  - Test filter validation
  - Test URL persistence

### Integration Tests Required For

**Component Interactions** (`user-table.test.tsx`):
- Search functionality
  - Type in search input
  - Verify debounce (500ms)
  - Verify filtered results
- Sorting
  - Click column headers
  - Verify sort direction toggle
  - Verify sorted data
- Pagination
  - Navigate between pages
  - Change page size
  - Verify correct data displayed
- Row actions
  - Click view button
  - Click edit button
  - Click delete button with confirmation

**Error Scenarios**:
- Network error during fetch
- 401 unauthorized
- 404 not found
- 500 server error

### Test Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Test Files Structure

```
user-table/
├── __tests__/
│   ├── user-table-utils.test.ts      # Utility function tests
│   ├── user-table-hooks.test.ts      # Hook behavior tests
│   ├── user-table-header.test.tsx    # Header component tests
│   ├── user-table-row.test.tsx       # Row component tests
│   └── user-table.integration.test.tsx # Integration tests
└── __mocks__/
    └── user-table-data.ts             # Mock data for tests
```

### Example Test

```typescript
// user-table-utils.test.ts
import { describe, it, expect } from 'vitest'
import { sortUserTableData } from '../utils/user-table-utils'
import { mockUsers } from '../__mocks__/user-table-data'

describe('sortUserTableData', () => {
  it('should sort by name ascending', () => {
    const sorted = sortUserTableData(mockUsers, 'name', 'asc')
    expect(sorted[0].name).toBe('Alice')
    expect(sorted[sorted.length - 1].name).toBe('Zoe')
  })

  it('should sort by date descending', () => {
    const sorted = sortUserTableData(mockUsers, 'createdAt', 'desc')
    expect(new Date(sorted[0].createdAt) > new Date(sorted[1].createdAt)).toBe(true)
  })

  it('should handle empty array', () => {
    const sorted = sortUserTableData([], 'name', 'asc')
    expect(sorted).toEqual([])
  })
})
```

---

## Known Issues & Limitations

### Current Limitations

1. **Client-Side Search Only**
   - Search filters data in browser, not on server
   - Performance degrades with > 1000 users
   - **Planned**: Server-side search in v2.0
   - **Workaround**: Use pagination to limit dataset size

2. **No Bulk Operations**
   - Can only perform actions on one user at a time
   - No bulk delete, bulk status change, etc.
   - **Planned**: Bulk operations in v1.3.0
   - **Workaround**: Use database admin tools for bulk changes

3. **Fixed Page Sizes**
   - Page size options: 10, 20, 50, 100
   - No custom page size input
   - **Planned**: Custom page size in v1.4.0

4. **No Export Functionality**
   - Cannot export user list to CSV/Excel
   - **Planned**: Export feature in v1.5.0
   - **Workaround**: Use browser's "Save As" on table

5. **Limited Sort Options**
   - Can only sort by one column at a time
   - No multi-column sorting
   - **Planned**: Multi-column sort in v2.0

### Browser Compatibility

**Fully Supported**:
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

**Partially Supported**:
- Internet Explorer: Not supported ❌ (uses modern JavaScript features)
- Safari < 14: Missing some CSS features (still functional)

### Performance Notes

**Optimal Performance**:
- Datasets < 1000 items: Excellent (< 100ms render)
- Datasets 1000-5000 items: Good (100-300ms render)
- Datasets > 5000 items: Consider server-side pagination

**Performance Tips**:
1. Use virtualization for large lists (react-window)
2. Enable server-side pagination for > 1000 items
3. Disable auto-refresh for very large datasets
4. Use memoization for expensive calculations

**Known Performance Issues**:
- Initial load with > 2000 items can take 500-1000ms
- Sorting large datasets (> 5000 items) may cause UI freeze
- Search with complex filters can be slow on mobile devices

### Security Considerations

**Data Exposure**:
- User email addresses are visible to all admin users
- Consider role-based filtering if needed

**XSS Protection**:
- All user-generated content is sanitized
- Uses React's built-in XSS protection

**CSRF Protection**:
- All mutations require CSRF token
- Handled by framework automatically

---

## Change Log

### [1.2.0] - 2025-10-02
**Added**:
- Search functionality with 500ms debounce
- Server-side pagination support
- PostHog analytics integration (12 events)
- Loading skeleton component
- Error boundary for graceful error handling

**Changed**:
- Increased default page size from 10 to 20
- Updated date format to dd/mm/yyyy (was mm/dd/yyyy)
- Improved TypeScript types with stricter validation

**Fixed**:
- Memory leak in useEffect cleanup (auto-refresh)
- Race condition in search debounce
- Sort direction not toggling correctly
- Pagination reset when filters change

### [1.1.0] - 2025-09-15
**Added**:
- Bulk selection feature (not yet functional)
- Status filter dropdown
- Empty state component
- Dark mode support

**Changed**:
- Migrated from Redux to React Query for state
- Refactored components to be more modular
- Improved accessibility (ARIA labels, keyboard nav)

**Fixed**:
- Table not responsive on mobile
- Search not clearing on escape key
- Date formatting inconsistencies

### [1.0.0] - 2025-09-01
**Added**:
- Initial release
- Basic CRUD operations (view, create, edit, delete)
- Client-side filtering and sorting
- Pagination support
- User table display with all fields

---

## Migration Notes

### Upgrading from 1.0.0 to 1.1.0

**Breaking Changes**:
- Redux store removed, now uses React Query
- Component props changed (removed `dispatch` prop)

**Migration Steps**:
1. Remove Redux provider from app
2. Install `@tanstack/react-query`
3. Wrap app with `QueryClientProvider`
4. Update imports: `useSelector` → `useUserTable`
5. Remove dispatch calls, use returned functions instead

**Example**:
```typescript
// Before (v1.0.0)
const users = useSelector(state => state.users.data)
dispatch(fetchUsers())

// After (v1.1.0)
const { data: users, refetch } = useUserTable()
refetch()
```

### Upgrading from 1.1.0 to 1.2.0

**No Breaking Changes** ✅

**New Features**:
- Search functionality now available
- PostHog events automatically tracked

**Recommended Actions**:
1. Configure PostHog API key in environment variables
2. Update UI to include search input
3. Review analytics dashboard for new events

---

## Future Roadmap

### Version 1.3.0 (Q1 2026)
- [ ] Bulk operations (delete, status change)
- [ ] Advanced filters (date range, role)
- [ ] Column visibility customization

### Version 1.4.0 (Q2 2026)
- [ ] Export to CSV/Excel
- [ ] Custom page size input
- [ ] Saved filter presets

### Version 2.0.0 (Q3 2026)
- [ ] Server-side search and filtering
- [ ] Multi-column sorting
- [ ] Real-time updates via WebSockets
- [ ] User activity timeline
- [ ] Enhanced mobile experience

---

## Support & Troubleshooting

### Common Issues

**1. Data Not Loading**
- Check network tab for API errors
- Verify user has admin role
- Check database connection
- Review console for errors

**2. Search Not Working**
- Wait for 500ms debounce
- Check search query format
- Verify data contains searchable fields

**3. Pagination Broken**
- Check total count from API
- Verify page size setting
- Review URL query params

### Debug Mode

Enable debug logging:
```typescript
<UserTable 
  options={{ 
    debug: true  // Logs all state changes and events
  }} 
/>
```

### Getting Help

1. Check console for error messages
2. Enable debug mode for detailed logs
3. Review PostHog events for user flow
4. Contact development team with:
   - Error message
   - Steps to reproduce
   - Browser and OS version
   - Screenshot/recording

---

**Last Updated**: 2025-10-02  
**Maintained By**: Frontend Team  
**Version**: 1.2.0

