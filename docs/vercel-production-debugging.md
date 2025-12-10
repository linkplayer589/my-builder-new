# Vercel Production Environment Simulation Guide

## Quick Start

To simulate Vercel's production environment locally:

```bash
pnpm run simulate:vercel
```

Or manually:

```bash
# 1. Clean previous builds
rm -rf .next

# 2. Install dependencies (same as Vercel)
pnpm install --frozen-lockfile

# 3. Build in production mode
NODE_ENV=production pnpm run build

# 4. Start production server
NODE_ENV=production pnpm run start
```

Then visit: `http://localhost:3000/admin/[resortName]/template-builder/create`

## Differences Between Dev and Production

### Development Mode (`pnpm run dev`)
- ✅ Hot module replacement (HMR)
- ✅ Source maps enabled
- ✅ Detailed error messages
- ✅ No code minification
- ✅ Development-only code included
- ✅ Loose type checking

### Production Mode (`pnpm run build` + `pnpm run start`)
- ❌ No HMR
- ❌ Minified code (harder to debug)
- ❌ Tree-shaking enabled (unused code removed)
- ❌ Code splitting optimized
- ❌ Server-side rendering (SSR) enabled
- ❌ Static generation (SSG) enabled
- ❌ Stricter error handling

## Common Production Issues

### 1. Server-Side Rendering (SSR) Issues

**Problem**: Code that uses browser APIs (`window`, `document`, `localStorage`) during SSR.

**Symptoms**:
- `ReferenceError: window is not defined`
- `ReferenceError: document is not defined`
- Component fails to render on server

**Solution**: Use client-side only rendering:

```typescript
"use client"

import { useEffect, useState } from "react"

export function MyComponent() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div>Loading...</div>
  }

  // Safe to use window/document here
  return <div>{window.location.hash}</div>
}
```

### 2. Dynamic Import Failures

**Problem**: Dynamic imports fail in production builds due to:
- Code splitting issues
- Module resolution problems
- Missing dependencies

**Symptoms**:
- `Failed to load module`
- `Cannot find module`
- Component doesn't load

**Solution**: Ensure dynamic imports are client-side only:

```typescript
useEffect(() => {
  if (typeof window !== "undefined") {
    import("./module")
      .then((module) => {
        // Use module
      })
      .catch((error) => {
        console.error("Failed to load module:", error)
      })
  }
}, [])
```

### 3. Zustand Store Initialization

**Problem**: Zustand stores initialized at module load time run during SSR.

**Symptoms**:
- `window is not defined` errors
- Store initialized with wrong values
- Hydration mismatches

**Solution**: Lazy initialization or client-side only:

```typescript
// ❌ BAD: Runs during SSR
const store = create((set) => {
  const config = window.location.hash // ❌ window not available
  return { config }
})

// ✅ GOOD: Lazy initialization
const store = create((set) => {
  let initialConfig = {}

  // Only access window on client
  if (typeof window !== "undefined") {
    initialConfig = getConfigFromHash(window.location.hash)
  }

  return { config: initialConfig }
})
```

### 4. Environment Variables

**Problem**: Environment variables not available in production.

**Symptoms**:
- `undefined` values
- API calls fail
- Features don't work

**Solution**: Ensure all env vars are prefixed with `NEXT_PUBLIC_` for client-side:

```bash
# ✅ Available on client
NEXT_PUBLIC_API_URL=https://api.example.com

# ❌ NOT available on client (server-only)
DATABASE_URL=postgres://...
```

### 5. Build-Time Errors

**Problem**: TypeScript or build errors that only appear in production.

**Symptoms**:
- Build fails
- Type errors
- Missing dependencies

**Solution**: Check build output:

```bash
NODE_ENV=production pnpm run build 2>&1 | tee build.log
```

## Debugging Production Builds

### 1. Enable Source Maps

Add to `next.config.js`:

```javascript
const nextConfig = {
  productionBrowserSourceMaps: true, // Enable source maps
}
```

### 2. Check Build Output

```bash
# Build and save output
NODE_ENV=production pnpm run build > build.log 2>&1

# Check for errors
grep -i "error" build.log
grep -i "warning" build.log
```

### 3. Inspect Bundle Size

```bash
# Analyze bundle
ANALYZE=true pnpm run build
```

### 4. Check Server Logs

When running production server, check terminal for:
- Server-side errors
- API call failures
- Database connection issues

### 5. Browser Console

Check browser console for:
- Client-side errors
- Failed network requests
- JavaScript errors
- React hydration warnings

## Email Template Builder Specific Issues

### Issue 1: Store Initialization

**Location**: `use-email-template-builder-store.ts`

**Problem**: Store initialized at module load, accessing `window.location.hash` during SSR.

**Fix**: Ensure `getSafeConfiguration()` properly handles SSR:

```typescript
const getSafeConfiguration = () => {
  if (typeof window === "undefined") {
    return getConfiguration("") // Empty config for SSR
  }
  return getConfiguration(window.location.hash)
}
```

### Issue 2: Dynamic Import

**Location**: `email-template-builder-html-panel.tsx`

**Problem**: Dynamic import might fail in production builds.

**Fix**: Add better error handling and fallback:

```typescript
useEffect(() => {
  if (typeof window !== "undefined") {
    import("../email-template-builder-reader")
      .then((module) => {
        if (module.renderToStaticMarkup) {
          setRenderToStaticMarkup(() => module.renderToStaticMarkup)
        } else {
          console.error("renderToStaticMarkup not exported")
        }
      })
      .catch((error) => {
        console.error("Failed to load module:", error)
        // Add fallback or error state
      })
  }
}, [])
```

### Issue 3: React Server Components

**Problem**: Using client-only code in server components.

**Solution**: Ensure all email template builder components are marked `"use client"`.

## Testing Checklist

Before deploying to Vercel:

- [ ] Run `pnpm run simulate:vercel` locally
- [ ] Test email template builder create page
- [ ] Test email template builder edit page
- [ ] Check browser console for errors
- [ ] Check terminal/server logs for errors
- [ ] Verify all environment variables are set
- [ ] Test with production build (`NODE_ENV=production`)
- [ ] Verify dynamic imports work
- [ ] Check for hydration mismatches
- [ ] Test SSR rendering

## Vercel-Specific Considerations

### Build Settings

Vercel uses:
- Node.js version from `package.json` or `.nvmrc`
- Build command: `pnpm run build` (from `vercel.json` or auto-detected)
- Install command: `pnpm install` (from `vercel.json` or auto-detected)

### Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_*` variables for client-side
- Server-only variables for API routes

### Function Timeouts

- Hobby: 10 seconds
- Pro: 60 seconds
- Enterprise: 900 seconds

### Edge Functions

If using Edge Runtime, ensure all dependencies are compatible.

## Getting Help

If issues persist:

1. **Check Vercel Build Logs**: Dashboard → Project → Deployments → Build Logs
2. **Check Runtime Logs**: Dashboard → Project → Deployments → Runtime Logs
3. **Compare Local vs Vercel**: Run `pnpm run simulate:vercel` and compare
4. **Check Environment Variables**: Ensure all are set in Vercel
5. **Check Node.js Version**: Match Vercel's Node.js version

## Additional Resources

- [Next.js Production Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Debugging Guide](https://nextjs.org/docs/advanced-features/debugging)

