# Catalogs Table Feature Documentation

## Overview

The Catalogs Table feature provides a comprehensive data table interface for viewing and managing catalog records in the LifePass Admin application. It displays catalog information including IDs, resort associations, versions, and timestamps with advanced filtering, sorting, and pagination capabilities.

**Purpose**: Enable efficient viewing and management of catalog data with a responsive, feature-rich table interface

**Key Functionality**:
- Display catalog records in a sortable, filterable table
- Advanced filtering by multiple criteria
- Responsive mobile layout
- Data pagination
- Cache revalidation/refresh
- Export functionality
- Resort-specific catalog views

**User Interactions**:
- Sort by any column (ID, Resort ID, Version, Created At, Updated At)
- Filter data using advanced filter panel
- Navigate through pages of catalog data
- Refresh data to fetch latest changes
- Export catalog data
- View optimized columns on mobile devices

**Business Logic**:
- Integrates with Next.js cache revalidation for data freshness
- Resort context integration for resort-specific views
- Mobile-optimized column visibility
- Server-side data fetching with client-side rendering
- Persistent refresh state in localStorage

**Integration Points**:
- `@/db/schema` - Catalog data type definitions
- `@/features/resorts` - Resort context for filtering
- `@/components/data-table
- `@/hooks/use-data-table` - Table state management
- `@/hooks/use-mobile` - Responsive detection
- Next.js `revalidateTag` - Cache invalidation

---

## File Tree

```
catalogs-table/
├── catalogs-table-components/
│   ├── catalogs-table-component.tsx
│   │   → Server component wrapper (main entry point)
│   │   → Handles all data fetching internally
│   │   → Accepts resortName and searchParams props
│   │   → Fetches catalog data from database
│   │   → Validates filters and parses search params
│   │   → Passes data to client component
│   │   → Makes feature fully portable
│   │
│   ├── catalogs-table-client.tsx
│   │   → Client-side table component
│   │   → Manages table state and configuration
│   │   → Integrates with resort context
│   │   → Handles responsive layout
│   │   → Uses React.use() to unwrap promises
│   │   → Memoizes columns for performance
│   │   → Configures universal data table wrapper
│   │   → Handles all interactive table features
│   │
│   ├── catalogs-table-columns.tsx
│   │   → Column definitions for TanStack Table
│   │   → Defines column structure and metadata
│   │   → Configures filtering options for each column
│   │   → Handles date formatting for timestamps
│   │   → Implements mobile column filtering
│   │   → Includes commented future columns (products, categories)
│   │
│   └── index.ts
│       → Public API exports for components
│       → Exports CatalogsTable, CatalogsTableClient, and getCatalogsTableColumns
│
├── catalogs-table-types/
│   └── catalogs-table-types.ts
│       → TCatalogsTableProps: Main component props
│       → TCatalogsTableColumnsProps: Column function props
│       → TCatalogsTableColumns: Column definitions array type
│       → TCatalog: Re-exported Catalog type for convenience
│
├── index.ts
│   → Main feature entry point
│   → Exports all components and types
│   → Public API for external consumption
│
└── catalogs-table-docs.md
    → Comprehensive feature documentation (this file)
```

---

## Functions & Components

### CatalogsTable

**Purpose**: Server component wrapper that handles all data fetching internally, making the feature completely portable

**Type**: React Server Component (async function)

**Props**:
- `resortName: string | Promise<string>` - Name of the resort to fetch catalogs for (supports Next.js 15+ async params)
- `searchParams: Promise<SearchParams>` - URL search parameters for filtering, sorting, and pagination

**Returns**: Promise resolving to the catalogs table component

**Side Effects**:
1. Parses and validates search parameters
2. Fetches resort ID from resort name
3. Fetches catalog data from database with filters and pagination
4. Caches data with 1-hour revalidation
5. Passes data to client component

**Dependencies**:
- `@/db/server-actions/catalog-actions/db-get-catalog-by-resort-id` - Database query function
- `@/features/resorts/resort-utils` - Resort utilities (getResortIdFromName)
- `@/components/data-table` - Filter validation utilities
- `@/lib/search-params` - Search params parsing
- `./catalogs-table-client` - Client table component

**Example Usage**:

```tsx
// In any server component page (Next.js 15+)
import { CatalogsTable } from '@/features/catalogs-table'
import { type SearchParams } from '@/types/index'

