"use server"

import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"

/**
 * Note type - either a regular note or an error note
 */
export type OrderNoteType = "note" | "error"

/**
 * Resolution for an error note
 */
export interface OrderNoteResolution {
  text: string
  resolvedAt: string
  resolvedBy?: string
}

/**
 * Note structure for order notes
 */
export interface OrderNote {
  id: string
  text: string
  type: OrderNoteType
  createdAt: string
  createdBy?: string
  /** Resolution details for error notes */
  resolution?: OrderNoteResolution
}

/**
 * Add a note to an order
 *
 * @param orderId - The ID of the order to add note to
 * @param noteText - The note text to add
 * @param noteType - Type of note ("note" or "error")
 * @param createdBy - Optional user who created the note
 * @returns Success status and updated notes
 */
export async function ordersTableAddNoteAction(
  orderId: number,
  noteText: string,
  noteType: OrderNoteType = "note",
  createdBy?: string
): Promise<{
  success: boolean
  message: string
  notes?: OrderNote[]
}> {
  try {
    // Get current order notes and wasError
    const [order] = await db
      .select({ notes: orders.notes, wasError: orders.wasError })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      }
    }

    // Parse existing notes or create empty array
    const existingNotes: OrderNote[] = Array.isArray(order.notes)
      ? (order.notes as OrderNote[])
      : []

    // Create new note
    const newNote: OrderNote = {
      id: crypto.randomUUID(),
      text: noteText,
      type: noteType,
      createdAt: new Date().toISOString(),
      createdBy,
    }

    // Add new note to array
    const updatedNotes = [...existingNotes, newNote]

    // If adding an error note and wasError is not already true, set it
    const updateData: Record<string, unknown> = {
      notes: updatedNotes,
      updatedAt: new Date(),
    }

    if (noteType === "error" && !order.wasError) {
      updateData.wasError = true
    }

    await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))

    // Revalidate the orders cache
    revalidateTag("orders")

    return {
      success: true,
      message: noteType === "error" ? "Error note added successfully" : "Note added successfully",
      notes: updatedNotes,
    }
  } catch (error) {
    console.error("Error adding note:", error)
    return {
      success: false,
      message: "Failed to add note",
    }
  }
}

/**
 * Get notes for an order
 *
 * @param orderId - The ID of the order
 * @returns Success status and notes
 */
export async function ordersTableGetNotesAction(orderId: number): Promise<{
  success: boolean
  message: string
  notes?: OrderNote[]
}> {
  try {
    const [order] = await db
      .select({ notes: orders.notes })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      }
    }

    const notes: OrderNote[] = Array.isArray(order.notes)
      ? (order.notes as OrderNote[])
      : []

    return {
      success: true,
      message: "Notes retrieved successfully",
      notes,
    }
  } catch (error) {
    console.error("Error getting notes:", error)
    return {
      success: false,
      message: "Failed to get notes",
    }
  }
}

/**
 * Delete a note from an order
 *
 * @param orderId - The ID of the order
 * @param noteId - The ID of the note to delete
 * @returns Success status and updated notes
 */
export async function ordersTableDeleteNoteAction(
  orderId: number,
  noteId: string
): Promise<{
  success: boolean
  message: string
  notes?: OrderNote[]
}> {
  try {
    const [order] = await db
      .select({ notes: orders.notes })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      }
    }

    const existingNotes: OrderNote[] = Array.isArray(order.notes)
      ? (order.notes as OrderNote[])
      : []

    const updatedNotes = existingNotes.filter((note) => note.id !== noteId)

    await db
      .update(orders)
      .set({ notes: updatedNotes, updatedAt: new Date() })
      .where(eq(orders.id, orderId))

    // Revalidate the orders cache
    revalidateTag("orders")

    return {
      success: true,
      message: "Note deleted successfully",
      notes: updatedNotes,
    }
  } catch (error) {
    console.error("Error deleting note:", error)
    return {
      success: false,
      message: "Failed to delete note",
    }
  }
}

/**
 * Resolve an error note on an order
 * This adds a resolution to the error note and clears the wasError flag
 * if all error notes are resolved
 *
 * @param orderId - The ID of the order
 * @param noteId - The ID of the error note to resolve
 * @param resolutionText - The resolution description
 * @param resolvedBy - Optional user who resolved the error
 * @returns Success status and updated notes
 */
export async function ordersTableResolveErrorAction(
  orderId: number,
  noteId: string,
  resolutionText: string,
  resolvedBy?: string
): Promise<{
  success: boolean
  message: string
  notes?: OrderNote[]
}> {
  try {
    if (!resolutionText.trim()) {
      return {
        success: false,
        message: "Resolution text is required",
      }
    }

    const [order] = await db
      .select({ notes: orders.notes, wasError: orders.wasError })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      }
    }

    const existingNotes: OrderNote[] = Array.isArray(order.notes)
      ? (order.notes as OrderNote[])
      : []

    // Find and update the note with resolution
    const updatedNotes = existingNotes.map((note) => {
      if (note.id === noteId && note.type === "error") {
        return {
          ...note,
          resolution: {
            text: resolutionText.trim(),
            resolvedAt: new Date().toISOString(),
            resolvedBy,
          },
        }
      }
      return note
    })

    // Check if all error notes are now resolved
    const hasUnresolvedErrors = updatedNotes.some(
      (note) => note.type === "error" && !note.resolution
    )

    const updateData: Record<string, unknown> = {
      notes: updatedNotes,
      updatedAt: new Date(),
    }

    // If all errors are resolved, clear the wasError flag
    if (!hasUnresolvedErrors && order.wasError) {
      updateData.wasError = false
    }

    await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))

    // Revalidate the orders cache
    revalidateTag("orders")

    return {
      success: true,
      message: hasUnresolvedErrors
        ? "Error resolved"
        : "Error resolved - all errors cleared",
      notes: updatedNotes,
    }
  } catch (error) {
    console.error("Error resolving error note:", error)
    return {
      success: false,
      message: "Failed to resolve error",
    }
  }
}

