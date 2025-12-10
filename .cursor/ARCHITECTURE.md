# Project Architecture Guide

## 🎯 Core Philosophy

This project follows a **feature-centric, portable architecture** with strict boundaries and context-search optimized naming.

### Key Principles

1. **Feature Portability** - Copy any feature to another project and it works
2. **Context Search** - Type a feature name to find ALL related files
3. **Strict Boundaries** - Clear import rules prevent tight coupling
4. **Convex Patterns** - Database organized with queries/mutations pattern
5. **Clean Architecture** - Layered structure with dependency rules

---

## 📁 Folder Structure

```
src/
├── app/                          # Next.js routes (ONLY imports from /features)
│   └── (routes)/
│       └── [route]/
│           ├── page.tsx          # ✅ import from /features
│           └── layout.tsx        # ✅ import from /features
│
├── features/                     # Self-contained feature modules
│   └── [feature-name]/          # e.g., user-table/
│       ├── [feature-name]-components/    # Feature UI components
│       │   ├── user-table-header.tsx
│       │   ├── user-table-row.tsx
│       │   └── user-table-footer.tsx
│       ├── [feature-name]-hooks/         # Feature-specific hooks
│       │   └── user-table-hooks.ts
│       ├── [feature-name]-utils/         # Feature utilities
│       │   └── user-table-utils.ts
│       ├── [feature-name]-types/         # Feature type definitions
│       │   └── user-table-types.ts
│       ├── [feature-name]-constants/     # Feature constants
│       │   └── user-table-constants.ts
│       ├── [feature-name]-features/      # Nested features (parent-only usage)
│       │   └── user-table-details/
│       │       └── ...
│       └── index.ts             # Public API export
│
├── components/                  # Generic, reusable UI components
│   ├── ui/                      # Basic UI elements (Button, Input, etc.)
│   ├── layouts/                 # Shared layouts
│   └── providers/               # Context providers
│
├── db/ OR convex/               # Database layer (Convex-style organization)
│   ├── db-schemas/              # Database schemas
│   │   ├── user-table-schema.ts
│   │   └── product-catalog-schema.ts
│   └── db-actions/              # Grouped by table
│       ├── db-user-actions/
│       │   ├── db-create-user-action.ts
│       │   ├── db-update-user-action.ts
│       │   └── db-delete-user-action.ts
│       └── db-product-catalog-actions/
│
└── lib/                         # Shared utilities
    ├── hooks/                   # Shared hooks
    ├── utils/                   # Shared utilities
    ├── constants/               # Global constants
    └── config/                  # Configuration
```

---

## 🔍 Context-Search Naming Convention

### The Problem
Without prefixes, searching for "user table" returns scattered results making it hard to find all related files.

### The Solution
**Always prefix files with feature/table name:**

```
✅ CORRECT:
user-table-header.tsx
user-table-hooks.ts
user-table-utils.ts
user-table-schema.ts
user-table-queries.ts

❌ INCORRECT:
header.tsx
hooks.ts
utils.ts
schema.ts
queries.ts
```

### The Benefit
Type `user-table` in search → Find **ALL** related files instantly! 🎯

---

## 🏗️ Feature Architecture

### Self-Contained Features

Features must be **completely portable** - copy to another project and it works after `pnpm install`.

#### ✅ Good Feature Structure

```typescript
// features/user-table/index.ts
export { UserTableHeader } from './components/user-table-header'
export { UserTableRow } from './components/user-table-row'
export { useUserTable } from './hooks/user-table-hooks'
export type { TUserTableProps } from './types/user-table-types'

// features/user-table/components/user-table-header.tsx
import { Button } from '@/components/ui/button'           // ✅ Generic component
import { useUserTable } from '../hooks/user-table-hooks' // ✅ Same feature
import { formatDate } from '@/lib/utils'                  // ✅ Shared utility

export function UserTableHeader() {
  const { data } = useUserTable()
  return <div>...</div>
}
```

#### ❌ Bad Feature Structure

