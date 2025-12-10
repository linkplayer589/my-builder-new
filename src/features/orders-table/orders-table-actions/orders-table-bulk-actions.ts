"use server"

import { db } from "@/db"
import { orders } from "@/db/schema"
import { inArray } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import type { OrderNote, OrderNoteType } from "./orders-table-add-note-action"

/**
 * Bulk update orders to mark as test or live
 *
 * @param orderIds - Array of order IDs to update
 * @param isTest - Whether to mark as test (true) or live (false)
 * @returns Success status and message
 */
export async function ordersTableBulkSetTestAction(
  orderIds: number[],
  isTest: boolean
): Promise<{
  success: boolean
  message: string
  updatedCount: number
}> {
  try {
    if (orderIds.length === 0) {
      return {
        success: false,
        message: "No orders selected",
        updatedCount: 0,
      }
    }

    await db
      .update(orders)
      .set({
        testOrder: isTest,
        updatedAt: new Date(),
      })
      .where(inArray(orders.id, orderIds))

    revalidateTag("orders")

    return {
      success: true,
      message: `${orderIds.length} order${orderIds.length > 1 ? "s" : ""} marked as ${isTest ? "test" : "live"}`,
      updatedCount: orderIds.length,
    }
  } catch (error) {
    console.error("Error bulk updating test status:", error)
    return {
      success: false,
      message: "Failed to update orders",
      updatedCount: 0,
    }
  }
}

/**
 * Bulk update orders to set or clear error flag
 *
 * @param orderIds - Array of order IDs to update
 * @param hasError - Whether to set error flag (true) or clear it (false)
 * @returns Success status and message
 */
export async function ordersTableBulkSetErrorAction(
  orderIds: number[],
  hasError: boolean
): Promise<{
  success: boolean
  message: string
  updatedCount: number
}> {
  try {
    if (orderIds.length === 0) {
      return {
        success: false,
        message: "No orders selected",
        updatedCount: 0,
      }
    }

    await db
      .update(orders)
      .set({
        wasError: hasError,
        updatedAt: new Date(),
      })
      .where(inArray(orders.id, orderIds))

    revalidateTag("orders")

    return {
      success: true,
      message: `${orderIds.length} order${orderIds.length > 1 ? "s" : ""} ${hasError ? "marked with error" : "error cleared"}`,
      updatedCount: orderIds.length,
    }
  } catch (error) {
    console.error("Error bulk updating error status:", error)
    return {
      success: false,
      message: "Failed to update orders",
      updatedCount: 0,
    }
  }
}

/**
 * Bulk add a note to multiple orders
 *
 * @param orderIds - Array of order IDs to add note to
 * @param noteText - The note text to add
 * @param noteType - Type of note ("note" or "error")
 * @param createdBy - Optional user who created the note
 * @returns Success status and message
 */
export async function ordersTableBulkAddNoteAction(
  orderIds: number[],
  noteText: string,
  noteType: OrderNoteType = "note",
  createdBy?: string
): Promise<{
  success: boolean
  message: string
  updatedCount: number
}> {
  try {
    if (orderIds.length === 0) {
      return {
        success: false,
        message: "No orders selected",
        updatedCount: 0,
      }
    }

    if (!noteText.trim()) {
      return {
        success: false,
        message: "Note text is required",
        updatedCount: 0,
      }
    }

    // Get all orders
    const orderRecords = await db
      .select({ id: orders.id, notes: orders.notes, wasError: orders.wasError })
      .from(orders)
      .where(inArray(orders.id, orderIds))

    // Update each order with the new note
    let updatedCount = 0
    for (const order of orderRecords) {
      const existingNotes: OrderNote[] = Array.isArray(order.notes)
        ? (order.notes as OrderNote[])
        : []

      const newNote: OrderNote = {
        id: crypto.randomUUID(),
        text: noteText,
        type: noteType,
        createdAt: new Date().toISOString(),
        createdBy,
      }

      const updatedNotes = [...existingNotes, newNote]

      const updateData: Record<string, unknown> = {
        notes: updatedNotes,
        updatedAt: new Date(),
      }

      // If adding an error note, set wasError flag
      if (noteType === "error" && !order.wasError) {
        updateData.wasError = true
      }

      await db
        .update(orders)
        .set(updateData)
        .where(inArray(orders.id, [order.id]))

      updatedCount++
    }

    revalidateTag("orders")

    return {
      success: true,
      message: `${noteType === "error" ? "Error" : "Note"} added to ${updatedCount} order${updatedCount > 1 ? "s" : ""}`,
      updatedCount,
    }
  } catch (error) {
    console.error("Error bulk adding notes:", error)
    return {
      success: false,
      message: "Failed to add notes",
      updatedCount: 0,
    }
  }
}

