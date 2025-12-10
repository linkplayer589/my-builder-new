# Quick Reference Guide

## 🎯 Core Rules - At a Glance

### File Naming
```
Format: [feature-name]-[descriptor].[ext]

Examples:
✅ user-table-header.tsx
✅ user-table-hooks.ts
✅ product-catalog-schema.ts

❌ header.tsx
❌ hooks.ts
❌ schema.ts
```

### Import Rules Cheat Sheet

| Location | ✅ Can Import | ❌ Cannot Import |
|----------|---------------|------------------|
| `/app` | `/features` only | Everything else |
| `/features/[name]` | `/components`, `/lib`, `/db`, same feature | Other features, `/app` |
| `/components` | `/components`, `/lib` | `/features`, `/db`, `/app` |
| `/db` or `/convex` | `/lib`, same db files | `/features`, `/components`, `/app` |

### Folder Structure

```
src/
├── app/              → ONLY imports from /features
├── features/         → Self-contained, portable modules
├── components/       → Generic UI (no feature deps)
├── db/ OR convex/    → Database layer (Convex-style)
└── lib/              → Shared utilities
```

### Database Organization

```
db/ (or convex/)
├── db-schemas/              → user-table-schema.ts
└── db-actions/              → Grouped by table
    └── db-user-actions/     → db-create-user-action.ts
                              → db-update-user-action.ts
                              → db-delete-user-action.ts
```

### Feature Structure

```
features/[feature-name]/
├── [feature-name]-components/
│   ├── [feature]-component.tsx
│   ├── [feature]-component-utils.ts    # Component-specific (1 component)
│   └── [feature]-component-types.ts    # Component-specific (1 component)
├── [feature-name]-hooks/       → Shared across feature (many components)
├── [feature-name]-utils/       → Shared across feature (many components)
├── [feature-name]-types/       → Shared across feature (many components)
├── [feature-name]-constants/   → [feature]-constants.ts
├── [feature-name]-features/    → Nested (parent-only)
└── index.ts                    → Public API
```

**Rule**: 1 component = keep with component. Many components = shared folder.

## 🔍 Quick Commands

### Search all related files
```
Cmd/Ctrl + P → "user-table"
```

### Check for cross-feature imports
```bash
grep -r "from '@/features/" features/user-table/
```

### Verify app only imports features
```bash
grep -r "from '@/components\|from '@/lib\|from '@/db'" app/
```

## ✅ Feature Checklist

- [ ] Files prefixed with feature name
- [ ] Folders prefixed with feature name
- [ ] No cross-feature imports
- [ ] Has `index.ts` with public API
- [ ] Has `[feature-name]-docs.md` documentation
- [ ] All functions have JSDoc comments
- [ ] Self-contained (components, hooks, utils, types)
- [ ] Can copy to another project and works with `pnpm install`

## 🚀 Quick Start

### Creating a New Feature

1. Create folder: `features/user-table/`
2. Add prefixed subfolders: `user-table-components/`, `user-table-hooks/`, `user-table-utils/`, `user-table-types/`
3. Prefix all files: `user-table-*.tsx`
4. Create `index.ts` with exports
5. Import in `/app` route

### Creating a New Database Table

1. Create schema: `db/db-schemas/user-table-schema.ts`
2. Create actions folder: `db/db-actions/db-user-actions/`
3. Create actions: `db-create-user-action.ts`, `db-update-user-action.ts`, `db-delete-user-action.ts`
4. **If NOT using Convex**: Add `'use cache'` and `cacheTag` to action files
5. Use in features: `import { createUserAction } from '@/db/db-actions/db-user-actions/db-create-user-action'`

### Database Caching (Non-Convex)

```typescript
// In actions - Add caching
export async function getUsersAction() {
  'use cache'
  cacheLife('hours')
  cacheTag('users-list')
  return await db.query.users.findMany()
}

// After mutations - Invalidate cache
export async function createUserAction(data) {
  const user = await db.insert.users.values(data)
  revalidateTag('users-list')
  return user
}
```

## 📦 Package Manager

**🚨 ALWAYS USE PNPM!**

```bash
# ✅ CORRECT
pnpm install
pnpm add [package]
pnpm dev

# ❌ WRONG
npm install
yarn add
npx command
```

---

**Remember:** Prefix → Portable → Searchable → pnpm 🎯