export default async function CatalogsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<SearchParams>
  params: Promise<{ resortName: string }>
}) {
  // In Next.js 15+, params must be awaited
  const { resortName } = await params
  
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Catalogs</h1>
        <p className="text-muted-foreground">
          Manage and view catalog records
        </p>
      </div>
      
      {/* Just import and use - data fetching handled internally */}
      <CatalogsTable 
        resortName={resortName}
        searchParams={searchParams}
      />
    </div>
  )
}
```

**Internal Logic**:

1. **Search Params Processing**:
   - Parses search params using searchParamsCache
   - Validates filters to ensure they match table schema
   - Extracts pagination, sorting, and filter configuration

2. **Resort Resolution**:
   - Gets resort ID from resort name
   - Validates resort exists
   - Uses cached resort data for performance

3. **Data Fetching**:
   - Calls dbGetCatalogs with all search parameters
   - Applies filters, sorting, and pagination
   - Returns paginated data and page count

4. **Component Rendering**:
   - Passes fetched data to CatalogsTableClient
   - Client component handles interactive features

**Portability**:
This component is designed to be fully portable. To use in another project:
1. Copy the entire catalogs-table feature folder
2. Ensure target project has:
   - Same database schema (catalogs table)
   - Resort utilities (getResortIdFromName)
   - Search params utilities (searchParamsCache)
   - Data table components
3. Import and use - no additional configuration needed

**Performance Considerations**:
- Data fetched server-side for optimal performance
- Cached with 1-hour revalidation
- Search params validated before database query
- Resort ID lookup cached

**PostHog Events**: None (uses console logging in dbGetCatalogs)

---

### CatalogsTableClient

**Purpose**: Client component that renders the interactive table with all UI features

**Type**: React Client Component

**Props**:
- `promises: Promise<[{ data: Catalog[]; pageCount: number }]>` - Promise that resolves to catalog data and pagination info

**Returns**: React component rendering the catalogs table

**State**:
- `_rowAction` - Row action state for future row-level operations (currently unused)
- Table state managed by `useDataTable` hook
- Columns memoized based on resort and mobile state

**Side Effects**:
1. Subscribes to resort context for resort-specific data
2. Detects mobile viewport for responsive column filtering
3. Unwraps promises using React.use() (React 18+ feature)
4. Memoizes columns to prevent unnecessary recalculations
5. Persists refresh timestamp in localStorage ('catalogsLastRefreshed')

**Dependencies**:
- `react` - React hooks (useState, useMemo, use)
- `@/db/schema` - Catalog type definition
- `@/features/resorts` - useResort hook for context
- `@/hooks/use-data-table` - Table state management
- `@/hooks/use-mobile` - Mobile detection hook
- `@/components/data-table` - Universal table components
- `@tanstack/react-table` - Table library (via useDataTable)

**Example Usage**:

```tsx
// Typically used by the CatalogsTable server component
// Not meant to be used directly in pages
import { CatalogsTableClient } from '@/features/catalogs-table'

const data = await fetchCatalogs()
const promises = Promise.resolve([data])

