"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { type ResortConfig } from "@/types/constants"

interface CreateResortDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (
    id: number,
    name: string,
    config: ResortConfig,
    stripeSecretKey?: string,
    stripeWebhookSecret?: string
  ) => Promise<void>
}

export function CreateResortDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateResortDialogProps) {
  const [id, setId] = React.useState<string>("")
  const [name, setName] = React.useState<string>("")
  const [configJSON, setConfigJSON] = React.useState<string>("{}")
  const [stripeSecretKey, setStripeSecretKey] = React.useState<string>("")
  const [stripeWebhookSecret, setStripeWebhookSecret] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const handleCreate = async () => {
    // Validate Resort ID
    const parsedId = Number(id)
    if (Number.isNaN(parsedId) || parsedId <= 0) {
      toast.error("Resort ID must be a positive number.")
      return
    }

    // Parse config JSON
    let config: ResortConfig
    try {
      const parsed = JSON.parse(configJSON) as ResortConfig
      config = parsed
    } catch (err) {
      toast.error("Invalid configuration JSON.")
      return
    }

    setIsLoading(true)
    try {
      await onCreate(
        parsedId,
        name,
        config,
        stripeSecretKey || undefined,
        stripeWebhookSecret || undefined
      )
      // Reset fields
      setId("")
      setName("")
      setConfigJSON("{}")
      setStripeSecretKey("")
      setStripeWebhookSecret("")
      onOpenChange(false)
      toast.success("Resort created successfully!")
    } catch (error) {
      console.error("Failed to create resort:", error)
      toast.error("Unable to create resort. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Resort</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Resort ID */}
          <div className="grid gap-2">
            <Label htmlFor="resort-id">Resort ID</Label>
            <Input
              id="resort-id"
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter resort ID"
            />
          </div>

          {/* Resort Name */}
          <div className="grid gap-2">
            <Label htmlFor="resort-name">Resort Name</Label>
            <Input
              id="resort-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter resort name"
            />
          </div>

          {/* Configuration JSON */}
          <div className="grid gap-2">
            <Label htmlFor="resort-config">Configuration (JSON)</Label>
            <Textarea
              id="resort-config"
              value={configJSON}
              onChange={(e) => setConfigJSON(e.target.value)}
              placeholder='e.g. { "theme": "beach", "currency": "USD" }'
              rows={6}
            />
          </div>

          {/* Stripe Secret Key */}
          <div className="grid gap-2">
            <Label htmlFor="stripe-secret-key">Stripe Secret Key</Label>
            <Input
              id="stripe-secret-key"
              value={stripeSecretKey}
              onChange={(e) => setStripeSecretKey(e.target.value)}
              placeholder="sk_..."
            />
          </div>

          {/* Stripe Webhook Secret */}
          <div className="grid gap-2">
            <Label htmlFor="stripe-webhook-secret">Stripe Webhook Secret</Label>
            <Input
              id="stripe-webhook-secret"
              value={stripeWebhookSecret}
              onChange={(e) => setStripeWebhookSecret(e.target.value)}
              placeholder="whsec_..."
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!id || !name || !configJSON || isLoading}
            className="w-full sm:ml-2 sm:w-auto"
          >
            {isLoading ? "Creating..." : "Create Resort"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
