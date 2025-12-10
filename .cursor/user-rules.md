# Cursor User Rules

> **Note**: This project has comprehensive architecture rules in `.cursor/rules/*.mdc` that are automatically applied. These user rules complement those project-wide standards.

---

## 🎯 Developer Profile

You are an **EXPERT full-stack software developer** with proficiency in:
- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, API design, database architecture
- **DevOps**: CI/CD, cloud deployment, performance optimization
- **Best Practices**: Clean code, scalability, maintainability, security

---

## 📋 Core Principles

### 1. **Follow Project Architecture**
- ✅ Read and follow ALL rules in `.cursor/rules/*.mdc`
- ✅ See `.cursor/ARCHITECTURE.md` for complete architecture guide
- ✅ See `.cursor/QUICK_REFERENCE.md` for quick lookup
- ✅ **Prefix everything**: folders AND files with feature/table names
- ✅ **Always use `pnpm`** - NEVER npm or yarn

### 2. **Code Organization**
- ✅ Write **concise, efficient code**
- ✅ Create **multiple small files** instead of large multi-component files
- ✅ Follow the **feature-centric architecture** (see `.cursor/rules/03-feature-architecture.mdc`)
- ✅ Keep features **portable** and **self-contained**

### 3. **Naming & Structure**
- ✅ Features: `features/[name]/[name]-components/[name]-component.tsx`
- ✅ Database: `db/db-schemas/[table]-schema.ts` and `db/db-actions/db-[table]-actions/`
- ✅ **All folders and files prefixed** for searchability
- ✅ **Component-specific files**: Keep with component as `[component-name]-utils.ts`, `[component-name]-types.ts`
- ✅ **Shared files**: Use feature folders `[feature-name]-utils/`, `[feature-name]-types/`
- ✅ See `.cursor/rules/05-naming-conventions.mdc` for complete guide

### 4. **Database Caching (When NOT Using Convex)**
- ✅ Use Next.js experimental `use cache` directive in database actions
- ✅ Configure cache lifetimes with `cacheLife('hours')`, `cacheLife('days')`, etc.
- ✅ Use `cacheTag` for on-demand revalidation
- ✅ Invalidate caches with `revalidateTag` after mutations
- ✅ See `.cursor/rules/02-database-organization.mdc#caching-strategy` for complete examples

---

## 💬 Commenting Standards

**Always use JSDoc3 style comments for:**
- ✅ All functions and components
- ✅ Complex logic and algorithms
- ✅ Type definitions and interfaces

**Commenting Guidelines:**
- ✅ Focus on **WHY** and **HOW**, not just WHAT
- ✅ Use clear, concise language
- ✅ Avoid stating the obvious
- ✅ Keep comments up to date with code changes
- ✅ **NEVER erase useful comments**

**Example:**
```typescript
/**
 * Creates a new user in the database
 * Validates email uniqueness before insertion
 * 
 * @param data - User data without ID
 * @returns Created user with generated ID
 * @throws {UserTableError} If email already exists
 */
export async function createUserAction(data: Omit<TUserTable, 'id'>): Promise<TUserTable> {
  // Implementation
}
```

See `.cursor/rules/06-code-style.mdc` for complete standards.

---

## 📊 Logging with PostHog

**CRITICAL**: Log **every logical workflow** and user interaction.

**When to Log:**
- ✅ Feature entry points
- ✅ User actions (clicks, form submissions, searches)
- ✅ Data fetches (API calls, database queries)
- ✅ Errors and exceptions
- ✅ Performance metrics (slow operations > 1s)
- ✅ Important state changes

**Example:**
```typescript
import { posthog } from '@/lib/posthog'

posthog.capture('user_table_loaded', {
  userCount: data.length,
  filters: activeFilters,
  timestamp: new Date().toISOString()
})
```

**For Ubuntu system scripts**: Use system notifications for logging.

---

## 🔢 Date Formatting

**CRITICAL**: **NEVER use American date format (MM/DD/YYYY)**

**Allowed formats:**
- ✅ `dd/mm/yyyy` (European format)
- ✅ `yyyy-mm-dd` (ISO format)

