"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function CopyButton({
  data,
  label,
}: {
  data: unknown
  label?: string
}) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }

  if (!data) return null

  return (
    <Button
      variant="outline"
      size="sm"
      className={copied ? "text-green-500" : ""}
      onClick={copyToClipboard}
    >
      <Copy className="mr-2 size-4" />
      {copied ? "Copied!" : label || "Copy"}
    </Button>
  )
}
