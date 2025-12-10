"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { TLogTerminalProps } from "../resort-config-types/resort-config-types"

/**
 * Log terminal component for displaying SSE stream logs
 *
 * @description
 * Displays streaming log messages in a terminal-like interface with
 * auto-scrolling and clear functionality.
 *
 * @param props - Component props
 * @returns JSX Element
 */
export function ResortConfigLogTerminal({
    logs,
    autoScroll = true,
    maxHeight = "200px",
    onClear,
}: TLogTerminalProps & { onClear?: () => void }) {
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs, autoScroll])

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-500/80" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                        <div className="h-3 w-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs text-zinc-500 font-mono ml-2">
                        stream.log
                    </span>
                </div>
                {onClear && logs.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="h-7 px-2 text-zinc-500 hover:text-zinc-300"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            {/* Terminal content */}
            <ScrollArea
                className="p-4"
                style={{ maxHeight }}
                ref={scrollRef as React.RefObject<HTMLDivElement>}
            >
                <div className="font-mono text-xs space-y-1">
                    {logs.length === 0 ? (
                        <p className="text-zinc-600 italic">
                            No logs yet. Start the stream to see activity...
                        </p>
                    ) : (
                        logs.map((log, index) => (
                            <div
                                key={index}
                                className={`leading-relaxed ${
                                    log.toLowerCase().includes("error")
                                        ? "text-red-400"
                                        : log.toLowerCase().includes("success") ||
                                          log.toLowerCase().includes("completed")
                                        ? "text-emerald-400"
                                        : log.toLowerCase().includes("processing") ||
                                          log.toLowerCase().includes("connecting")
                                        ? "text-amber-400"
                                        : "text-zinc-400"
                                }`}
                            >
                                <span className="text-zinc-600 select-none">
                                    {String(index + 1).padStart(3, "0")} │{" "}
                                </span>
                                {log}
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