```typescript
// ❌ Importing from other features breaks portability
import { ProductCard } from '@/features/product-catalog/components/product-card'

// ❌ Importing from /app breaks feature independence
import { AdminLayout } from '@/app/admin/layout'
```

### Nested Features

Nested features indicate **parent-only usage**:

```
features/
└── user-table/                      # Parent feature
    └── user-table-features/         # Nested features
        └── user-details/            # ONLY used by user-table
            ├── user-details-components/
            │   └── user-details-form.tsx
            └── index.ts
```

**Rule:** If nested, it's only used by the parent. If used elsewhere, promote it to top-level feature.

---

## 🔒 Import Rules

### `/app` Routes
```typescript
// ✅ ONLY import from /features
import { UserTable } from '@/features/user-table'

// ❌ Do NOT import from anywhere else
import { Button } from '@/components/ui/button'      // ❌
import { getUserData } from '@/db/queries'            // ❌
import { formatDate } from '@/lib/utils'              // ❌
```

**Why?** Routes should only compose features. All logic lives in features.

### `/features` Modules
```typescript
// ✅ Can import:
import { Button } from '@/components/ui/button'           // Generic components
import { formatDate } from '@/lib/utils'                  // Shared utilities
import { getUserQuery } from '@/db/queries'               // Database layer
import { useUserTable } from '../hooks/user-table-hooks' // Same feature
import { UserDetails } from './features/user-details'    // Nested features

// ❌ Cannot import:
import { ProductCard } from '@/features/product-catalog'  // Other features
import { AdminLayout } from '@/app/admin/layout'          // App routes
```

**Why?** Features must be independent for portability.

### `/components` Generic UI
```typescript
// ✅ Can import:
import { cn } from '@/lib/utils'                  // Shared utilities
import { Card } from './card'                     // Other components

// ❌ Cannot import:
import { useUserTable } from '@/features/user-table' // Features
import { getUserQuery } from '@/db/queries'          // Database
```

**Why?** Generic components should be pure UI with no business logic.

### `/db` or `/convex` Database Layer
```typescript
// ✅ Can import:
import { z } from 'zod'                           // External libraries
import { db } from '@/lib/db-client'              // Shared utilities
import { userTableSchema } from './schemas'       // Other DB files

// ❌ Cannot import:
import { UserTable } from '@/features/user-table' // Features
import { Button } from '@/components/ui/button'   // Components
```

**Why?** Database layer should be independent of UI concerns.

---

## 🗄️ Database Organization

### Convex-Style for ALL Databases

Whether using Convex, PostgreSQL, MySQL, or any database, follow this pattern:

#### Folder Choice
- Use `/convex` when using Convex as database provider
- Use `/db` for all other databases (PostgreSQL, MySQL, MongoDB, etc.)

#### Organization
```
db/ (or convex/)
├── db-schemas/              # Table/Collection schemas
│   ├── user-table-schema.ts
│   └── product-catalog-schema.ts
│
└── db-actions/              # Grouped by table
    ├── db-user-actions/
    │   ├── db-create-user-action.ts
    │   ├── db-update-user-action.ts
    │   └── db-delete-user-action.ts
    └── db-product-catalog-actions/
        └── ...
```

#### Example Files

```typescript
// db/db-schemas/user-table-schema.ts
import { z } from 'zod'

export const userTableSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string(), // yyyy-mm-dd format
})

export type TUserTable = z.infer<typeof userTableSchema>
```

```typescript
// db/db-actions/db-user-actions/db-get-users-action.ts
import { db } from '@/lib/db-client'
import type { TUserTable } from '../../db-schemas/user-table-schema'

/**
 * Fetch all users from the database
 */
export async function getUsersAction(): Promise<TUserTable[]> {
  return await db.query.users.findMany()
}

/**
 * Fetch a single user by ID
 */
export async function getUserByIdAction(id: string): Promise<TUserTable | null> {
  return await db.query.users.findFirst({ where: { id } })
}
```

