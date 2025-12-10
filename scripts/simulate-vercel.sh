#!/bin/bash

# Script to simulate Vercel production environment locally
# This helps diagnose issues that only appear in production builds

set -e  # Exit on error

echo "🚀 Simulating Vercel Production Environment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clean previous builds
echo -e "${YELLOW}Step 1: Cleaning previous builds...${NC}"
rm -rf .next
rm -rf node_modules/.cache
echo -e "${GREEN}✓ Cleaned${NC}"
echo ""

# Step 2: Install dependencies (same as Vercel)
echo -e "${YELLOW}Step 2: Installing dependencies with pnpm...${NC}"
pnpm install --frozen-lockfile
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Build the application (same as Vercel)
echo -e "${YELLOW}Step 3: Building application (production mode)...${NC}"
NODE_ENV=production pnpm run build
echo -e "${GREEN}✓ Build completed${NC}"
echo ""

# Step 4: Check for build errors
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed! Check errors above.${NC}"
    exit 1
fi

# Step 5: Start production server
echo -e "${YELLOW}Step 4: Starting production server...${NC}"
echo -e "${GREEN}✓ Server starting on http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "   - This is running in PRODUCTION mode (same as Vercel)"
echo "   - Open http://localhost:3000/admin/[resortName]/template-builder/create"
echo "   - Check browser console for errors"
echo "   - Check terminal for server-side errors"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the production server
NODE_ENV=production pnpm run start

