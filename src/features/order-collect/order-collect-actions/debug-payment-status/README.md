# Payment Status Debug Tools

## Overview

These tools help debug payment status detection issues like the one detected with order 2929, where the system incorrectly reports an order as fully paid when there's still an outstanding balance.

## The Issue

Based on the Stripe invoice for order 2929:
- **Total**: €1,904.00
- **Amount Paid**: €105.00
- **Amount Remaining**: €1,799.00
- **Problem**: System reports as "fully paid" when clearly not fully paid

## Tools Available

### 1. Enhanced Logging (`fetchOrderRoute.ts`)

Automatically detects payment status inconsistencies:
- Compares `isFullyPaid` flag with `remainingAmountCents > 0`
- Logs critical inconsistencies to console and PostHog
- Provides detailed payment status information

### 2. Debug Function (`debugPaymentStatus.ts`)

Manual debugging tool for specific orders:

```typescript
import { debugPaymentStatus } from './debugPaymentStatus'

// Debug a specific order
const result = await debugPaymentStatus(2929)
```

### 3. Debug Button in UI (`order-collect-dialog.tsx`)

Admin debug button in the Click & Collect dialog:
- Yellow "Debug" button next to Refresh
- Shows detailed analysis results
- Highlights inconsistencies in red

## Usage Instructions

### For Order 2929 Specifically

1. **Open the Click & Collect dialog** for order 2929
2. **Click the "Debug" button** (yellow button with warning icon)
3. **Check the console** for detailed analysis
4. **Look for the red debug panel** if inconsistencies are detected

### Expected Debug Output

For order 2929, you should see:

```
🔍 [Debug] Payment Status Analysis: {
  orderId: 2929,
  reportedAsFullyPaid: true,          // ← This is wrong
  remainingAmountCents: 179900,       // ← €1,799.00 remaining
  remainingAmountEuros: 1799,
  calculatedIsFullyPaid: false,       // ← This is correct
  isConsistent: false,                // ← INCONSISTENCY DETECTED
  invoiceId: "1D855C23-0447",
  paymentIntentId: "pi_3SKObBJeODArl0pi131jpW1T"
}
```

### What the Debug Results Mean

- **`reportedAsFullyPaid: true`** - Backend API says order is fully paid
- **`remainingAmountCents: 179900`** - €1,799.00 still outstanding
- **`calculatedIsFullyPaid: false`** - Should be false based on remaining amount
- **`isConsistent: false`** - Indicates the bug is confirmed

## Root Cause Analysis

The issue is in the **backend API** that `fetchOrderRoute` calls:
- **Endpoint**: `${HONO_API_URL}/api/click-and-collect/fetch-order`
- **Problem**: The API is returning `isFullyPaid: true` when `remainingAmountCents: 179900`

## Next Steps

1. **Check the backend API implementation** for the fetch-order endpoint
2. **Look for payment calculation logic** that determines `isFullyPaid`
3. **Verify Stripe webhook handling** for payment updates
4. **Check if there's a race condition** between payment processing and status updates

## Backend API Investigation

The backend should implement logic like:

```typescript
const isFullyPaid = remainingAmountCents <= 0
```

But it's currently returning `isFullyPaid: true` even when `remainingAmountCents: 179900`.

## Monitoring

All inconsistencies are now logged to PostHog with:
- Event: `critical_payment_status_inconsistency`
- Severity: `critical`
- Order ID and payment details

## Files Modified

- `fetchOrderRoute.ts` - Enhanced logging and validation
- `debugPaymentStatus.ts` - Debug helper functions
- `order-collect-dialog.tsx` - UI debug button and display
- `README.md` - This documentation

