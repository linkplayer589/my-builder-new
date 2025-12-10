"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import { CreateNewOrderSheet } from "./create-new-order-sheet"

export function CreateNewOrderButton() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Create New Order</Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto p-0 sm:max-w-2xl">
        <CreateNewOrderSheet />
      </SheetContent>
    </Sheet>
  )
}
