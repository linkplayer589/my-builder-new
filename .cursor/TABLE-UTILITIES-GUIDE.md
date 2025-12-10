# Data Table Utilities Guide

## Overview

This guide explains how to use the common data table utilities (`src/lib/data-table-utils.ts`) to create consistent, maintainable table implementations across the project.

---

## 📦 Available Utilities

### 1. Column Creation Functions

These functions create complete column definitions with consistent formatting, filtering, and behavior.

#### `createTextColumn<TData>`

Creates a text column with filtering support.

**Usage:**
```tsx
import { createTextColumn } from '@/lib/data-table-utils'

const columns: ColumnDef<Catalog>[] = [
  createTextColumn<Catalog>({
    accessorKey: 'id',
    headerTitle: 'ID',
    filterLabel: 'Catalog ID',
    filterPlaceholder: 'Enter catalog ID...',
  }),
]
```

**Benefits:**
- ✅ Automatic filter metadata
- ✅ Consistent header styling
- ✅ Type-safe accessor key
- ✅ Standardized filter UI

---

#### `createNumberColumn<TData>`

Creates a number column with filtering support.

**Usage:**
```tsx
import { createNumberColumn } from '@/lib/data-table-utils'

const columns: ColumnDef<Catalog>[] = [
  createNumberColumn<Catalog>({
    accessorKey: 'resortId',
    headerTitle: 'Resort ID',
    filterLabel: 'Resort ID',
    filterPlaceholder: 'Enter resort ID...',
  }),
]
```

**When to use:**
- Resort IDs, version numbers, counts, etc.
- Any numeric data that needs filtering

---

#### `createDateColumn<TData>`

Creates a date column with consistent formatting and filtering.

**Usage:**
```tsx
import { createDateColumn } from '@/lib/data-table-utils'

const columns: ColumnDef<Catalog>[] = [
  createDateColumn<Catalog>({
    accessorKey: 'createdAt',
    headerTitle: 'Created At',
    filterLabel: 'Created Date',
    filterPlaceholder: 'Select created date...',
  }),
]
```

**Format:** `YYYY-MM-DD HH:MM`

**Benefits:**
- ✅ Consistent date formatting across all tables
- ✅ Handles both string and Date types
- ✅ Graceful handling of invalid dates
- ✅ Automatic filter support

---

### 2. Mobile Responsiveness

#### `filterColumnsForMobile<TData>`

Standard mobile column filtering for consistent mobile UX.

**Usage:**
```tsx
import { filterColumnsForMobile } from '@/lib/data-table-utils'

export function getTableColumns({ isMobile }): ColumnDef<Data>[] {
  const columns: ColumnDef<Data>[] = [
    // ... all column definitions
  ]
  
  // Apply standard mobile filtering
  return filterColumnsForMobile(columns, isMobile)
}
```

**Mobile Strategy:**
- Shows **first 2 columns** (usually ID and primary field)
- Shows **second-to-last column** (usually createdAt date)
- Provides consistent mobile experience across all tables

**Desktop:**
```
| ID | Name | Status | Created At | Updated At |
```

**Mobile:**
```
| ID | Name | Created At |
```

---

#### `MOBILE_COLUMN_STRATEGY`

Constants for mobile column behavior.

**Usage:**
```tsx
import { MOBILE_COLUMN_STRATEGY } from '@/lib/data-table-utils'

// Get indices of mobile columns
const mobileIndices = MOBILE_COLUMN_STRATEGY.getIndices(columns.length)
// Returns: [0, 1, columns.length - 2]

// Custom filtering
const mobileColumns = columns.filter((col, idx) => 
  MOBILE_COLUMN_STRATEGY.filter(columns, idx, columns.length)
)
```

---

### 3. Formatting Functions

#### `formatTableDate(value)`

Consistent date formatting for all tables.

**Usage:**
```tsx
import { formatTableDate } from '@/lib/data-table-utils'

// In a custom cell renderer
cell: ({ cell }) => formatTableDate(cell.getValue() as string | Date)
```

**Input/Output:**
```tsx
formatTableDate('2025-10-02T14:30:00Z')  // "2025-10-02 14:30"
formatTableDate(new Date())              // "2025-10-02 14:30"
formatTableDate(null)                    // "N/A"
formatTableDate('invalid')               // "Invalid Date"
```

---

#### `truncateText(text, maxLength)`

Truncate long text values for table cells.

**Usage:**
```tsx
import { truncateText } from '@/lib/data-table-utils'

cell: ({ cell }) => truncateText(cell.getValue() as string, 30)
```

