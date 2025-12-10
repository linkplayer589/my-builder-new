# Table Refactoring Plan

## Goal
Standardize all table implementations to follow project architecture rules, using `catalogs-table` as the reference pattern.

---

## Standard Table Structure

Each table feature should follow this structure:

```
[table-name]-table/
├── [table-name]-table-components/
│   ├── [table-name]-table-component.tsx    # Main table component
│   ├── [table-name]-table-columns.tsx      # Column definitions
│   └── index.ts                            # Component exports
├── [table-name]-table-types/
│   └── [table-name]-table-types.ts         # TypeScript types
├── [table-name]-table-docs.md              # Comprehensive documentation
└── index.ts                                # Public API exports

Optional folders (only if needed):
├── [table-name]-table-utils/               # Table-specific utilities
├── [table-name]-table-hooks/               # Table-specific hooks
└── [table-name]-table-actions/             # Server actions (if not in parent feature)
```

---

## Tables to Refactor

### 1. Orders Table ✅ (Priority: HIGH)
**Current**: `src/features/orders/order-components/orders-table/`
**New**: `src/features/orders-table/`

**Reason**: Orders table is a major feature, should be top-level and portable

**Changes**:
- Move from nested path to top-level feature
- Rename files with `orders-table-` prefix
- Add comprehensive documentation
- Create proper type definitions
- Extract mobile card logic to separate file

**Files to refactor**:
- `orders-table.tsx` → `orders-table-components/orders-table-component.tsx`
- `orders-table-columns.tsx` → `orders-table-components/orders-table-columns.tsx`
- `orders-mobile-card.tsx` → `orders-table-components/orders-table-mobile-card.tsx`
- Create `orders-table-types/orders-table-types.ts`
- Create `orders-table-docs.md`

---

### 2. Kiosks Table ✅ (Priority: HIGH)
**Current**: `src/features/kiosks/kiosk-data-table/`
**New**: `src/features/kiosks-table/`

**Changes**:
- Rename folder to `kiosks-table`
- Prefix all files: `kiosks-table-*`
- Extract expanded row to separate component
- Add comprehensive documentation

**Files to refactor**:
- `kiosks-table.tsx` → `kiosks-table-components/kiosks-table-component.tsx`
- `kiosks-table-columns.tsx` → `kiosks-table-components/kiosks-table-columns.tsx`
- `kiosks-expanded-row.tsx` → `kiosks-table-components/kiosks-table-expanded-row.tsx`
- Create `kiosks-table-types/kiosks-table-types.ts`
- Create `kiosks-table-docs.md`

---

### 3. Resorts Table ✅ (Priority: MEDIUM)
**Current**: `src/features/resorts/resort-data-table/`
**New**: `src/features/resorts-table/`

**Changes**:
- Rename to `resorts-table` (plural for consistency)
- Prefix files properly
- Extract custom data table to shared component
- Add documentation

**Files to refactor**:
- `resort-table.tsx` → `resorts-table-components/resorts-table-component.tsx`
- `resorts-table-columns.tsx` → `resorts-table-components/resorts-table-columns.tsx`
- `resort-data-table.tsx` → `resorts-table-components/resorts-table-data-table.tsx`
- Create `resorts-table-types/resorts-table-types.ts`
- Create `resorts-table-docs.md`

---

### 4. Sessions Table ✅ (Priority: MEDIUM)
**Current**: `src/features/sessions/session-components/sessions-table/`
**New**: `src/features/sessions-table/`

**Changes**:
- Move to top-level feature
- Prefix files properly
- Add documentation

**Files to refactor**:
- `sessions-table.tsx` → `sessions-table-components/sessions-table-component.tsx`
- `sessions-table-columns.tsx` → `sessions-table-components/sessions-table-columns.tsx`
- Create `sessions-table-types/sessions-table-types.ts`
- Create `sessions-table-docs.md`

---

### 5. Products Table ✅ (Priority: MEDIUM)
**Current**: `src/features/products/products-components/products-table/`
**New**: `src/features/products-table/`

**Changes**:
- Move to top-level
- Proper prefixing
- Add documentation

**Files to refactor**:
- `products-table.tsx` → `products-table-components/products-table-component.tsx`
- `products-table-columns.tsx` → `products-table-components/products-table-columns.tsx`
- Create `products-table-types/products-table-types.ts`
- Create `products-table-docs.md`

---

### 6. Devices Table ✅ (Priority: MEDIUM)
**Current**: `src/features/devices-table/devices-table.tsx` (already top-level but wrong structure)
**New**: `src/features/devices-table/` (restructure)

**Changes**:
- Reorganize into proper subfolder structure
- Add types folder
- Add documentation

**Files to refactor**:
- `devices-table.tsx` → `devices-table-components/devices-table-component.tsx`
- `devices-table-columns.tsx` → `devices-table-components/devices-table-columns.tsx`
- Create `devices-table-types/devices-table-types.ts`
- Create `devices-table-docs.md`

---

### 7. Device History Table ✅ (Priority: LOW)
**Current**: `src/features/device-history-table/`
**New**: Keep same location but restructure

**Changes**:
- Add proper subfolder structure
- Add documentation

---

### 8. Lifepass Device Table ✅ (Priority: MEDIUM)
**Current**: `src/features/lifepass-device/lifepass-device-table/`
**New**: `src/features/lifepass-table/`

**Changes**:
- Rename to shorter, clearer name
- Proper prefixing
- Extract data table component
- Add documentation

---

### 9. Sales Tax Table ✅ (Priority: MEDIUM)
**Current**: `src/features/orders/order-components/sales-tax-table/`
**New**: `src/features/sales-tax-table/`

