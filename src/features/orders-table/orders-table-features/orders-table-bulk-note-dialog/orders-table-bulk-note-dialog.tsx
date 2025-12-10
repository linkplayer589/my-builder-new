"use client"

import * as React from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { StickyNote, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

import type { OrderNoteType } from "../../orders-table-actions/orders-table-add-note-action"

interface OrdersTableBulkNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  defaultNoteType?: OrderNoteType
  onSubmit: (noteText: string, noteType: OrderNoteType) => Promise<void>
}

/**
 * Dialog for adding notes/errors to multiple orders at once
 *
 * @description
 * Allows bulk adding a note or error to all selected orders.
 * Error notes automatically set the wasError flag on affected orders.
 */
export function OrdersTableBulkNoteDialog({
  open,
  onOpenChange,
  selectedCount,
  defaultNoteType = "note",
  onSubmit,
}: OrdersTableBulkNoteDialogProps) {
  const [noteText, setNoteText] = React.useState("")
  const [noteType, setNoteType] = React.useState<OrderNoteType>(defaultNoteType)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setNoteText("")
      setNoteType(defaultNoteType)
    }
  }, [open, defaultNoteType])

  const handleSubmit = async () => {
    if (!noteText.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(noteText.trim(), noteType)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            Add {noteType === "error" ? "Error" : "Note"} to {selectedCount} Order{selectedCount > 1 ? "s" : ""}
          </DialogTitle>
          <DialogDescription>
            This will add the same {noteType === "error" ? "error note" : "note"} to all selected orders.
            {noteType === "error" && " Error notes will set the error flag on affected orders."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Note Type Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type:</label>
            <ToggleGroup
              type="single"
              value={noteType}
              onValueChange={(value) => value && setNoteType(value as OrderNoteType)}
              className="justify-start"
            >
              <ToggleGroupItem
                value="note"
                aria-label="Add as note"
                className={cn(
                  "gap-2",
                  noteType === "note" && "bg-primary text-primary-foreground"
                )}
              >
                <StickyNote className="size-4" />
                Note
              </ToggleGroupItem>
              <ToggleGroupItem
                value="error"
                aria-label="Add as error"
                className={cn(
                  "gap-2",
                  noteType === "error" && "bg-destructive text-destructive-foreground"
                )}
              >
                <AlertTriangle className="size-4" />
                Error
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Note Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {noteType === "error" ? "Error Description" : "Note"}:
            </label>
            <Textarea
              placeholder={noteType === "error" ? "Describe the error..." : "Enter a note..."}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className={cn(
                "min-h-[100px] resize-none",
                noteType === "error" && "border-destructive focus-visible:ring-destructive"
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !noteText.trim()}
            className={cn(
              noteType === "error" && "bg-destructive hover:bg-destructive/90"
            )}
          >
            {isSubmitting ? (
              <>
                <ReloadIcon className="mr-2 size-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                {noteType === "error" ? (
                  <AlertTriangle className="mr-2 size-4" />
                ) : (
                  <StickyNote className="mr-2 size-4" />
                )}
                Add to {selectedCount} Order{selectedCount > 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

