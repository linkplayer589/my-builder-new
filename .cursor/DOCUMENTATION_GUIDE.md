# Documentation Guide

## 📚 Overview

This project requires **comprehensive documentation** for every feature, component, and subfeature. Documentation must be detailed enough for professional software development AI to understand and work with the code effectively.

---

## 🎯 Quick Start

### For Every Feature/Component

**1. Create Documentation File**:
```
features/[feature-name]/[feature-name]-docs.md
```

**2. Must Include**:
- ✅ Overview explaining what it does
- ✅ File tree with explanations for each file
- ✅ Detailed function documentation
- ✅ State management details
- ✅ External dependencies list
- ✅ Usage examples
- ✅ Testing guidelines
- ✅ Known issues & limitations
- ✅ Change log

---

## 📋 Documentation Template

```markdown
# [Feature Name] Documentation

## Overview
[Detailed explanation of purpose, use cases, and key functionality]

## File Tree
\```
feature-name/
├── feature-name-components/
│   └── feature-name-header.tsx
│       → [Detailed explanation of what happens in this file]
├── feature-name-hooks/
│   └── feature-name-hooks.ts
│       → [Detailed explanation]
\```
\```

## Functions & Components

### FunctionName()

**Purpose**: [Detailed purpose]

**Parameters**:
- `param: Type` - [Description]

**Returns**: [Return type and description]

**Side Effects**: [List all side effects]

**Example Usage**:
\```typescript
// Example code
\```

**Internal Logic**:
1. [Step-by-step explanation]

**Dependencies**: [List all dependencies]

## State Management
[Document all state]

## External Dependencies
[List with versions and reasoning]

## Usage Examples
[Comprehensive examples]

## Testing Guidelines
[Required tests]

## Known Issues & Limitations
[Document limitations]

## Change Log
### [Version] - [Date]
- [Changes]
```

---

## ✅ Documentation Checklist

Before considering documentation complete:

- [ ] Overview section explains purpose clearly
- [ ] File tree lists ALL files with explanations
- [ ] Every public function documented with:
  - [ ] Purpose
  - [ ] Parameters (all of them)
  - [ ] Return value
  - [ ] Side effects
  - [ ] Example usage
  - [ ] Internal logic (step-by-step)
  - [ ] Dependencies
- [ ] State management documented
- [ ] External dependencies listed with versions
- [ ] Usage examples provided (at least 3)
- [ ] Testing guidelines included
- [ ] Known limitations documented
- [ ] Change log started

---

## 🔍 Example Documentation

See `.cursor/examples/user-table-docs.md` for a **complete reference implementation**.

This example demonstrates:
- ✅ Proper overview structure
- ✅ Comprehensive file tree
- ✅ Detailed function documentation
- ✅ Multiple usage examples
- ✅ Testing guidelines
- ✅ Known issues documentation
- ✅ Complete change log

---

## 📝 Update Requirements

### When to Update

Documentation MUST be updated:

1. ✅ **After every code change** affecting:
   - Function signatures
   - Component props
   - State management
   - Dependencies
   - File structure

2. ✅ **When adding**:
   - New functions
   - New files
   - New dependencies

3. ✅ **When removing**:
   - Deprecated code
   - Old files

### Update Process

1. Update JSDoc comments in code
2. Update `[feature-name]-docs.md` file
3. Include documentation updates in PR
4. Documentation reviewed before PR approval

---

## 💡 Writing for AI

Documentation should enable AI to:

✅ Understand feature without reading code  
✅ Modify functions correctly  
✅ Trace data flow through system  
✅ Identify side effects and dependencies  
✅ Generate test cases  
✅ Refactor safely with full context  

### Detail Level Required

Each function documentation must include:

1. **Purpose** - What and why
2. **Parameters** - Every parameter with type
3. **Returns** - Return type and description
4. **Side Effects** - State changes, API calls, logging
5. **Example Usage** - At least one code example
6. **Internal Logic** - Step-by-step flow
7. **Dependencies** - All imports and why
8. **Error Handling** - What errors occur
9. **Performance** - Complexity if relevant
10. **PostHog Events** - Analytics events

---

## 🎓 Best Practices

### DO ✅

- Be explicit - don't assume context
- Be detailed - explain WHY, not just WHAT
- Be accurate - keep in sync with code
- Be structured - use consistent formatting
- Be professional - write for AI and humans
- Update immediately after changes
- Include code examples
- Document edge cases
- Explain performance implications
- List all side effects

### DON'T ❌

- Don't write vague descriptions
- Don't skip parameter documentation
- Don't forget to update after changes
- Don't assume reader knows context
- Don't write incomplete examples
- Don't skip error handling docs
- Don't forget PostHog events
- Don't leave out dependencies

---

## 🚨 Common Mistakes

### ❌ Too Vague
```markdown
### useUserTable()
**Purpose**: Manages users
```

### ✅ Properly Detailed
```markdown
### useUserTable()
**Purpose**: Primary hook for managing user table data, fetching, and state management. Handles data fetching with automatic refresh every 30 seconds, error handling with retry logic, and caching for optimal performance.

**Parameters**:
- `initialData?: TUserTable[]` - Optional initial data to hydrate state before first fetch
- `options?: TUserTableOptions` - Configuration options for refresh interval and error callbacks

**Returns**:
- `data: TUserTable[]` - Current user data array
- `isLoading: boolean` - True during initial fetch
- `error: Error | null` - Error object if fetch fails
- `refetch: () => Promise<void>` - Manual refetch function

**Side Effects**:
1. Fetches data from `/api/users` on mount
2. Sets up auto-refresh interval (30s)
3. Logs `user_table_loaded` to PostHog
4. Updates React Query cache

[... continues with examples, logic, dependencies]
```

---

## 📦 Directory Structure

```
features/[feature-name]/
├── [feature-name]-docs.md                    ← Required documentation
├── [feature-name]-components/
│   └── [feature-name]-header.tsx             ← JSDoc comments required
├── [feature-name]-hooks/
│   └── [feature-name]-hooks.ts               ← JSDoc comments required
├── [feature-name]-utils/
│   └── [feature-name]-utils.ts               ← JSDoc comments required
└── index.ts                                  ← JSDoc comments required
```

---

## 🔗 Resources

- **Rule File**: `.cursor/rules/07-documentation-standards.mdc`
- **Example**: `.cursor/examples/user-table-docs.md`
- **Architecture**: `.cursor/ARCHITECTURE.md`
- **Quick Reference**: `.cursor/QUICK_REFERENCE.md`

---

## 🎯 Remember

**Documentation is NOT optional** - it's a core requirement for:
- ✅ Feature completion
- ✅ PR approval
- ✅ AI understanding
- ✅ Team onboarding
- ✅ Code maintenance
- ✅ Safe refactoring

**Every feature MUST have comprehensive documentation!**

---

**Last Updated**: 2025-10-02  
**Maintained By**: Development Team

