# Orders Table Refactoring Example

This document provides a detailed, step-by-step guide for refactoring the Orders Table as the **reference implementation** for all other tables.

---

## Current Structure (Before)

```
src/features/orders/order-components/orders-table/
├── orders-table.tsx                    # Main component
├── orders-table-columns.tsx            # Column definitions
├── orders-mobile-card.tsx              # Mobile card view
└── _actions/                           # Server actions
    ├── get-order-sessions.ts
    ├── return-lifepass.ts
    ├── swap-pass.ts
    └── toggle-test-order.ts
```

**Issues**:
- ❌ Nested too deep: `order-components/orders-table/`
- ❌ Files not prefixed: `orders-table.tsx` (should be in component subfolder)
- ❌ No types folder
- ❌ No documentation
- ❌ Actions mixed with components

---

## New Structure (After)

```
src/features/orders-table/
├── orders-table-components/
│   ├── orders-table-component.tsx      # Main table component
│   ├── orders-table-columns.tsx        # Column definitions
│   ├── orders-table-mobile-card.tsx    # Mobile card component
│   └── index.ts                        # Component exports
│
├── orders-table-types/
│   ├── orders-table-types.ts           # Type definitions
│   └── index.ts                        # Type exports
│
├── orders-table-actions/               # Server actions (optional)
│   ├── orders-table-get-sessions.ts
│   ├── orders-table-return-lifepass.ts
│   ├── orders-table-swap-pass.ts
│   ├── orders-table-toggle-test.ts
│   └── index.ts                        # Action exports
│
├── orders-table-docs.md                # Comprehensive documentation
└── index.ts                            # Public API exports
```

---

## Step-by-Step Migration

### Step 1: Create New Folder Structure

```bash
# Create main feature folder
mkdir -p src/features/orders-table

# Create subfolders
mkdir -p src/features/orders-table/orders-table-components
mkdir -p src/features/orders-table/orders-table-types
mkdir -p src/features/orders-table/orders-table-actions
```

### Step 2: Create Type Definitions

Create `src/features/orders-table/orders-table-types/orders-table-types.ts`:

```typescript
/**
 * Type definitions for Orders Table feature
 */

import type { Order } from '@/db/schema'
import type { DataTableRowAction } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

/**
 * Props for OrdersTable component
 */
export type TOrdersTableProps = {
  /** Promise resolving to orders data and page count */
  promises: Promise<[{ data: Order[]; pageCount: number }]>
}

/**
 * Props for getOrdersTableColumns function
 */
export type TOrdersTableColumnsProps = {
  /** Callback to set row action state */
  setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<Order> | null>>
  /** Whether viewport is mobile */
  isMobile: boolean
  /** Optional resort name for routing */
  resort?: string
}

/**
 * Type for orders table column definitions
 */
export type TOrdersTableColumns = ColumnDef<Order>[]

/**
 * Props for OrdersTableMobileCard component
 */
export type TOrdersTableMobileCardProps = {
  /** The table row data */
  row: Row<Order>
}

/**
 * Re-export Order type for convenience
 */
export type TOrder = Order
```

Create `src/features/orders-table/orders-table-types/index.ts`:

```typescript
/**
 * Orders Table Types
 * Public API for type exports
 */

export type {
  TOrdersTableProps,
  TOrdersTableColumnsProps,
  TOrdersTableColumns,
  TOrdersTableMobileCardProps,
  TOrder,
} from './orders-table-types'
```

### Step 3: Move and Refactor Main Component

Move `orders-table.tsx` → `orders-table-components/orders-table-component.tsx` and refactor:

