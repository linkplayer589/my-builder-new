"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type Control } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { type FORM_SCHEMA_TYPE } from "./create-new-order-page-1-order-form"

interface Props {
  control: Control<FORM_SCHEMA_TYPE>
}

export const StartDatePicker = ({ control }: Props) => (
  <FormField
    control={control}
    name="startDate"
    defaultValue={new Date()}
    render={({ field }) => (
      <FormItem className="flex min-w-[250px] flex-col items-start sm:gap-5">
        <FormLabel htmlFor="start-date-picker">Select Start Date</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="start-date-picker"
              type="button"
              variant={"outline"}
              className={cn(
                "h-16 w-full justify-start text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
              aria-label="Select start date"
            >
              <CalendarIcon className="mr-2" />
              {field.value ? (
                format(field.value, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={field.value ?? undefined}
              onSelect={(date) => {
                if (date) {
                  field.onChange(date)
                }
              }}
              initialFocus
              disabled={(date) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                date.setHours(0, 0, 0, 0)
                return date < today
              }}
            />
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    )}
  />
)
