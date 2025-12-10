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

export const LanguageSelect: React.FC<Props> = ({ control }: Props) => (
  <FormField
    control={control}
    name="languageCode"
    render={({ field }) => (
      <FormItem>
        <FormLabel htmlFor="language-select">Select Language</FormLabel>
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger id="language-select" aria-label="Select language">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="it">Italian</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
)
