"use client"

import * as React from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { Trash2, Plus, StickyNote, AlertTriangle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import {
  ordersTableAddNoteAction,
  ordersTableGetNotesAction,
  ordersTableDeleteNoteAction,
  ordersTableResolveErrorAction,
  type OrderNote,
  type OrderNoteType,
} from "../../../orders-table-actions/orders-table-add-note-action"

interface OrdersTableNotesDialogProps {
  orderId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  initialNotes?: unknown
  defaultNoteType?: OrderNoteType
}

/**
 * Dialog for viewing and adding notes/errors to an order
 *
 * @description
 * Displays existing notes and allows adding new notes or error notes to an order.
 * Notes are stored as JSON in the order's notes field.
 * Error notes automatically set the wasError flag on the order.
 * Error notes can be resolved, which clears the wasError flag when all errors are resolved.
 */
export function OrdersTableNotesDialog({
  orderId,
  open,
  onOpenChange,
  initialNotes,
  defaultNoteType = "note",
}: OrdersTableNotesDialogProps) {
  const [notes, setNotes] = React.useState<OrderNote[]>([])
  const [newNoteText, setNewNoteText] = React.useState("")
  const [noteType, setNoteType] = React.useState<OrderNoteType>(defaultNoteType)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isAdding, setIsAdding] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [filterType, setFilterType] = React.useState<"all" | OrderNoteType>("all")

  // Resolution state
  const [resolvingNoteId, setResolvingNoteId] = React.useState<string | null>(null)
  const [resolutionText, setResolutionText] = React.useState("")
  const [isResolving, setIsResolving] = React.useState(false)

  // Load notes when dialog opens
  React.useEffect(() => {
    if (open) {
      // Reset note type to default when dialog opens
      setNoteType(defaultNoteType)
      setResolvingNoteId(null)
      setResolutionText("")
      // Use initial notes if available
      if (Array.isArray(initialNotes)) {
        setNotes(initialNotes as OrderNote[])
      } else {
        // Fetch fresh notes
        void loadNotes()
      }
    }
  }, [open, initialNotes, defaultNoteType])

  const loadNotes = async () => {
    setIsLoading(true)
    try {
      const result = await ordersTableGetNotesAction(orderId)
      if (result.success && result.notes) {
        setNotes(result.notes)
      }
    } catch (error) {
      console.error("Error loading notes:", error)
      toast.error("Failed to load notes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNoteText.trim()) {
      toast.error("Please enter a note")
      return
    }

    setIsAdding(true)
    try {
      const result = await ordersTableAddNoteAction(orderId, newNoteText.trim(), noteType)
      if (result.success && result.notes) {
        setNotes(result.notes)
        setNewNoteText("")
        toast.success(noteType === "error" ? "Error note added" : "Note added")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error adding note:", error)
      toast.error("Failed to add note")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    setDeletingId(noteId)
    try {
      const result = await ordersTableDeleteNoteAction(orderId, noteId)
      if (result.success && result.notes) {
        setNotes(result.notes)
        toast.success("Note deleted")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      toast.error("Failed to delete note")
    } finally {
      setDeletingId(null)
    }
  }

  const handleResolveError = async (noteId: string) => {
    if (!resolutionText.trim()) {
      toast.error("Please enter a resolution")
      return
    }

    setIsResolving(true)
    try {
      const result = await ordersTableResolveErrorAction(orderId, noteId, resolutionText.trim())
      if (result.success && result.notes) {
        setNotes(result.notes)
        setResolvingNoteId(null)
        setResolutionText("")
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error resolving error:", error)
      toast.error("Failed to resolve error")
    } finally {
      setIsResolving(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  // Filter notes based on selected filter type
  const filteredNotes = React.useMemo(() => {
    if (filterType === "all") return notes
    return notes.filter((note) => (note.type || "note") === filterType)
  }, [notes, filterType])

  // Count notes and errors
  const noteCounts = React.useMemo(() => {
    const noteCount = notes.filter((n) => (n.type || "note") === "note").length
    const errorCount = notes.filter((n) => n.type === "error").length
    const unresolvedErrorCount = notes.filter((n) => n.type === "error" && !n.resolution).length
    return { noteCount, errorCount, unresolvedErrorCount, total: notes.length }
  }, [notes])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Order Notes & Errors (#{orderId})
            {noteCounts.unresolvedErrorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {noteCounts.unresolvedErrorCount} unresolved
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Note Type Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add as:</label>
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

          {/* Add New Note */}
          <div className="space-y-2">
            <Textarea
              placeholder={noteType === "error" ? "Describe the error..." : "Enter a new note..."}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className={cn(
                "min-h-[80px] resize-none",
                noteType === "error" && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <Button
              onClick={handleAddNote}
              disabled={isAdding || !newNoteText.trim()}
              className={cn(
                "w-full gap-2",
                noteType === "error" && "bg-destructive hover:bg-destructive/90"
              )}
            >
              {isAdding ? (
                <ReloadIcon className="size-4 animate-spin" />
              ) : noteType === "error" ? (
                <AlertTriangle className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
              {noteType === "error" ? "Add Error" : "Add Note"}
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Filter:</span>
            <ToggleGroup
              type="single"
              value={filterType}
              onValueChange={(value) => value && setFilterType(value as "all" | OrderNoteType)}
              size="sm"
            >
              <ToggleGroupItem value="all" aria-label="Show all">
                All ({noteCounts.total})
              </ToggleGroupItem>
              <ToggleGroupItem value="note" aria-label="Show notes only">
                Notes ({noteCounts.noteCount})
              </ToggleGroupItem>
              <ToggleGroupItem value="error" aria-label="Show errors only">
                Errors ({noteCounts.errorCount})
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Notes List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <ReloadIcon className="size-6 animate-spin" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {filterType === "all"
                    ? "No notes yet. Add one above."
                    : filterType === "error"
                      ? "No error notes."
                      : "No regular notes."}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {filteredNotes
                    .slice()
                    .reverse()
                    .map((note, index) => {
                      const isError = note.type === "error"
                      const isResolved = isError && note.resolution
                      const isResolvingThis = resolvingNoteId === note.id

                      return (
                        <div
                          key={note.id || `note-${index}`}
                          className={cn(
                            "group rounded-md border p-3",
                            isError && !isResolved && "border-destructive/50 bg-destructive/5",
                            isError && isResolved && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20",
                            !isError && "bg-muted/30"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                {isResolved ? (
                                  <Badge variant="outline" className="border-green-500 bg-green-100 text-green-700 text-xs dark:bg-green-900/50 dark:text-green-400">
                                    <CheckCircle2 className="mr-1 size-3" />
                                    Resolved
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant={isError ? "destructive" : "secondary"}
                                    className="text-xs"
                                  >
                                    {isError ? (
                                      <>
                                        <AlertTriangle className="mr-1 size-3" />
                                        Error
                                      </>
                                    ) : (
                                      <>
                                        <StickyNote className="mr-1 size-3" />
                                        Note
                                      </>
                                    )}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm whitespace-pre-wrap">
                                {note.text}
                              </p>

                              {/* Resolution display */}
                              {isResolved && note.resolution && (
                                <div className="mt-2 rounded border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/30">
                                  <p className="text-xs font-medium text-green-700 dark:text-green-400">Resolution:</p>
                                  <p className="text-sm text-green-800 dark:text-green-300 whitespace-pre-wrap">
                                    {note.resolution.text}
                                  </p>
                                  <div className="mt-1 text-xs text-green-600 dark:text-green-500">
                                    {formatDate(note.resolution.resolvedAt)}
                                    {note.resolution.resolvedBy && ` • ${note.resolution.resolvedBy}`}
                                  </div>
                                </div>
                              )}

                              {/* Resolution input */}
                              {isResolvingThis && (
                                <div className="mt-2 space-y-2">
                                  <Textarea
                                    placeholder="Describe how this was resolved..."
                                    value={resolutionText}
                                    onChange={(e) => setResolutionText(e.target.value)}
                                    className="min-h-[60px] resize-none border-green-300 focus-visible:ring-green-500"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleResolveError(note.id)}
                                      disabled={isResolving || !resolutionText.trim()}
                                      className="gap-1 bg-green-600 hover:bg-green-700"
                                    >
                                      {isResolving ? (
                                        <ReloadIcon className="size-3 animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="size-3" />
                                      )}
                                      Resolve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setResolvingNoteId(null)
                                        setResolutionText("")
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex shrink-0 gap-1">
                              {/* Resolve button for unresolved errors */}
                              {isError && !isResolved && !isResolvingThis && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-green-600 hover:bg-green-100 hover:text-green-700"
                                  onClick={() => {
                                    setResolvingNoteId(note.id)
                                    setResolutionText("")
                                  }}
                                  title="Resolve error"
                                >
                                  <CheckCircle2 className="size-3" />
                                </Button>
                              )}

                              {/* Delete button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() => handleDeleteNote(note.id)}
                                disabled={deletingId === note.id}
                              >
                                {deletingId === note.id ? (
                                  <ReloadIcon className="size-3 animate-spin" />
                                ) : (
                                  <Trash2 className="size-3 text-destructive" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDate(note.createdAt)}</span>
                            {note.createdBy && (
                              <>
                                <span>•</span>
                                <span>{note.createdBy}</span>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
