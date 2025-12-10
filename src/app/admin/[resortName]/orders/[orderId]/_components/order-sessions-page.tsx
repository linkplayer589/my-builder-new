"use client"

import * as React from "react"
import { SessionLogsPanel } from "@/features/sessions/session-components/session-logs-panel"
import { Clock, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { JoinedSession } from "@/features/sessions/session-actions/db-get-sessions"

interface OrderSessionsPageProps {
    sessions: JoinedSession[]
    isLoading?: boolean
}

export function OrderSessionsPage({
    sessions,
    isLoading = false,
}: OrderSessionsPageProps) {
    const [selectedSession, setSelectedSession] =
        React.useState<JoinedSession | null>(null)

    return (
        <div className="container mx-auto">

            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    </div>
                )}
                <ScrollArea>
                    <div className="space-y-4 py-2">
                        {sessions.map((session) => (
                            <div
                                key={session.sessions.id}
                                onClick={() => setSelectedSession(session)}
                                className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted"
                            >
                                <div className="space-y-2">
                                    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[auto_1fr_auto]">
                                        <div className="whitespace-nowrap font-medium">
                                            Session #{session.sessions.id}
                                        </div>
                                        <div className="min-w-0 truncate">
                                            {/* Flexible middle space, truncated if too long */}
                                        </div>
                                        {session.sessions.sessionLabel ? (
                                            <Badge
                                                variant="secondary"
                                                className="truncate whitespace-nowrap"
                                                style={{ minWidth: 0 }} // ensure badge respects max-width and allows shrinking
                                            >
                                                {session.sessions.sessionLabel}
                                            </Badge>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">No label</span>
                                        )}
                                    </div>


                                    <div className="flex flex-col items-start justify-between gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-0">
                                        <div className="flex items-center gap-2">
                                            <Clock className="size-4" />
                                            <span>{new Date(session.sessions.createdAt).toLocaleString()}</span>
                                        </div>
                                        <Badge variant="outline" className="mt-1 whitespace-nowrap sm:mt-0">
                                            {session.sessions.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>



                </ScrollArea>
            </div>

            {selectedSession && (
                <SessionLogsPanel
                    session={selectedSession}
                    open={!!selectedSession}
                    onOpenChange={(open) => !open && setSelectedSession(null)}
                />
            )}
        </div>
    )
}
