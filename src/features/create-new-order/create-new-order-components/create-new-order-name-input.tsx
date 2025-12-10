"use client"

import { type Control } from "react-hook-form"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { type FORM_SCHEMA_TYPE } from "./create-new-order-page-1-order-form"

interface Props {
  control: Control<FORM_SCHEMA_TYPE>
}

export const NameInput = ({ control }: Props) => (
  <FormField
    control={control}
    name="name"
    render={({ field }) => (
      <FormItem className="w-full">
        <FormLabel htmlFor="client-name">Client Name</FormLabel>
        <FormControl>
          <Input
            id="client-name"
            placeholder="Enter client name"
            {...field}
            value={field.value || ""}
            className="w-full"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)