```typescript
"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { type Order } from "@/db/schema"
import { useResort } from "@/features/resorts"
import { Eye, EyeOff } from "lucide-react"

import type { DataTableRowAction } from "@/types/index"
import { useDataTable } from "@/hooks/use-data-table"
import useRowExpansionAndMobile from "@/hooks/use-row-expansion"
import { UniversalDataTableWrapper } from "@/components/data-table"
import { UniversalDataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"

import { revalidateOrders } from "../orders-table-actions/orders-table-revalidate"
import { OrdersTableMobileCard } from "./orders-table-mobile-card"
import { getOrdersTableColumns } from "./orders-table-columns"
import type { TOrdersTableProps } from "../orders-table-types"

/**
 * Orders Table Component
 * 
 * Displays order records in a comprehensive data table with advanced filtering,
 * sorting, pagination, and mobile-optimized views.
 * 
 * @param props - Component props
 * @returns React component rendering the orders table
 * 
 * @example
 * ```tsx
 * <OrdersTable promises={ordersPromise} />
 * ```
 */
export function OrdersTable({ promises }: TOrdersTableProps) {
  const router = useRouter()
  const { resort } = useResort()
  const searchParams = useSearchParams()
  const { isMobile } = useRowExpansionAndMobile()

  const [{ data, pageCount }] = React.use(promises) as unknown as [
    { data: Order[]; pageCount: number },
  ]

  // State hooks for managing row actions and expansion
  const [_rowAction, setRowAction] =
    React.useState<DataTableRowAction<Order> | null>(null)

  // Check if incomplete filter exists in the URL
  const filtersParam = searchParams.get("filters")
  const filters = filtersParam
    ? JSON.parse(decodeURIComponent(filtersParam))
    : []
  const showIncomplete = filters.some(
    (filter: { id: string; value: string[] }) =>
      filter.id === "status" && filter.value?.includes("incomplete")
  )

  // Memoize columns based on mobile state and resort
  const columns = React.useMemo(() => {
    const resortName = resort?.name.toLowerCase()
    return getOrdersTableColumns({ setRowAction, isMobile, resort: resortName })
  }, [isMobile, resort?.name])

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields: [],
    enableAdvancedFilter: true,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: true,
    clearOnDefault: true,
  })

  const toggleIncompleteOrders = () => {
    const params = new URLSearchParams(searchParams)
    const currentFilters = filtersParam
      ? JSON.parse(decodeURIComponent(filtersParam))
      : []

    if (showIncomplete) {
      // Remove the incomplete filter
      const newFilters = currentFilters.filter(
        (filter: { id: string; value: string[] }) =>
          !(filter.id === "status" && filter.value?.includes("incomplete"))
      )
      if (newFilters.length === 0) {
        params.delete("filters")
      } else {
        params.set("filters", JSON.stringify(newFilters))
      }
    } else {
      // Add the incomplete filter
      const newFilter = {
        id: "status",
        value: ["incomplete"],
        type: "multi-select",
        operator: "neq",
        rowId: Math.random().toString(36).substring(2, 8),
      }
      currentFilters.push(newFilter)
      params.set("filters", JSON.stringify(currentFilters))
    }

    // Preserve the perPage parameter
    if (!params.has("perPage")) {
      params.set("perPage", "50")
    }

    router.push(`?${params.toString()}`)
  }

  // Effect to filter incomplete orders
  React.useEffect(() => {
    if (showIncomplete) {
      table.getColumn("status")?.setFilterValue("incomplete")
    } else {
      table.getColumn("status")?.setFilterValue(undefined)
    }
  }, [showIncomplete, table])

  return (
    <div className="size-full px-2 pb-4">
      <UniversalDataTableWrapper
        table={table}
        columns={columns}
        onRevalidate={revalidateOrders}
        storageKey="ordersLastRefreshed"
        exportFilename="orders"
        customActions={
          <Button
            variant="outline"
            size="sm"
            onClick={toggleIncompleteOrders}
            className={`${isMobile ? "w-full" : ""} gap-2`}
          >
            {showIncomplete ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
            {showIncomplete ? "Show Incomplete Orders" : "Hide Incomplete Orders"}
          </Button>
        }
      >
        <UniversalDataTable
          table={table}
          renderMobileCard={(row) => <OrdersTableMobileCard row={row} />}
          enableMobileCards={true}
        />
      </UniversalDataTableWrapper>
    </div>
  )
}
```

### Step 4: Move and Refactor Columns

Move `orders-table-columns.tsx` → `orders-table-components/orders-table-columns.tsx` and add JSDoc:

```typescript
/**
 * Orders Table Column Definitions
 * 
 * Defines the columns for the orders data table with filtering, sorting,
 * and custom cell renderers.
 */

import * as React from "react"
// ... existing imports ...

import type { TOrdersTableColumnsProps, TOrdersTableColumns } from "../orders-table-types"

/**
 * Generate column definitions for the orders table
 * 
 * Creates an array of column definitions with filtering metadata,
 * custom cell renderers, and mobile optimization.
 * 
 * @param props - Column configuration props
 * @param props.setRowAction - Callback to set row action state
 * @param props.isMobile - Whether viewport is mobile (filters columns)
 * @param props.resort - Optional resort name for routing
 * @returns Array of TanStack Table column definitions
 * 
 * @example
 * ```tsx
 * const columns = getOrdersTableColumns({
 *   setRowAction: (action) => setState(action),
 *   isMobile: false,
 *   resort: 'mountain-resort'
 * })
 * ```
 */
export function getOrdersTableColumns({
  setRowAction: _setRowAction,
  isMobile,
  resort: _resort
}: TOrdersTableColumnsProps): TOrdersTableColumns {
  // ... existing implementation ...
}
```