```typescript
// db/db-actions/db-user-actions/db-create-user-action.ts
import { db } from '@/lib/db-client'
import type { TUserTable } from '../../db-schemas/user-table-schema'

/**
 * Create a new user in the database
 */
export async function createUserAction(data: Omit<TUserTable, 'id'>): Promise<TUserTable> {
  return await db.insert.users.values(data).returning()
}
```

```typescript
// db/db-actions/db-user-actions/db-update-user-action.ts
import { db } from '@/lib/db-client'
import type { TUserTable } from '../../db-schemas/user-table-schema'

/**
 * Update an existing user by ID
 */
export async function updateUserAction(id: string, data: Partial<TUserTable>): Promise<TUserTable> {
  return await db.update.users.set(data).where({ id }).returning()
}
```

### Caching (When NOT Using Convex)

When using databases other than Convex, implement Next.js experimental caching:

```typescript
// db/db-actions/db-user-actions/db-get-users-action.ts
import { cacheLife, cacheTag } from 'next/cache'

export async function getUsersAction(): Promise<TUserTable[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('users-list')
  
  return await db.query.users.findMany()
}

// After mutations, invalidate cache
import { revalidateTag } from 'next/cache'

export async function createUserAction(data: Omit<TUserTable, 'id'>): Promise<TUserTable> {
  const user = await db.insert.users.values(data).returning()
  revalidateTag('users-list')
  return user
}
```

**Enable in next.config.ts:**
```typescript
const nextConfig: NextConfig = {
  experimental: {
    useCache: true,
  },
}
```

See `.cursor/rules/02-database-organization.mdc#caching-strategy` for complete documentation.

---

## ✅ Feature Portability Checklist

Before considering a feature "complete," verify:

- [ ] All files prefixed with feature name
- [ ] All folders prefixed with feature name
- [ ] No cross-feature imports (only same feature or shared resources)
- [ ] Public API exported through `index.ts`
- [ ] Has `[feature-name]-docs.md` with comprehensive documentation
- [ ] All functions have JSDoc comments
- [ ] Documentation includes file tree with explanations
- [ ] Documentation includes usage examples
- [ ] External dependencies clearly documented
- [ ] Nested features only used by parent
- [ ] Self-contained with own components, hooks, utils, types
- [ ] Can be copied to another project and work after `pnpm install`

**Note**: Always use `pnpm install`, never npm or yarn!

---

## 📚 Real-World Example

### User Table Feature

```
features/user-table/
├── user-table-components/
│   ├── user-table-header.tsx      # Table header with actions
│   ├── user-table-header-utils.ts # Component-specific utils (ONLY used by header)
│   ├── user-table-header-types.ts # Component-specific types (ONLY used by header)
│   ├── user-table-row.tsx         # Individual row component
│   ├── user-table-filters.tsx     # Filter controls
│   └── user-table-pagination.tsx  # Pagination controls
├── user-table-hooks/
│   └── user-table-hooks.ts        # useUserTable, useUserFilters (shared across feature)
├── user-table-utils/
│   └── user-table-utils.ts        # sortUsers, filterUsers, etc. (shared across feature)
├── user-table-types/
│   └── user-table-types.ts        # TUserTableProps, TUserFilter (shared across feature)
├── user-table-constants/
│   └── user-table-constants.ts    # DEFAULT_PAGE_SIZE, SORT_OPTIONS
├── user-table-features/
│   └── user-details/              # Nested feature (parent-only)
│       ├── user-details-components/
│       │   └── user-details-form.tsx
│       └── index.ts
└── index.ts                       # Public exports
```

### Component-Specific vs Shared Files

**IMPORTANT**: Keep component-specific files with the component:

**✅ Component-Specific (single component use):**
```
user-table-components/
├── user-table-header.tsx
├── user-table-header-utils.ts     # ONLY used by user-table-header
├── user-table-header-types.ts     # ONLY used by user-table-header
└── user-table-header-hooks.ts     # ONLY used by user-table-header
```