**Changes**:
- Move to top-level feature
- Proper prefixing
- Extract data table
- Add documentation

---

### 10. Skidata Table ✅ (Priority: MEDIUM)
**Current**: `src/features/orders/order-components/skidata-table/`
**New**: `src/features/skidata-table/`

**Changes**:
- Move to top-level
- Proper prefixing
- Extract data table
- Add documentation

---

### 11. Sales Channels Table ✅ (Priority: MEDIUM)
**Current**: `src/features/sales-channels/products-components/sales-channels-table/`
**New**: `src/features/sales-channels-table/`

**Changes**:
- Move to top-level
- Proper prefixing
- Add documentation

---

## Standard Naming Patterns

### Folder Names
```
✅ CORRECT:
orders-table/
orders-table-components/
orders-table-types/
orders-table-utils/

❌ WRONG:
order-components/orders-table/
kiosk-data-table/
resort-data-table/
```

### File Names
```
✅ CORRECT:
orders-table-component.tsx
orders-table-columns.tsx
orders-table-types.ts
orders-table-mobile-card.tsx

❌ WRONG:
orders-table.tsx
table.tsx
columns.tsx
```

### Component Names
```tsx
// ✅ CORRECT:
export function OrdersTable() { }
export function OrdersTableMobileCard() { }
export function getOrdersTableColumns() { }

// ❌ WRONG:
export function Table() { }
export function MobileCard() { }
```

---

## Migration Steps for Each Table

### Step 1: Create New Structure
1. Create new top-level feature folder: `[table-name]-table/`
2. Create subfolders:
   - `[table-name]-table-components/`
   - `[table-name]-table-types/`
3. Create documentation: `[table-name]-table-docs.md`

### Step 2: Move and Rename Files
1. Move table component → `[table-name]-table-components/[table-name]-table-component.tsx`
2. Move columns file → `[table-name]-table-components/[table-name]-table-columns.tsx`
3. Move any related components with proper prefix

### Step 3: Extract Types
1. Create `[table-name]-table-types/[table-name]-table-types.ts`
2. Extract all types from component files
3. Add proper type exports

### Step 4: Create Index Files
1. Create `[table-name]-table-components/index.ts`
2. Create `[table-name]-table-types/index.ts`
3. Create main `index.ts` with public API

### Step 5: Update Imports
1. Update all imports in app routes
2. Update any feature cross-references
3. Test all pages

### Step 6: Add Documentation
1. Create comprehensive `[table-name]-table-docs.md`
2. Follow `.cursor/examples/user-table-docs.md` template
3. Document all components, functions, and types

### Step 7: Clean Up
1. Delete old folder structure
2. Update any references in docs
3. Verify no broken imports

---

## Example: Orders Table Refactoring

### Before
```
src/features/orders/order-components/orders-table/
├── orders-table.tsx
├── orders-table-columns.tsx
└── orders-mobile-card.tsx
```

### After
```
src/features/orders-table/
├── orders-table-components/
│   ├── orders-table-component.tsx
│   ├── orders-table-columns.tsx
│   ├── orders-table-mobile-card.tsx
│   └── index.ts
├── orders-table-types/
│   ├── orders-table-types.ts
│   └── index.ts
├── orders-table-docs.md
└── index.ts
```

### Main index.ts
```typescript
/**
 * Orders Table Feature
 * 
 * Displays order records in a sortable, filterable table with mobile support
 */

// Components
export { OrdersTable } from './orders-table-components/orders-table-component'
export { OrdersTableMobileCard } from './orders-table-components/orders-table-mobile-card'
export { getOrdersTableColumns } from './orders-table-components/orders-table-columns'

// Types
export type {
  TOrdersTableProps,
  TOrdersTableColumns,
  TOrdersTableColumnsProps,
} from './orders-table-types/orders-table-types'
```

---

## Implementation Priority

### Phase 1 (Week 1): High Priority
1. ✅ Orders Table (most complex, most used)
2. ✅ Kiosks Table (frequently accessed)

### Phase 2 (Week 2): Medium Priority
3. ✅ Resorts Table
4. ✅ Sessions Table
5. ✅ Products Table
6. ✅ Devices Table

### Phase 3 (Week 3): Lower Priority
7. ✅ Lifepass Table
8. ✅ Sales Tax Table
9. ✅ Skidata Table
10. ✅ Sales Channels Table
11. ✅ Device History Table

---

## Benefits of Refactoring

### 1. Consistency
- All tables follow the same structure
- Easy to find files by searching feature name
- Predictable file organization

### 2. Portability
- Tables are self-contained features
- Can copy to other projects easily
- Clear dependencies

### 3. Maintainability
- Clear separation of concerns
- Easier to understand and modify
- Better for onboarding new developers

### 4. Documentation
- Every table has comprehensive docs
- AI can understand and work with tables better
- Reduces knowledge silos

### 5. Searchability
- Type feature name to find ALL related files
- No nested hunting
- Consistent naming makes code navigation faster

---

## Testing After Refactoring

For each refactored table, verify:

1. ✅ Table renders correctly
2. ✅ Filtering works
3. ✅ Sorting works
4. ✅ Pagination works
5. ✅ Mobile view works
6. ✅ Actions/dialogs work
7. ✅ No console errors
8. ✅ All imports resolved
9. ✅ Documentation accurate
10. ✅ Types properly exported

---

## Notes

- Keep backward compatibility during migration
- Update one table at a time
- Test thoroughly before moving to next table
- Update route imports immediately after each refactor
- Don't mix old and new patterns in same PR

---

**Reference**: `.cursor/examples/user-table-docs.md` for documentation template
**Reference**: `src/features/catalogs-table/` for structure example

