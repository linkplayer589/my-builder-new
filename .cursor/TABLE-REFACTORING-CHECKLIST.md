# Table Refactoring Checklist

Use this checklist when refactoring any table to ensure consistency.

---

## 📋 Pre-Refactoring Checklist

- [ ] Identify current table location
- [ ] List all files that need to be moved
- [ ] Identify all files that import this table
- [ ] Note any custom components (mobile cards, expanded rows, etc.)
- [ ] Check for server actions
- [ ] Review existing functionality to preserve

---

## 🏗️ Structure Setup

- [ ] Create top-level feature folder: `src/features/[table-name]-table/`
- [ ] Create subfolders:
  - [ ] `[table-name]-table-components/`
  - [ ] `[table-name]-table-types/`
  - [ ] `[table-name]-table-actions/` (if needed)
- [ ] Create documentation file: `[table-name]-table-docs.md`

---

## 📝 File Migration

### Types
- [ ] Create `[table-name]-table-types/[table-name]-table-types.ts`
- [ ] Add `TTableProps` type
- [ ] Add `TTableColumnsProps` type
- [ ] Add `TTableColumns` type
- [ ] Add any additional component prop types
- [ ] Create index file: `[table-name]-table-types/index.ts`

### Components
- [ ] Move main table → `[table-name]-table-components/[table-name]-table-component.tsx`
- [ ] Add JSDoc to main component
- [ ] Update imports to use types from types folder
- [ ] Move columns file → `[table-name]-table-components/[table-name]-table-columns.tsx`
- [ ] Add JSDoc to columns function
- [ ] Move any additional components (mobile cards, expanded rows, etc.)
- [ ] Create index file: `[table-name]-table-components/index.ts`

### Actions (if applicable)
- [ ] Move/create actions in `[table-name]-table-actions/`
- [ ] Prefix action files: `[table-name]-table-[action].ts`
- [ ] Add JSDoc to all actions
- [ ] Create index file: `[table-name]-table-actions/index.ts`

---

## 🔗 Index Files

### Component Index
```typescript
// [table-name]-table-components/index.ts
export { TableNameTable } from './[table-name]-table-component'
export { getTableNameTableColumns } from './[table-name]-table-columns'
// Export other components...
```

### Types Index
```typescript
// [table-name]-table-types/index.ts
export type {
  TTableNameTableProps,
  TTableNameTableColumnsProps,
  TTableNameTableColumns,
  // Export other types...
} from './[table-name]-table-types'
```

### Main Index
```typescript
// index.ts
/**
 * [Table Name] Table Feature
 */

// Components
export {
  TableNameTable,
  getTableNameTableColumns,
} from './[table-name]-table-components'

// Types
export type {
  TTableNameTableProps,
  TTableNameTableColumnsProps,
  TTableNameTableColumns,
} from './[table-name]-table-types'

// Actions (if applicable)
export {
  tableNameAction,
} from './[table-name]-table-actions'
```

---

## 📚 Documentation

- [ ] Create `[table-name]-table-docs.md`
- [ ] Add overview section
- [ ] Add file tree with explanations
- [ ] Document all components and functions:
  - [ ] Main table component
  - [ ] Column generation function
  - [ ] Any additional components
- [ ] Add type definitions section
- [ ] Add state management section
- [ ] Add external dependencies section
- [ ] Add usage examples (at least 3)
- [ ] Add testing guidelines
- [ ] Add known issues/limitations
- [ ] Add change log

---

## 🔄 Import Updates

- [ ] Find all files that import the table
- [ ] Update import statements:

```typescript
// Before:
import { Table } from '@/features/[old-path]/table'

// After:
import { Table } from '@/features/[table-name]-table'
```

Common files to check:
- [ ] `src/app/admin/[resortName]/*/page.tsx` files
- [ ] Any feature that uses this table
- [ ] Test files (if any)

---

## ✅ Quality Checks

### Code Quality
- [ ] All files have JSDoc comments
- [ ] All types properly defined (no `any`)
- [ ] Consistent naming throughout
- [ ] All functions have type annotations
- [ ] Imports organized (external → internal → relative)

### Naming Verification
- [ ] All folders prefixed: `[table-name]-table-*`
- [ ] All files prefixed: `[table-name]-table-*`
- [ ] Component names in PascalCase
- [ ] Function names in camelCase
- [ ] Type names with `T` prefix
- [ ] Interface names with `I` prefix (if any)

### File Structure
- [ ] Follows standard structure:
  ```
  [table-name]-table/
  ├── [table-name]-table-components/
  ├── [table-name]-table-types/
  ├── [table-name]-table-docs.md
  └── index.ts
  ```

---

## 🧪 Testing

### Manual Testing
- [ ] Table renders without errors
- [ ] All columns display correctly
- [ ] Sorting works on all sortable columns
- [ ] Filtering works with advanced filters
- [ ] Pagination works (next, prev, page size)
- [ ] Mobile view displays correctly
- [ ] All action buttons/dialogs work
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No lint errors

### Responsive Testing
- [ ] Desktop view (1920x1080)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)
- [ ] Mobile columns filter correctly
- [ ] Mobile cards display properly (if applicable)

### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

---

## 🗑️ Cleanup

- [ ] Delete old folder structure
- [ ] Remove any unused imports
- [ ] Clean up any commented code
- [ ] Verify no references to old paths remain
- [ ] Update any documentation that referenced old paths

---

## 📦 Final Verification

- [ ] Feature is fully self-contained
- [ ] No cross-feature imports (except shared components/utils)
- [ ] All types exported through index
- [ ] Documentation is comprehensive
- [ ] Follows project architecture rules
- [ ] Can be copied to another project and work after `pnpm install`

---

## 🎯 Success Criteria

✅ You can search for `[table-name]-table` and find ALL related files instantly
✅ Feature can be copied to another project easily
✅ Documentation enables AI to understand and modify the table
✅ No architectural rule violations
✅ All functionality preserved from original

---

## 📝 Notes Template

Use this template to track your progress:

```
Table: [name]
Started: [date]
Completed: [date]

Files Moved:
- [ ] [original path] → [new path]
- [ ] ...

Import Updates:
- [ ] [file path]
- [ ] ...

Issues Encountered:
- [list any issues]

Testing Notes:
- [any testing observations]
```

---

## 🔗 References

- `.cursor/TABLE-REFACTORING-PLAN.md` - Overall plan
- `.cursor/ORDERS-TABLE-REFACTORING-EXAMPLE.md` - Detailed example
- `.cursor/examples/user-table-docs.md` - Documentation template
- `src/features/catalogs-table/` - Reference implementation
- `.cursor/rules/` - Project architecture rules

---

**Print this checklist and use it for each table refactoring!**

