# Quick Start: Debugging Vercel Production Issues

## 🚀 Simulate Vercel Production Locally

```bash
# One command to simulate Vercel production environment
pnpm run simulate:vercel
```

This will:
1. Clean previous builds
2. Install dependencies (same as Vercel)
3. Build in production mode
4. Start production server

Then visit: `http://localhost:3000/admin/[resortName]/template-builder/create`

## 🔍 Diagnose Production Build Issues

After building, run diagnostics:

```bash
pnpm run diagnose:production
```

This checks for:
- Browser API usage in server code
- Build errors
- Bundle sizes
- Source maps
- Environment variables
- TypeScript errors

## 🐛 Common Issues & Quick Fixes

### Issue: "window is not defined"

**Fix**: Ensure component is marked `"use client"` and uses client-side mounting:

```typescript
"use client"

const [isMounted, setIsMounted] = useState(false)

useEffect(() => {
  setIsMounted(true)
}, [])

if (!isMounted) return <div>Loading...</div>
```

### Issue: Dynamic import fails

**Fix**: Add error handling:

```typescript
useEffect(() => {
  if (typeof window !== "undefined") {
    import("./module")
      .then((module) => {
        // Use module
      })
      .catch((error) => {
        console.error("Failed to load:", error)
      })
  }
}, [])
```

### Issue: Store initialization errors

**Fix**: Ensure store checks for `window` before accessing browser APIs:

```typescript
const getSafeConfig = () => {
  if (typeof window === "undefined") {
    return getEmptyConfig()
  }
  return getConfigFromWindow()
}
```

## 📋 Testing Checklist

- [ ] Run `pnpm run simulate:vercel`
- [ ] Test email template builder create page
- [ ] Check browser console (F12)
- [ ] Check terminal/server logs
- [ ] Verify no hydration errors
- [ ] Test dynamic imports work
- [ ] Check environment variables are set

## 📚 Full Documentation

See [vercel-production-debugging.md](./vercel-production-debugging.md) for complete guide.