**✅ Shared Feature Files (multiple components):**
```
user-table-utils/
└── user-table-utils.ts             # Used by multiple components

user-table-types/
└── user-table-types.ts             # Shared types across feature
```

**Rule**: If it's used by ONE component → keep with component. If used by MANY → use shared folder.

### App Route Usage

```typescript
// app/admin/users/page.tsx
import { UserTable } from '@/features/user-table'

export default function UsersPage() {
  return (
    <div>
      <h1>Users</h1>
      <UserTable />
    </div>
  )
}
```

### Searching for User Table Files

1. Open search (Cmd/Ctrl + P)
2. Type: `user-table`
3. Result: **ALL** user-table related files appear! 🎯

---

## 🚀 Migration Guide

### Converting Existing Features

1. **Add prefixes to all files:**
   ```
   header.tsx → user-table-header.tsx
   hooks.ts → user-table-hooks.ts
   ```

2. **Update imports:**
   ```typescript
   // Before
   import { Header } from './components/header'
   
   // After
   import { UserTableHeader } from './components/user-table-header'
   ```

3. **Create index.ts with public API:**
   ```typescript
   export { UserTableHeader } from './components/user-table-header'
   export { useUserTable } from './hooks/user-table-hooks'
   export type * from './types/user-table-types'
   ```

4. **Remove cross-feature imports:**
   - Move shared code to `/lib`
   - Or duplicate if feature-specific

5. **Update app routes:**
   ```typescript
   // Before
   import { Header } from '@/components/header'
   
   // After
   import { UserTable } from '@/features/user-table'
   ```

---

## 🎓 Best Practices

### DO ✅

- Prefix ALL files with feature/table name
- Keep features self-contained and portable
- Export public API through `index.ts`
- Use nested features for parent-only components
- Follow Convex patterns for database (queries/mutations)
- Import only from allowed layers
- Document external dependencies

### DON'T ❌

- Cross-feature imports (breaks portability)
- Import from `/app` in features
- Create files without feature prefix
- Mix database patterns (stick to queries/mutations)
- Use `any` type (always define proper types)
- Create huge multi-component files

---

## 🔧 Tools & Commands

### Context Search
```bash
# Find all files related to user-table
Cmd/Ctrl + P → "user-table"
```

### Check Feature Portability
```bash
# Look for cross-feature imports
grep -r "from '@/features/" features/user-table/
# Should only show imports from same feature
```

### Verify App Imports
```bash
# Ensure app only imports from features
grep -r "from '@/" app/
# Should only show @/features imports
```

---

## 📦 Package Manager

**🚨 ALWAYS USE PNPM - NEVER npm or yarn!**

This project enforces `pnpm` as the package manager (defined in `package.json`).

### Why pnpm?

- ⚡ **Faster** - 2x faster than npm
- 💾 **Efficient** - Saves disk space with hard links
- 🔒 **Secure** - Strict dependency resolution
- ✅ **Standard** - Project-wide requirement

### Commands

```bash
# Install dependencies
pnpm install

# Add a package
pnpm add [package]

# Remove a package
pnpm remove [package]

# Run scripts
pnpm dev
pnpm build
pnpm lint

# Use pnpm dlx instead of npx
pnpm dlx [command]
```

### ❌ Never Use

```bash
npm install      # ❌ Use: pnpm install
yarn add         # ❌ Use: pnpm add
npx command      # ❌ Use: pnpm dlx command
```

See `.cursor/rules/08-package-manager.mdc` for complete documentation.

---

## 📖 Additional Resources

- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Convex Database Patterns](https://docs.convex.dev/database)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [pnpm Documentation](https://pnpm.io/)

---

## 🤝 Contributing

When adding new features:

1. Follow the naming convention (feature-prefix)
2. Ensure feature is self-contained
3. Update feature `index.ts` with public API
4. Document external dependencies
5. Verify portability checklist
6. Test in isolation before integrating

---

**Remember:** The goal is **portable, searchable, maintainable** features! 🎯