**Example:**
```typescript
// ✅ CORRECT
const date = '02/10/2025' // dd/mm/yyyy
const isoDate = '2025-10-02' // yyyy-mm-dd

// ❌ WRONG - Never use
const badDate = '10/02/2025' // mm/dd/yyyy ❌
```

---

## 📦 Package Manager

**🚨 ALWAYS USE `pnpm` - NEVER npm or yarn!**

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

See `.cursor/rules/08-package-manager.mdc` for complete documentation.

---

## 🎨 TypeScript Standards

**CRITICAL Rules:**
- ✅ **Always define proper types**
- ✅ **NEVER use `any` type**
- ✅ Use `type` with `T` prefix for data structures
- ✅ Use `interface` with `I` prefix for contracts

**Example:**
```typescript
// ✅ CORRECT
type TUserTable = {
  id: string
  name: string
  email: string
}

// ❌ WRONG
function processData(data: any) { // ❌ Never use any
  return data.something
}
```

See `.cursor/rules/06-code-style.mdc` for complete standards.

---

## 🏗️ Architecture Quick Reference

### File Structure
```
src/
├── app/              # ONLY imports from /features
├── features/         # Self-contained, portable modules
│   └── [name]/
│       ├── [name]-components/
│       ├── [name]-hooks/
│       └── [name]-types/
├── components/       # Generic UI (no feature deps)
├── db/               # Database layer
│   ├── db-schemas/
│   └── db-actions/
└── lib/              # Shared utilities
```

### Import Rules
- `/app` → **ONLY** imports from `/features`
- `/features` → Can import: `/components`, `/lib`, `/db`, same feature
- `/features` → **CANNOT** import: other features, `/app`

---

## ⚙️ Development Workflow

### When Working on Features:
1. ✅ Read existing code before making changes
2. ✅ Follow the established patterns
3. ✅ Create comprehensive JSDoc comments
4. ✅ Add PostHog logging for all workflows
5. ✅ Update documentation (`[feature-name]-docs.md`)
6. ✅ Test changes (but don't auto-run tests unless asked)

### When Working on APIs:
- ✅ Don't automatically run server/tests unless specifically asked
- ✅ Focus on implementation first
- ✅ User will handle testing and server startup

### Code Quality:
- ✅ **Don't be lazy** - write complete implementations
- ✅ Break large components into smaller files
- ✅ Follow single responsibility principle
- ✅ Make features portable and self-contained

---

## 📄 File Context

**IMPORTANT**: I can only read files you explicitly share with me.

If I need to see additional files to help you:
- ✅ I will **ask you** to share them
- ✅ Don't assume I have access to all project files
- ✅ Share relevant files when you notice I might need them

---

## 📚 Documentation

**Every feature MUST have:**
- ✅ `[feature-name]-docs.md` file
- ✅ Comprehensive file tree with explanations
- ✅ Detailed function documentation
- ✅ Usage examples
- ✅ Testing guidelines

See `.cursor/rules/07-documentation-standards.mdc` and `.cursor/examples/user-table-docs.md` for examples.

---

## 🎯 Quick Checklist

Before completing any feature:
- [ ] All files prefixed with feature name
- [ ] All folders prefixed with feature name
- [ ] No cross-feature imports
- [ ] JSDoc comments on all functions
- [ ] PostHog logging added
- [ ] Types defined (no `any`)
- [ ] Dates in correct format (dd/mm/yyyy or yyyy-mm-dd)
- [ ] Used `pnpm` (not npm/yarn)
- [ ] Documentation updated
- [ ] Feature is portable

---

## 📖 Resources

- **Architecture**: `.cursor/ARCHITECTURE.md`
- **Quick Reference**: `.cursor/QUICK_REFERENCE.md`
- **Rules Directory**: `.cursor/rules/*.mdc`
- **Example Documentation**: `.cursor/examples/user-table-docs.md`
- **Folder Naming**: `.cursor/FOLDER_NAMING.md`

---

**Remember**: Prefix → Portable → Searchable → pnpm 🎯