<CatalogsTableClient promises={promises} />
```

**Internal Logic**:

1. **Component Mount**:
   - Gets current resort from context
   - Detects if viewport is mobile
   - Unwraps promises to get data and page count

2. **Column Configuration**:
   - Memoizes column definitions based on mobile state
   - Passes resort name to column generator (for future filtering)
   - Recalculates only when mobile state or resort changes

3. **Table Setup**:
   - Configures table with data, columns, and page count
   - Enables advanced filtering
   - Sets up row ID generation for unique keys
   - Uses shallow comparison for performance
   - Clears filters on default view

4. **Rendering**:
   - Wraps table in UniversalDataTableWrapper
   - Provides no-op revalidation callback
   - Configures export filename
   - Sets localStorage key for refresh state

**Performance Considerations**:
- Columns memoized to prevent recalculation on every render
- Shallow comparison enabled for better table performance
- Data fetched server-side and streamed to client
- Mobile column filtering reduces render overhead

**PostHog Events**: None (uses console logging)

---

### getCatalogsTableColumns

**Purpose**: Generate column definitions for the catalogs table with filtering and sorting

**Type**: Function

**Parameters**:
- `setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<Catalog> | null>>` - Callback to set row action (currently unused)
- `isMobile: boolean` - Whether the viewport is mobile (filters columns)
- `resort?: string` - Optional resort name for filtering (currently unused)

**Returns**: `ColumnDef<Catalog>[]` - Array of TanStack Table column definitions

**Column Definitions**:

1. **ID Column**
   - Accessor: `id`
   - Type: Text
   - Filterable: Yes (text filter)
   - Sortable: Yes
   - Mobile: Visible

2. **Resort ID Column**
   - Accessor: `resortId`
   - Type: Number
   - Filterable: Yes (number filter)
   - Sortable: Yes
   - Mobile: Visible

3. **Version Column**
   - Accessor: `version`
   - Type: Number
   - Filterable: Yes (number filter)
   - Sortable: Yes
   - Mobile: Hidden

4. **Created At Column**
   - Accessor: `createdAt`
   - Type: Date
   - Filterable: Yes (date filter)
   - Sortable: Yes
   - Format: `YYYY-MM-DD HH:MM`
   - Mobile: Visible

5. **Updated At Column**
   - Accessor: `updatedAt`
   - Type: Date
   - Filterable: Yes (date filter)
   - Sortable: Yes
   - Format: `YYYY-MM-DD HH:MM`
   - Mobile: Hidden

**Example Usage**:

```tsx
import { getCatalogsTableColumns } from '@/features/catalogs-table'

const columns = getCatalogsTableColumns({
  setRowAction: (action) => console.log(action),
  isMobile: false,
  resort: 'mountain-resort'
})

