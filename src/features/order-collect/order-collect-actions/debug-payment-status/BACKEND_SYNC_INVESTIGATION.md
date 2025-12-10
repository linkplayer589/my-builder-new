# Backend-Stripe Sync Issue Investigation

## Problem Summary

**Critical Issue**: Backend API is returning incorrect payment status that doesn't match Stripe invoices.

### Confirmed Cases:
1. **Order 2929**: Backend reports `isFullyPaid: true` but `remainingAmountCents: 179900` (€1,799 outstanding)
2. **Order 3939**: **NEW API FORMAT** - Backend reports `paid: true` but `remainingBalance: 179900` (€1,799 outstanding)
   - **CRITICAL**: This is a direct API contradiction within the same response!

### API Format Changes:
- **Old Format**: `{ payment: { isFullyPaid, remainingAmountCents } }`
- **New Format**: `{ paid, remainingBalance, stripeDetails }`

## Root Cause Analysis

The issue is in the **backend API endpoint**:
- **Endpoint**: `/api/click-and-collect/fetch-order`
- **Problem**: Payment status calculation is not properly synced with Stripe
- **Impact**: Orders appear fully paid when they're not, blocking proper payment collection

## Investigation Steps

### 1. Check Backend API Implementation

Look for the payment status calculation logic in the fetch-order endpoint:

```typescript
// This logic is likely wrong or missing:
const isFullyPaid = stripeInvoice.amount_remaining <= 0
const remainingAmountCents = stripeInvoice.amount_remaining
```

### 2. Verify Stripe Data Retrieval

The backend should be calling Stripe API to get real-time invoice data:

```typescript
// Should be fetching fresh data from Stripe:
const invoice = await stripe.invoices.retrieve(invoiceId)
const isFullyPaid = invoice.amount_remaining <= 0
```

### 3. Check for Caching Issues

- Is the backend caching payment status?
- Are Stripe webhooks updating the cache properly?
- Is there stale data being returned?

### 4. Webhook Investigation

Check if Stripe webhooks are properly updating payment status:
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `payment_intent.succeeded`

## Debugging Order 3939 Specifically

**NEW DISCOVERY**: The actual backend response shows:
```json
{
  "paid": true,                    // ← Backend says paid
  "remainingBalance": 179900,      // ← But €1,799 still outstanding!
  "stripeDetails": {
    "stripeInvoiceId": "in_1SKObtJeODArl0pi5yLRT1V4",
    "stripeInvoiceStatus": "open"  // ← Stripe invoice is OPEN (unpaid)
  }
}
```

This is a **direct API contradiction** within the same response! **Action Items**:

1. **Find the Stripe invoice ID** for order 3939 (use debug tools)
2. **Check Stripe dashboard** - what does the invoice actually show?
3. **Compare backend database** - what payment status is stored?
4. **Check webhook logs** - were payment updates processed?

## Expected Debug Output

Run the enhanced debug tools on order 3939:

```bash
# Should now show:
⚠️  [Debug] POSSIBLE BACKEND-STRIPE SYNC ISSUE for order 3939:
  - Backend reports: isFullyPaid = true
  - Backend reports: remainingAmount = €0
  - ⚠️  Backend reports fully paid with €0 remaining - verify against actual Stripe invoice!
  - Invoice ID: [INVOICE_ID] (Check this in Stripe Dashboard!)
  - VERIFY: Does Stripe invoice [INVOICE_ID] actually show €0 remaining?
```

## Immediate Actions Needed

1. **Get invoice IDs** for both orders (2929 and 3939)
2. **Check Stripe dashboard** for actual payment status
3. **Compare with backend database** stored values
4. **Identify the sync mechanism** (webhooks, polling, etc.)
5. **Fix the payment status calculation** in backend API

## Backend Code Locations to Check

Look for these files/functions in your backend:
- `/api/click-and-collect/fetch-order` endpoint implementation
- Payment status calculation functions
- Stripe webhook handlers
- Database payment status update logic
- Caching mechanisms for payment data

## Testing After Fix

1. Run debug tools on orders 2929 and 3939
2. Should see consistent payment status
3. No more sync issue warnings
4. Payment status matches Stripe invoices exactly

## Monitoring

The enhanced debug tools now automatically detect and log:
- Backend-Stripe sync issues
- Payment status inconsistencies
- All issues tracked in PostHog with severity levels