**Examples:**
```tsx
truncateText('Short text', 50)           // "Short text"
truncateText('Very long text...', 10)    // "Very long ..."
truncateText(null, 50)                   // "N/A"
```

---

#### `formatKeyToLabel(key)`

Convert camelCase/snake_case keys to readable labels.

**Usage:**
```tsx
import { formatKeyToLabel } from '@/lib/data-table-utils'

formatKeyToLabel('createdAt')        // "Created At"
formatKeyToLabel('user_name')        // "User Name"
formatKeyToLabel('resortId')         // "Resort Id"
```

**Use cases:**
- Auto-generating column headers
- Mobile card field labels
- Export column names

---

## 🎯 Complete Example: Refactored Table

### Before (Manual Implementation)

```tsx
// ❌ OLD: Manual column definitions with repetition
export function getOldTableColumns({ isMobile }): ColumnDef<Data>[] {
  const columns: ColumnDef<Data>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      meta: {
        filterable: true,
        filterType: 'text',
        filterLabel: 'Data ID',
        filterPlaceholder: 'Enter ID...',
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as string | Date
        const date = typeof value === 'string' ? new Date(value) : value
        return !isNaN(date.getTime())
          ? `${date.toISOString().split('T')[0]} ${date
              .toISOString()
              .split('T')[1]
              ?.slice(0, 5)}`
          : 'Invalid Date'
      },
      meta: {
        filterable: true,
        filterType: 'date',
        filterLabel: 'Created Date',
        filterPlaceholder: 'Select date...',
      },
    },
  ]
  
  // Manual mobile filtering
  return isMobile
    ? columns.filter((col, idx) => idx < 2 || idx === columns.length - 2)
    : columns
}
```

**Issues:**
- ❌ Repetitive code
- ❌ Inconsistent formatting
- ❌ Hard to maintain
- ❌ No standardization

---

### After (Using Utilities)

```tsx
// ✅ NEW: Clean, consistent, maintainable
import {
  createTextColumn,
  createDateColumn,
  filterColumnsForMobile,
} from '@/lib/data-table-utils'

export function getNewTableColumns({ isMobile }): ColumnDef<Data>[] {
  const columns: ColumnDef<Data>[] = [
    createTextColumn<Data>({
      accessorKey: 'id',
      headerTitle: 'ID',
      filterLabel: 'Data ID',
      filterPlaceholder: 'Enter ID...',
    }),
    
    createDateColumn<Data>({
      accessorKey: 'createdAt',
      headerTitle: 'Created At',
      filterLabel: 'Created Date',
      filterPlaceholder: 'Select date...',
    }),
  ]
  
  return filterColumnsForMobile(columns, isMobile)
}
```

**Benefits:**
- ✅ 60% less code
- ✅ Consistent formatting
- ✅ Easy to maintain
- ✅ Standardized across all tables

---

## 🚀 Migration Checklist

When refactoring a table to use utilities:

### 1. Update Imports
```tsx
// Add utility imports
import {
  createTextColumn,
  createNumberColumn,
  createDateColumn,
  filterColumnsForMobile,
  formatTableDate,
} from '@/lib/data-table-utils'
```

### 2. Replace Text Columns
```tsx
// Before:
{
  accessorKey: 'name',
  header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  meta: { filterable: true, filterType: 'text', ... }
}

// After:
createTextColumn<Data>({
  accessorKey: 'name',
  headerTitle: 'Name',
  filterLabel: 'Name',
  filterPlaceholder: 'Search by name...',
})
```

### 3. Replace Number Columns
```tsx
// Before:
{
  accessorKey: 'resortId',
  header: ({ column }) => <DataTableColumnHeader column={column} title="Resort ID" />,
  meta: { filterable: true, filterType: 'number', ... }
}

// After:
createNumberColumn<Data>({
  accessorKey: 'resortId',
  headerTitle: 'Resort ID',
  filterLabel: 'Resort ID',
  filterPlaceholder: 'Enter resort ID...',
})
```

### 4. Replace Date Columns
```tsx
// Before:
{
  accessorKey: 'createdAt',
  header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
  cell: ({ cell }) => {
    const date = new Date(cell.getValue())
    return !isNaN(date.getTime()) ? `${date.toISOString()...}` : 'Invalid'
  },
  meta: { filterable: true, filterType: 'date', ... }
}

// After:
createDateColumn<Data>({
  accessorKey: 'createdAt',
  headerTitle: 'Created At',
  filterLabel: 'Created Date',
  filterPlaceholder: 'Select date...',
})
```