// Use with TanStack Table
const table = useReactTable({
  data: catalogsData,
  columns,
  // ... other config
})
```

**Internal Logic**:

1. **Column Definition**:
   - Creates array of column definition objects
   - Each column has accessor key, header, and metadata
   - Date columns include custom cell renderer for formatting

2. **Date Formatting**:
   - Converts string or Date to Date object
   - Formats as ISO string split into date and time
   - Handles invalid dates with fallback text

3. **Mobile Filtering**:
   - Desktop: Shows all columns
   - Mobile: Shows first 2 columns + createdAt column
   - Filters array using index-based logic

4. **Filter Configuration**:
   - Each column has FilterableColumnMeta
   - Specifies filter type (text, number, date)
   - Provides label and placeholder text

**Future Enhancements** (Commented Code):
- Products Data column (array of SkiDataProduct)
- Consumer Categories column (array of SkiDataConsumerCategory)
- Validity Categories column (array of SkidataValidityCategory)

---

## Type Definitions

### TCatalogsTableProps

**Purpose**: Props type for the CatalogsTable component

**Properties**:
- `promises: Promise<[{ data: Catalog[]; pageCount: number }]>` - Promise resolving to catalog data

**Usage**:
```typescript
const props: TCatalogsTableProps = {
  promises: Promise.resolve([{
    data: catalogsArray,
    pageCount: 10
  }])
}
```

---

### TCatalogsTableColumnsProps

**Purpose**: Props type for getCatalogsTableColumns function

**Properties**:
- `setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<Catalog> | null>>` - Row action state setter
- `isMobile: boolean` - Mobile viewport flag
- `resort?: string` - Optional resort name

**Usage**:
```typescript
const props: TCatalogsTableColumnsProps = {
  setRowAction: (action) => setState(action),
  isMobile: false,
  resort: 'mountain-resort'
}
```

---

### TCatalogsTableColumns

**Purpose**: Type alias for array of column definitions

**Type**: `ColumnDef<Catalog>[]`

**Usage**:
```typescript
const columns: TCatalogsTableColumns = getCatalogsTableColumns(props)
```

---

### TCatalog

**Purpose**: Re-exported Catalog type for convenience

**Type**: `Catalog` (from @/db/schema)

**Usage**:
```typescript
const catalog: TCatalog = {
  id: 'cat_123',
  resortId: 1,
  version: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  // ... other fields
}
```

---

## State Management

### Component State

**CatalogsTable Component**:
- `_rowAction` - Row action state (DataTableRowAction<Catalog> | null)
  - Currently unused
  - Available for future row-level operations (edit, delete, etc.)
  - Managed by useState

**Table State** (managed by useDataTable):
- `data` - Catalog records array
- `columns` - Column definitions (memoized)
- `pageCount` - Total pages for pagination
- `columnFilters` - Active filter state
- `sorting` - Active sort state
- `pagination` - Current page and page size

### Context State

- **Resort Context** (from useResort):
  - Current resort object
  - Used for resort-specific catalog filtering

### Local Storage

- **catalogsLastRefreshed** - Timestamp of last manual refresh
  - Persisted by UniversalDataTableWrapper
  - Used for refresh cooldown/indication

### Server State

- Catalog data fetched server-side
- Cached with 'catalogs' tag in Next.js cache
- Revalidated via revalidateCatalogs action

---

## External Dependencies

### Production Dependencies

**react** (^18.2.0)
- **Purpose**: Component framework and hooks
- **Usage**: useState, useMemo, use (promise unwrapping)
- **Why**: Core framework for building the table component

**@tanstack/react-table** (^8.10.0)
- **Purpose**: Headless table library
- **Usage**: Column definitions, table state management
- **Why**: Provides powerful table features (sorting, filtering, pagination)

**next** (^14.0.0)
- **Purpose**: Next.js framework
- **Usage**: revalidateTag for cache management
- **Why**: Server-side caching and revalidation

### Internal Dependencies

**@/db/schema**
- **Purpose**: Database type definitions
- **Usage**: Catalog type
- **Why**: Type-safe catalog data structure

**@/features/resorts**
- **Purpose**: Resort context
- **Usage**: useResort hook
- **Why**: Resort-specific catalog filtering

**@/components/data-table
- **Purpose**: Universal table components
- **Usage**: UniversalDataTableWrapper, UniversalDataTable, DataTableColumnHeader
- **Why**: Consistent table UI across application

**@/hooks/use-data-table**
- **Purpose**: Table state management hook
- **Usage**: Configure table state and behavior
- **Why**: Abstracts TanStack Table configuration

**@/hooks/use-mobile**
- **Purpose**: Mobile detection hook
- **Usage**: Responsive column filtering
- **Why**: Optimize table for mobile devices

**@/types**
- **Purpose**: Shared type definitions
- **Usage**: DataTableRowAction, FilterableColumnMeta
- **Why**: Type consistency across features

---

## Usage Examples

### Basic Usage (Recommended)

```tsx
// app/admin/[resortName]/settings/catalogs/page.tsx
import { CatalogsTable } from '@/features/catalogs-table'
import { type SearchParams } from '@/types/index'

export default async function CatalogsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<SearchParams>
  params: Promise<{ resortName: string }>
}) {
  // In Next.js 15+, params must be awaited
  const { resortName } = await params
  
  return (
    <div>
      <h1>Catalogs</h1>
      {/* That's it! Data fetching handled internally */}
      <CatalogsTable 
        resortName={resortName}
        searchParams={searchParams}
      />
    </div>
  )
}
```

### With Custom Layout

```tsx
// app/admin/[resortName]/settings/catalogs/page.tsx
import { CatalogsTable } from '@/features/catalogs-table'
import { type SearchParams } from '@/types/index'
import Header from '@/components/layouts/Header'

