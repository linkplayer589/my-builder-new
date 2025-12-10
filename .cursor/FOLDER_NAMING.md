# Folder Naming Convention

## 🎯 Core Rule

**ALL folders within a feature MUST be prefixed with the feature name** for maximum searchability.

---

## ✅ Correct Structure

```
features/user-table/
├── user-table-components/
│   ├── user-table-header.tsx
│   ├── user-table-row.tsx
│   └── user-table-footer.tsx
├── user-table-hooks/
│   └── user-table-hooks.ts
├── user-table-utils/
│   └── user-table-utils.ts
├── user-table-types/
│   └── user-table-types.ts
├── user-table-constants/
│   └── user-table-constants.ts
├── user-table-features/       # Nested features
│   └── user-details/
└── index.ts
```

---

## ❌ Incorrect Structure

```
features/user-table/
├── components/                 ❌ Missing prefix
│   └── user-table-header.tsx
├── hooks/                      ❌ Missing prefix
│   └── user-table-hooks.ts
├── utils/                      ❌ Missing prefix
│   └── user-table-utils.ts
└── index.ts
```

---

## 🔍 The Benefit

### With Prefixed Folders

Search for `user-table` → Find **EVERYTHING**:
- ✅ `user-table-components/` folder
- ✅ `user-table-hooks/` folder
- ✅ `user-table-utils/` folder
- ✅ `user-table-header.tsx` file
- ✅ `user-table-hooks.ts` file
- ✅ All related files and folders!

### Without Prefixed Folders

Search for `user-table` → Only find files:
- ✅ `user-table-header.tsx` file
- ✅ `user-table-hooks.ts` file
- ❌ `components/` folder (not found)
- ❌ `hooks/` folder (not found)
- ❌ `utils/` folder (not found)

---

## 📋 Standard Folder Names

For every feature, use these prefixed folders:

| Folder | Purpose | Example Files |
|--------|---------|---------------|
| `[feature]-components/` | UI components | `user-table-header.tsx` |
| `[feature]-hooks/` | Custom hooks | `user-table-hooks.ts` |
| `[feature]-utils/` | Utility functions | `user-table-utils.ts` |
| `[feature]-types/` | Type definitions | `user-table-types.ts` |
| `[feature]-constants/` | Constants | `user-table-constants.ts` |
| `[feature]-features/` | Nested features | Subfeatures |

---

## 🎓 Nested Features

Nested features also use prefixed folders:

```
features/user-table/
└── user-table-features/
    └── user-details/
        ├── user-details-components/
        │   └── user-details-form.tsx
        ├── user-details-hooks/
        │   └── user-details-hooks.ts
        └── index.ts
```

**Search**: Type `user-details` → Find all user-details folders and files!

---

## 💡 Why This Matters

### 1. **Instant Discovery**
- Type feature name once
- Find ALL related folders AND files
- No need to navigate manually

### 2. **Clear Ownership**
- Folder names show which feature they belong to
- No confusion about generic folders
- Easy to identify orphaned folders

### 3. **Better Refactoring**
- Moving features is easier
- Search-and-replace works on folders too
- Rename operations are safer

### 4. **AI-Friendly**
- AI can find all feature folders easily
- Better context for code generation
- Clearer project structure understanding

---

## 🚀 Migration Guide

### Converting Existing Features

**Before:**
```bash
features/user-table/
├── components/
├── hooks/
└── utils/
```

**After:**
```bash
features/user-table/
├── user-table-components/
├── user-table-hooks/
└── user-table-utils/
```

### Migration Steps:

1. **Rename folders** with prefix:
   ```bash
   cd features/user-table
   mv components user-table-components
   mv hooks user-table-hooks
   mv utils user-table-utils
   mv types user-table-types
   mv constants user-table-constants
   mv features user-table-features
   ```

2. **Update imports** in files:
   ```typescript
   // Before
   import { UserTableHeader } from './components/user-table-header'
   
   // After
   import { UserTableHeader } from './user-table-components/user-table-header'
   ```

3. **Update index.ts**:
   ```typescript
   // Before
   export { UserTableHeader } from './components/user-table-header'
   
   // After
   export { UserTableHeader } from './user-table-components/user-table-header'
   ```

4. **Test thoroughly** to ensure all imports work

---

## ⚠️ Important Notes

### Always Prefix

- ✅ **DO** prefix all feature subfolders
- ✅ **DO** prefix nested feature folders
- ✅ **DO** maintain consistency across all features

### Exceptions

- ❌ **DO NOT** prefix the main feature folder name
  - Correct: `features/user-table/`
  - Wrong: `features/features-user-table/`

- ❌ **DO NOT** prefix generic components folder
  - Correct: `components/ui/button.tsx`
  - Wrong: `components/components-ui/button.tsx`

- ❌ **DO NOT** prefix database folders
  - Correct: `db/schemas/user-table-schema.ts`
  - Wrong: `db/db-schemas/user-table-schema.ts`

---

## 🔗 Related Documentation

- `.cursor/rules/03-feature-architecture.mdc` - Feature structure rules
- `.cursor/rules/05-naming-conventions.mdc` - Complete naming guide
- `.cursor/ARCHITECTURE.md` - Full architecture documentation

---

## ✅ Summary

**Prefix every folder within a feature with the feature name for maximum searchability!**

This ensures:
- ✅ Complete context search coverage
- ✅ Clear ownership and organization
- ✅ Easy feature migration
- ✅ AI-friendly structure

**Type the feature name → Find EVERYTHING related to it!** 🎯

---

**Last Updated**: 2025-10-02  
**Maintained By**: Development Team