### Step 5: Move Mobile Card

Move `orders-mobile-card.tsx` → `orders-table-components/orders-table-mobile-card.tsx`:

```typescript
/**
 * Orders Table Mobile Card Component
 * 
 * Optimized card layout for displaying order data on mobile devices.
 */

import type { Row } from "@tanstack/react-table"
import type { Order } from "@/db/schema"
import type { TOrdersTableMobileCardProps } from "../orders-table-types"

/**
 * Mobile card view for order rows
 * 
 * Displays order information in a compact, mobile-friendly card format.
 * 
 * @param props - Component props
 * @returns React component rendering the mobile card
 */
export function OrdersTableMobileCard({ row }: TOrdersTableMobileCardProps) {
  // ... implementation ...
}
```

### Step 6: Move Server Actions

Move actions to `orders-table-actions/` with proper prefixes:

```typescript
// orders-table-actions/orders-table-get-sessions.ts
/**
 * Fetch order sessions
 * 
 * Server action to retrieve session data for a given order.
 */
export async function ordersTableGetSessions(sessionIds: string[]) {
  // ... implementation ...
}

// orders-table-actions/orders-table-revalidate.ts
/**
 * Revalidate orders cache
 * 
 * Server action to refresh orders data cache.
 */
export async function revalidateOrders() {
  'use server'
  revalidateTag('orders')
}
```

### Step 7: Create Component Index

Create `orders-table-components/index.ts`:

```typescript
/**
 * Orders Table Components
 * Public API for component exports
 */

export { OrdersTable } from './orders-table-component'
export { OrdersTableMobileCard } from './orders-table-mobile-card'
export { getOrdersTableColumns } from './orders-table-columns'
```

### Step 8: Create Main Index

Create `src/features/orders-table/index.ts`:

```typescript
/**
 * Orders Table Feature
 * 
 * Comprehensive data table for managing and viewing order records with
 * advanced filtering, sorting, pagination, and mobile optimization.
 * 
 * @example
 * ```tsx
 * import { OrdersTable } from '@/features/orders-table'
 * 
 * <OrdersTable promises={ordersPromise} />
 * ```
 */

// Components
export {
  OrdersTable,
  OrdersTableMobileCard,
  getOrdersTableColumns,
} from './orders-table-components'

// Types
export type {
  TOrdersTableProps,
  TOrdersTableColumnsProps,
  TOrdersTableColumns,
  TOrdersTableMobileCardProps,
  TOrder,
} from './orders-table-types'

// Actions
export {
  ordersTableGetSessions,
  ordersTableReturnLifepass,
  ordersTableSwapPass,
  ordersTableToggleTest,
  revalidateOrders,
} from './orders-table-actions'
```

### Step 9: Update App Route Imports

Update `src/app/admin/[resortName]/orders/(order-history)/page.tsx`:

```typescript
// Before:
import { OrdersTable } from "@/features/orders/order-components/orders-table/orders-table"

// After:
import { OrdersTable } from "@/features/orders-table"
```

### Step 10: Create Documentation

Create `orders-table-docs.md` following the template in `.cursor/examples/user-table-docs.md`

---

## Verification Checklist

After refactoring, verify:

- [ ] All imports updated in app routes
- [ ] Table renders correctly
- [ ] Filtering works
- [ ] Sorting works
- [ ] Pagination works
- [ ] Mobile card view works
- [ ] Action dialogs work (sessions, swap pass, etc.)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Documentation created
- [ ] Types properly exported
- [ ] Old folder can be deleted

---

## Import Update Pattern

### Files that need import updates:

1. `src/app/admin/[resortName]/orders/(order-history)/page.tsx`

```typescript
// Change this:
import { OrdersTable } from "@/features/orders/order-components/orders-table/orders-table"

// To this:
import { OrdersTable } from "@/features/orders-table"
```

That's it! The feature is now properly structured, documented, and portable.

---

## Next Steps

1. Apply this same pattern to all other tables
2. Test thoroughly
3. Update documentation
4. Delete old folders after confirming everything works

---

**Reference**: This serves as the template for refactoring all other tables in the project.