export default async function CatalogsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<SearchParams>
  params: Promise<{ resortName: string }>
}) {
  // In Next.js 15+, params must be awaited
  const { resortName } = await params

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex w-full flex-col justify-between py-4 md:flex-row">
        <Header
          breadcrumbItems={[
            {
              label: "Catalogs",
              isLink: false,
              href: "/settings/catalogs",
            },
          ]}
        />
      </div>

      <div className="w-full">
        <CatalogsTable 
          resortName={resortName}
          searchParams={searchParams}
        />
      </div>
    </div>
  )
}
```

### Type-Safe Usage

```tsx
import { 
  CatalogsTable,
  type TCatalog 
} from '@/features/catalogs-table'
import { type SearchParams } from '@/types/index'

// Type-safe page props
interface CatalogsPageProps {
  searchParams: Promise<SearchParams>
  params: Promise<{ resortName: string }>
}

export default async function CatalogsPage({
  searchParams,
  params,
}: CatalogsPageProps) {
  // In Next.js 15+, params must be awaited
  const { resortName } = await params
  
  return (
    <div>
      <h1>Catalogs</h1>
      <CatalogsTable 
        resortName={resortName}
        searchParams={searchParams}
      />
    </div>
  )
}

// Type-safe catalog data
const catalog: TCatalog = {
  id: 'cat_123',
  resortId: 1,
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

### Direct Client Component Usage (Advanced)

```tsx
// If you need to use the client component directly with custom data fetching
'use client'

import { CatalogsTableClient } from '@/features/catalogs-table'

export function CustomCatalogsTable() {
  // Your custom data fetching logic
  const promises = Promise.all([
    fetchCustomCatalogData()
  ])

  return <CatalogsTableClient promises={promises} />
}
```

### Custom Column Configuration (Advanced)

```tsx
import { getCatalogsTableColumns } from '@/features/catalogs-table'
import type { TCatalogsTableColumnsProps } from '@/features/catalogs-table'

export function CustomCatalogsTable() {
  const [rowAction, setRowAction] = useState(null)
  const isMobile = useIsMobile()

  const columns = getCatalogsTableColumns({
    setRowAction,
    isMobile,
    resort: 'custom-resort'
  })

  // Use columns with custom table configuration
  // ...
}
```

---

## Testing Guidelines

### Unit Tests Required For

**getCatalogsTableColumns Function**:
- Returns correct number of columns for desktop
- Returns filtered columns for mobile (3 columns)
- Each column has correct accessor key
- Each column has filterable metadata
- Date columns format dates correctly
- Date columns handle invalid dates gracefully
- Unused parameters don't cause errors

### Integration Tests Required For

**CatalogsTable Component**:
- Renders without crashing
- Displays correct number of rows
- Handles empty data gracefully
- Responds to resort context changes
- Adjusts columns for mobile viewport
- Handles promise unwrapping correctly
- Integrates with UniversalDataTableWrapper
- Persists state to localStorage

### Component Tests

**CatalogsTable Component**:
- Renders table headers
- Renders data rows
- Sorts columns correctly
- Filters data correctly
- Paginate through data
- Exports data functionality
- Mobile layout renders correctly

### Mocking Requirements

```typescript
// Mock resort context
jest.mock('@/features/resorts', () => ({
  useResort: jest.fn(() => ({
    resort: {
      name: 'Test Resort',
      id: 1
    }
  }))
}))

// Mock mobile detection
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false)
}))

// Mock data table hook
jest.mock('@/hooks/use-data-table', () => ({
  useDataTable: jest.fn(() => ({
    table: mockTable
  }))
}))

```

### Test Files

- `catalogs-table-component.test.tsx` - Component behavior tests
- `catalogs-table-columns.test.tsx` - Column generation tests
- `catalogs-table-types.test.ts` - Type validation tests (if needed)

### Example Test

```typescript
import { render, screen } from '@testing-library/react'
import { CatalogsTable } from './catalogs-table-component'

const mockData = [
  {
    id: 'cat_1',
    resortId: 1,
    version: 1,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }
]

describe('CatalogsTable', () => {
  it('should render table with data', async () => {
    const promises = Promise.resolve([{
      data: mockData,
      pageCount: 1
    }])

    render(<CatalogsTable promises={promises} />)

    // Wait for data to load
    expect(await screen.findByText('cat_1')).toBeInTheDocument()
  })

  it('should show mobile columns on mobile', () => {
    const { container } = render(
      <CatalogsTable promises={mockPromises} />
    )

    const headers = container.querySelectorAll('th')
    expect(headers).toHaveLength(3) // ID, Resort ID, Created At
  })
})
```

---

## Known Issues & Limitations

### Current Limitations

1. **Row Actions Not Implemented**: Row-level actions (edit, delete, view details) are prepared but not yet implemented
2. **Future Columns Commented**: Product data, consumer categories, and validity categories columns are commented out
3. **No Inline Editing**: Users cannot edit catalog data directly in the table
4. **No Bulk Operations**: No support for bulk select/delete/update operations
5. **Limited Export Options**: Only basic CSV export, no JSON/Excel options

### Browser Compatibility

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Performance Notes

- Optimal for datasets < 1000 items per page
- Large datasets may benefit from server-side pagination
- Date formatting runs on every render (could be optimized with memo)
- Column memoization prevents most unnecessary re-renders

### Known Issues

None at this time.

---

## Security Considerations

### Data Access

- Catalog data should be protected by authentication middleware
- Ensure users have proper permissions to view catalogs
- Resort-specific filtering should be enforced server-side

### Cache Security

- Cache tags ('catalogs') are server-side only
- revalidateTag is a server action (cannot be called directly from untrusted client)

### Recommendations

- Implement row-level security in database queries
- Add audit logging for catalog views/exports
- Rate-limit refresh/revalidation actions
- Validate resort context before displaying data

---

## Troubleshooting

### Table Not Rendering

**Problem**: Table doesn't appear or shows no data

**Solutions**:
1. Check if promises resolve correctly
2. Verify data format matches expected structure
3. Check browser console for errors
4. Ensure resort context is available
5. Verify database connection and query

### Columns Not Filtering Correctly

**Problem**: Filters don't work or filter wrong data

**Solutions**:
1. Check FilterableColumnMeta configuration
2. Verify filter types match column data types
3. Ensure advanced filtering is enabled
4. Check for console errors in filter components

### Mobile Layout Not Working

**Problem**: Mobile view shows all columns instead of filtered set

**Solutions**:
1. Verify useIsMobile hook is working
2. Check mobile breakpoint configuration
3. Test with different viewport sizes
4. Check for CSS conflicts

### Data Not Updating

**Problem**: Table doesn't show latest data

**Solutions**:
1. Check if data is being fetched correctly server-side
2. Verify promises are resolving with correct data
3. Check if page is being revalidated after mutations
4. Ensure database queries are not cached incorrectly

---

## Future Enhancements

### Planned Features

1. **Row Actions**
   - Edit catalog in modal
   - Delete catalog with confirmation
   - View full catalog details
   - Duplicate catalog

2. **Additional Columns**
   - Products data display
   - Consumer categories display
   - Validity categories display
   - Custom fields

3. **Bulk Operations**
   - Bulk select rows
   - Bulk delete catalogs
   - Bulk export selected
   - Bulk update fields

4. **Advanced Features**
   - Inline editing
   - Column reordering
   - Column visibility toggle
   - Saved filter presets
   - Custom column widths

5. **Export Options**
   - Export to JSON
   - Export to Excel
   - Export with custom fields
   - Scheduled exports

6. **Performance**
   - Virtual scrolling for large datasets
   - Optimized date formatting
   - Lazy loading of nested data
   - Web worker for data processing

### Contribution Guidelines

When extending this feature:
1. ✅ Follow the catalogs-table- prefix naming convention
2. ✅ Add comprehensive JSDoc comments
3. ✅ Update this documentation file
4. ✅ Add TypeScript types to catalogs-table-types.ts
5. ✅ Ensure feature remains portable
6. ✅ Add tests for new functionality
7. ✅ Update the change log
8. ✅ Consider mobile responsiveness

---

## Change Log

### [1.1.1] - 2025-10-02

**Next.js 15 Compatibility Fix**
- ✅ Fixed async params compatibility for Next.js 15+
- ✅ Updated page to await `params` before destructuring
- ✅ Made `resortName` prop accept `string | Promise<string>`
- ✅ Updated all documentation examples to show awaited params
- ✅ Component now automatically handles both sync and async params

**Migration Guide**:
```tsx
// Update your page props
interface CatalogsPageProps {
  searchParams: Promise<SearchParams>
  params: Promise<{ resortName: string }> // ← Changed from { resortName: string }
}

// Await params before using
const { resortName } = await params // ← Add await
```

**Fixed Runtime Error**:
```
Error: Route used `params.resortName`. `params` should be awaited 
before using its properties.
```

---

### [1.1.0] - 2025-10-02

**Major Refactoring - Internal Data Fetching**
- ✅ Split component into server wrapper + client component for true portability
- ✅ Created `CatalogsTable` server component (main entry point)
- ✅ Renamed original to `CatalogsTableClient` (client component)
- ✅ Moved all data fetching into the component (no longer needs external fetching)
- ✅ Simplified page usage - just pass `resortName` and `searchParams`
- ✅ Component now fully self-contained and portable
- ✅ Updated comprehensive documentation
- ✅ Added JSDoc comments to new server component

**New API**:
```tsx
// Old (manual data fetching in page)
const promises = Promise.all([dbGetCatalogs({...})])
<CatalogsTable promises={promises} />

// New (automatic data fetching)
<CatalogsTable resortName={resortName} searchParams={searchParams} />
```

**Benefits**:
- ⚡ More portable - just copy and import
- 🎯 Simpler page code - no manual data fetching
- 🔧 Easier to maintain - data fetching logic in one place
- 📦 Self-contained - component handles everything

**Breaking Changes**:
- CatalogsTable now requires `resortName` and `searchParams` props instead of `promises`
- Original component renamed to `CatalogsTableClient`
- Pages using the old API need to be updated to new API

---

### [1.0.0] - 2025-10-02

**Initial Release - Complete Restructure**
- Restructured feature to follow project architecture rules
- Created proper folder structure with prefixes:
  - `catalogs-table-components/`
  - `catalogs-table-lib/`
  - `catalogs-table-types/`
- Added comprehensive TypeScript types
- Added full JSDoc documentation to all functions
- Created catalogs-table-docs.md comprehensive documentation
- Made feature fully portable and self-contained
- Renamed files with proper prefixes
- Created public API exports through index.ts files

**Features**:
- ✅ Sortable and filterable table
- ✅ Pagination support
- ✅ Responsive mobile layout
- ✅ Cache revalidation
- ✅ Export functionality
- ✅ Resort context integration
- ✅ Advanced filtering
- ✅ Comprehensive documentation

**Breaking Changes**:
- Moved from `catalogs-table.tsx` to `catalogs-table-components/catalogs-table-component.tsx`
- Removed `_lib/` folder (revalidation not needed)
- Changed import paths (use `@/features/catalogs-table` for all exports)

---

## References

### External Documentation
- [TanStack Table Documentation](https://tanstack.com/table/v8)
- [Next.js Cache Revalidation](https://nextjs.org/docs/app/building-your-application/caching#revalidating)
- [React 18 use() Hook](https://react.dev/reference/react/use)

### Internal Documentation
- `.cursor/ARCHITECTURE.md` - Project architecture overview
- `.cursor/QUICK_REFERENCE.md` - Quick reference guide
- `.cursor/rules/` - Complete project rules
- `docs/UNIVERSAL-TABLE-SYSTEM.md` - Universal table documentation

---

**Last Updated**: 2025-10-02  
**Maintained By**: Development Team  
**Feature Status**: ✅ Active

