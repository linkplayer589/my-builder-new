"use client"

import * as React from "react"
import { type JoinedSession } from "@/features/sessions/session-actions/db-get-sessions"
import { SessionLogsPanel } from "@/features/sessions/session-components/session-logs-panel"
import { Clock, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

/**
 * Props for OrdersTableSessionsDialog component
 */
interface TOrdersTableSessionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessions: JoinedSession[]
  isLoading?: boolean
}

/**
 * Dialog component for displaying order session history
 * 
 * @param props - Component props
 * @param props.open - Whether the dialog is open
 * @param props.onOpenChange - Callback when dialog open state changes
 * @param props.sessions - Array of session data to display
 * @param props.isLoading - Whether sessions are being loaded
 * @returns Dialog component with session list
 * 
 * @description
 * Displays a list of sessions associated with an order.
 * Each session can be clicked to view detailed logs in a side panel.
 * Shows loading state while fetching session data.
 * 
 * @example
 * <OrdersTableSessionsDialog 
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   sessions={sessionData}
 *   isLoading={false}
 * />
 */
export function OrdersTableSessionsDialog({
  open,
  onOpenChange,
  sessions,
  isLoading = false,
}: TOrdersTableSessionsDialogProps) {
  const [selectedSession, setSelectedSession] =
    React.useState<JoinedSession | null>(null)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Sessions</DialogTitle>
          </DialogHeader>
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.sessions.id}
                    onClick={() => setSelectedSession(session)}
                    className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted"
                  >
                    <div className="space-y-2">
                      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                        <div className="whitespace-nowrap font-medium">
                          Session #{session.sessions.id}
                        </div>
                        <div className="min-w-0 flex-1" />
                        {session.sessions.sessionLabel ? (
                          <Badge variant="secondary" className="truncate">
                            {session.sessions.sessionLabel}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No label
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="size-4" />
                          {new Date(
                            session.sessions.createdAt
                          ).toLocaleString()}
                        </div>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {session.sessions.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <SessionLogsPanel
        session={selectedSession}
        open={!!selectedSession}
        onOpenChange={(open) => !open && setSelectedSession(null)}
      />
    </>
  )
}

