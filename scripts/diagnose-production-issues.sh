#!/bin/bash

# Diagnostic script to identify production build issues
# Run this after building to check for common problems

set -e

echo "🔍 Production Build Diagnostic Tool"
echo "===================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .next directory exists
if [ ! -d ".next" ]; then
    echo -e "${RED}✗ .next directory not found. Run 'pnpm run build' first.${NC}"
    exit 1
fi

echo -e "${YELLOW}Checking for common production issues...${NC}"
echo ""

# Check 1: Look for window/document usage in server components
echo -e "${YELLOW}1. Checking for browser API usage in server code...${NC}"
if grep -r "window\." .next/server --include="*.js" 2>/dev/null | grep -v "node_modules" | head -5; then
    echo -e "${RED}   ⚠️  Found window.* usage in server code (may cause SSR errors)${NC}"
else
    echo -e "${GREEN}   ✓ No obvious window.* usage in server code${NC}"
fi
echo ""

# Check 2: Look for dynamic import errors
echo -e "${YELLOW}2. Checking build output for errors...${NC}"
if [ -f ".next/BUILD_ID" ]; then
    echo -e "${GREEN}   ✓ Build ID found (build completed)${NC}"
else
    echo -e "${RED}   ✗ Build ID not found (build may have failed)${NC}"
fi
echo ""

# Check 3: Check for large chunks
echo -e "${YELLOW}3. Checking bundle sizes...${NC}"
if [ -d ".next/static/chunks" ]; then
    LARGEST=$(find .next/static/chunks -name "*.js" -type f -exec ls -lh {} \; | sort -k5 -hr | head -1)
    if [ -n "$LARGEST" ]; then
        echo -e "${YELLOW}   Largest chunk:${NC}"
        echo "   $LARGEST"
    fi
fi
echo ""

# Check 4: Look for source maps
echo -e "${YELLOW}4. Checking for source maps...${NC}"
if find .next -name "*.map" -type f | head -1 | grep -q .; then
    echo -e "${GREEN}   ✓ Source maps found${NC}"
else
    echo -e "${YELLOW}   ⚠️  No source maps found (harder to debug)${NC}"
    echo -e "${YELLOW}   Consider enabling productionBrowserSourceMaps in next.config.js${NC}"
fi
echo ""

# Check 5: Environment variables
echo -e "${YELLOW}5. Checking environment variables...${NC}"
if [ -f ".env.local" ] || [ -f ".env" ]; then
    echo -e "${GREEN}   ✓ .env files found${NC}"
    echo -e "${YELLOW}   ⚠️  Remember: Set these in Vercel dashboard too!${NC}"
else
    echo -e "${YELLOW}   ⚠️  No .env files found (using system/env vars)${NC}"
fi
echo ""

# Check 6: Check for client components
echo -e "${YELLOW}6. Checking for 'use client' directives...${NC}"
CLIENT_COUNT=$(grep -r '"use client"' src/features/email-template-builder --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
echo -e "${GREEN}   ✓ Found $CLIENT_COUNT client components${NC}"
echo ""

# Check 7: TypeScript errors
echo -e "${YELLOW}7. Running TypeScript check...${NC}"
if pnpm run lint > /tmp/ts-check.log 2>&1; then
    echo -e "${GREEN}   ✓ No TypeScript errors${NC}"
else
    echo -e "${RED}   ✗ TypeScript errors found:${NC}"
    tail -20 /tmp/ts-check.log
fi
echo ""

echo -e "${GREEN}Diagnostic complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Run: pnpm run simulate:vercel"
echo "  2. Visit: http://localhost:3000/admin/[resortName]/template-builder/create"
echo "  3. Check browser console for errors"
echo "  4. Check terminal for server errors"
echo ""

