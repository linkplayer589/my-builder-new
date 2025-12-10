"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { OrderSearchDialog } from "./order-search-dialog"

export function OrderSearchButton() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="w-full bg-secondary py-6 text-lg font-medium hover:bg-secondary/90"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2" />
        <span>Search</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <OrderSearchDialog />
        </DialogContent>
      </Dialog>
    </>
  )
}
