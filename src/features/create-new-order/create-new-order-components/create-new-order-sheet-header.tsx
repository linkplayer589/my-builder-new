"use client"

import { TerminalSelector } from "@/components/terminal-selector"

export function ModalHeader() {
  return (
    <div className="flex items-center justify-between border-b border-border px-6 py-4">
      <h2 className="text-lg font-semibold">Create New Order</h2>
      <div className="w-64">
        <TerminalSelector />
      </div>
    </div>
  )
}