### 5. Replace Mobile Filtering
```tsx
// Before:
return isMobile
  ? columns.filter((col, idx) => idx < 2 || idx === columns.length - 2)
  : columns

// After:
return filterColumnsForMobile(columns, isMobile)
```

### 6. Clean Up Unused Imports
```tsx
// Remove if no longer needed:
// import { DataTableColumnHeader } from '@/components/data-table'
// import type { FilterableColumnMeta } from '@/types'
```

---

## 📊 Reference Implementation

See `src/features/catalogs-table/catalogs-table-components/catalogs-table-columns.tsx` for a complete reference implementation using all utilities.

**Key features:**
- ✅ Uses `createTextColumn` for ID
- ✅ Uses `createNumberColumn` for resortId and version
- ✅ Uses `createDateColumn` for createdAt and updatedAt
- ✅ Uses `filterColumnsForMobile` for mobile responsiveness
- ✅ Clean, minimal code
- ✅ Fully type-safe

---

## 🎨 Custom Columns

For columns that need custom rendering, combine utilities with custom logic:

### Example: Status Column with Badge
```tsx
{
  accessorKey: 'status',
  header: ({ column }) => {
    const { DataTableColumnHeader } = require('@/components/data-table')
    return <DataTableColumnHeader column={column} title="Status" />
  },
  cell: ({ row }) => (
    <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
      {row.original.status}
    </Badge>
  ),
  meta: {
    filterable: true,
    filterType: 'select',
    filterLabel: 'Status',
    filterOptions: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
}
```

### Example: Actions Column
```tsx
{
  id: 'actions',
  enableHiding: false,
  maxSize: 40,
  cell: ({ row }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Ellipsis className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onEdit(row.original)}>
          Edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
```

---

## 🔍 Troubleshooting

### TypeScript Errors

**Issue:** Type error with `accessorKey`
```tsx
// ❌ Wrong: accessorKey not in Data type
createTextColumn<Data>({ accessorKey: 'invalidField', ... })
```

**Solution:** Ensure accessor key exists in your data type
```tsx
// ✅ Correct: accessorKey must be keyof Data
createTextColumn<Data>({ accessorKey: 'validField', ... })
```

---

### Circular Dependency Warning

**Issue:** Warning about circular dependencies

**Solution:** The utilities use `require()` for dynamic imports to avoid circular deps. This is intentional and safe.

---

### Mobile Columns Not Showing

**Issue:** Mobile view shows wrong columns

**Solution:** Ensure you're using `filterColumnsForMobile` AFTER defining all columns:
```tsx
// ✅ Correct order:
const columns = [ ...all columns... ]
return filterColumnsForMobile(columns, isMobile)
```

---

## 📝 Best Practices

### 1. Always Use Utilities for Standard Columns
- Text fields → `createTextColumn`
- Numbers → `createNumberColumn`
- Dates → `createDateColumn`

### 2. Use Standard Mobile Filtering
```tsx
return filterColumnsForMobile(columns, isMobile)
```

### 3. Add Comments for Complex Columns
```tsx
// Custom status column with badge rendering
{
  accessorKey: 'status',
  // ... custom implementation
}
```

### 4. Group Related Columns
```tsx
const columns: ColumnDef<Data>[] = [
  // Identification columns
  createTextColumn({ ... }),
  createNumberColumn({ ... }),
  
  // Date columns
  createDateColumn({ ... }),
  createDateColumn({ ... }),
  
  // Actions column
  { id: 'actions', ... }
]
```

### 5. Keep Filter Labels Consistent
```tsx
// ✅ Good: Clear, specific
filterLabel: 'Catalog ID'
filterPlaceholder: 'Enter catalog ID...'

// ❌ Bad: Vague, generic
filterLabel: 'ID'
filterPlaceholder: 'Search...'
```

---

## 🎯 Next Steps

1. ✅ **Catalogs Table** - Already updated (reference implementation)
2. ⏳ **Orders Table** - Apply utilities
3. ⏳ **Kiosks Table** - Apply utilities
4. ⏳ **All other tables** - Follow this guide

---

## 📚 Related Documentation

- `.cursor/TABLE-REFACTORING-PLAN.md` - Overall refactoring strategy
- `.cursor/ORDERS-TABLE-REFACTORING-EXAMPLE.md` - Detailed example
- `.cursor/TABLE-REFACTORING-CHECKLIST.md` - Step-by-step checklist
- `docs/UNIVERSAL-TABLE-SYSTEM.md` - Universal table system docs

---

**Remember**: Consistency is key! Use these utilities for all standard columns to maintain a cohesive codebase.

