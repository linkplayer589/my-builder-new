"use client"

import * as React from "react"
import { type Control } from "react-hook-form"

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { type FORM_SCHEMA_TYPE } from "./create-new-order-page-1-order-form"

interface Props {
  control: Control<FORM_SCHEMA_TYPE>
}

export const ResortSelect = ({ control }: Props) => (
  <FormField
    control={control}
    name="resortId"
    defaultValue={1}
    render={({ field }) => (
      <FormItem>
        <FormLabel>Select Resort</FormLabel>
        <Select
          onValueChange={(e) => field.onChange(Number(e))}
          value={String(field.value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select resort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">La Thuile</SelectItem>
            <SelectItem value="2">Verbier</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
)
