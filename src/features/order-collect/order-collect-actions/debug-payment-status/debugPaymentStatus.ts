"use server"

import posthog from "posthog-js"
import { fetchOrderRoute } from "../fetch-order/fetchOrderRoute"

/**
 * JSDoc: Debug helper function to manually validate payment status for specific orders
 * Why: Helps troubleshoot payment status detection issues like order 2929
 * How: Fetches order details and performs detailed validation of payment status logic
 */
export async function debugPaymentStatus(orderId: number) {
  console.log(`🔍 [Debug] Starting payment status validation for order ${orderId}`)

  // Log debug initiation
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('debug_payment_status_initiated', {
      order_id: orderId,
      timestamp: new Date().toISOString(),
      debug_type: 'manual_validation'
    })
  }

  try {
    const result = await fetchOrderRoute(orderId)

    if (!result.success) {
      console.error(`🚨 [Debug] Failed to fetch order ${orderId}:`, result.error)
      return {
        success: false,
        error: result.error,
        errorType: result.errorType
      }
    }

    const { order, payment } = result.data

    // Detailed payment status analysis
    const analysis = {
      orderId: order.id,
      // Basic payment info from backend API
      reportedAsFullyPaid: payment.isFullyPaid,
      remainingAmountCents: payment.remainingAmountCents,
      remainingAmountEuros: payment.remainingAmountCents / 100,

      // Validation logic
      calculatedIsFullyPaid: payment.remainingAmountCents <= 0,
      isConsistent: payment.isFullyPaid === (payment.remainingAmountCents <= 0),

      // Backend-Stripe sync analysis
      backendSyncIssue: {
        // These should match Stripe invoice data
        backendReportsZeroRemaining: payment.remainingAmountCents === 0,
        backendReportsFullyPaid: payment.isFullyPaid,
        // Flag potential backend-Stripe sync issues
        possibleSyncIssue: payment.remainingAmountCents === 0 && payment.isFullyPaid,
        // Flag direct backend API contradictions (paid=true but remainingBalance > 0)
        backendContradiction: payment.isFullyPaid && payment.remainingAmountCents > 0,
        warningMessage: payment.remainingAmountCents === 0 && payment.isFullyPaid
          ? "⚠️  Backend reports fully paid with €0 remaining - verify against actual Stripe invoice!"
          : payment.isFullyPaid && payment.remainingAmountCents > 0
          ? `🚨 BACKEND API CONTRADICTION: Reports paid=true but remainingBalance=€${payment.remainingAmountCents / 100}!`
          : null
      },

      // Additional payment details
      invoiceId: payment.invoiceId,
      invoiceStatus: payment.invoiceStatus,
      paymentIntentId: payment.paymentIntentId,

      // Order status details
      orderStatus: order.status,
      orderPaymentStatus: order.paymentStatus,

      // Client and order info
      clientName: order.clientDetails.name,
      clientEmail: order.clientDetails.email,
      stripeClientId: order.clientDetails.stripeClientId,
      resortId: order.resortId,
      salesChannel: order.salesChannel,

      // Product info
      productsCount: order.orderDetails.products.length,
      startDate: order.orderDetails.startDate,

      timestamp: new Date().toISOString()
    }

    console.log("🔍 [Debug] Payment Status Analysis:", analysis)

    // Log detailed analysis
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('debug_payment_status_analysis', {
        ...analysis,
        severity: analysis.isConsistent ? 'info' : 'critical'
      })
    }

    // Highlight backend contradictions and sync issues
    if (analysis.backendSyncIssue.backendContradiction) {
      console.error(`🚨 [Debug] BACKEND API CONTRADICTION for order ${orderId}:`)
      console.error(`  - Backend reports: paid = ${analysis.reportedAsFullyPaid}`)
      console.error(`  - Backend reports: remainingBalance = €${analysis.remainingAmountEuros}`)
      console.error(`  - 🚨 This is contradictory! Cannot be paid=true with remaining balance > €0`)
      console.error(`  - Invoice ID: ${analysis.invoiceId}`)
      console.error(`  - Invoice Status: ${analysis.invoiceStatus}`)
      console.error(`  - Payment Intent ID: ${analysis.paymentIntentId}`)
      console.error(`  - ACTION NEEDED: Fix backend API logic to return consistent payment status`)
    } else if (analysis.backendSyncIssue.possibleSyncIssue) {
      console.warn(`⚠️  [Debug] POSSIBLE BACKEND-STRIPE SYNC ISSUE for order ${orderId}:`)
      console.warn(`  - Backend reports: isFullyPaid = ${analysis.reportedAsFullyPaid}`)
      console.warn(`  - Backend reports: remainingAmount = €${analysis.remainingAmountEuros}`)
      console.warn(`  - ${analysis.backendSyncIssue.warningMessage}`)
      console.warn(`  - Invoice ID: ${analysis.invoiceId} (Check this in Stripe Dashboard!)`)
      console.warn(`  - Invoice Status: ${analysis.invoiceStatus}`)
      console.warn(`  - Payment Intent ID: ${analysis.paymentIntentId}`)
      console.warn(`  - VERIFY: Does Stripe invoice ${analysis.invoiceId} actually show €0 remaining?`)
    }

    if (!analysis.isConsistent) {
      console.error(`🚨 [Debug] CRITICAL INCONSISTENCY DETECTED for order ${orderId}:`)
      console.error(`  - System reports: isFullyPaid = ${analysis.reportedAsFullyPaid}`)
      console.error(`  - Remaining amount: €${analysis.remainingAmountEuros}`)
      console.error(`  - Should be fully paid: ${analysis.calculatedIsFullyPaid}`)
      console.error(`  - Invoice ID: ${analysis.invoiceId}`)
      console.error(`  - Invoice Status: ${analysis.invoiceStatus}`)
      console.error(`  - Payment Intent ID: ${analysis.paymentIntentId}`)
    } else if (!analysis.backendSyncIssue.possibleSyncIssue) {
      console.log(`✅ [Debug] Payment status is CONSISTENT for order ${orderId}`)
    }

    return {
      success: true,
      analysis,
      hasInconsistency: !analysis.isConsistent,
      hasSyncIssue: analysis.backendSyncIssue.possibleSyncIssue,
      hasBackendContradiction: analysis.backendSyncIssue.backendContradiction
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error during debug"
    console.error(`🚨 [Debug] Unexpected error debugging order ${orderId}:`, error)

    // Log debug errors
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('debug_payment_status_error', {
        order_id: orderId,
        error_message: errorMsg,
        timestamp: new Date().toISOString(),
        severity: 'medium'
      })
    }

    return {
      success: false,
      error: errorMsg,
      errorType: "debug_error" as const
    }
  }
}

/**
 * JSDoc: Debug multiple orders for payment status issues
 * Why: Allows batch checking of multiple orders for systematic issues
 * How: Runs debugPaymentStatus for each order and aggregates results
 */
export async function debugMultipleOrdersPaymentStatus(orderIds: number[]) {
  console.log(`🔍 [Debug] Batch payment status validation for ${orderIds.length} orders`)

  const results = []
  const inconsistencies = []

  for (const orderId of orderIds) {
    const result = await debugPaymentStatus(orderId)
    results.push({ orderId, result })

    if (result.success && result.hasInconsistency) {
      inconsistencies.push({
        orderId,
        analysis: result.analysis
      })
    }
  }

  const summary = {
    totalOrders: orderIds.length,
    successfulChecks: results.filter(r => r.result.success).length,
    inconsistenciesFound: inconsistencies.length,
    inconsistencies,
    timestamp: new Date().toISOString()
  }

  console.log("🔍 [Debug] Batch Analysis Summary:", summary)

  // Log batch summary
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('debug_payment_status_batch_summary', {
      ...summary,
      severity: inconsistencies.length > 0 ? 'critical' : 'info'
    })
  }

  return summary
}
