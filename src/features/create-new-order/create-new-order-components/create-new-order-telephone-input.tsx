"use client"

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PhoneInput } from "@/components/ui/phone-input"

interface Props {
  value: string
  onChange: (value: string) => void
}

export function TelephoneInput({ value, onChange }: Props) {
  return (
    <FormItem className="w-full">
      <FormLabel htmlFor="client-telephone">Telephone</FormLabel>
      <FormControl>
        <PhoneInput
          id="client-telephone"
          placeholder="Enter phone number"
          value={value}
          onChange={(val) => onChange(val || "")}
          defaultCountry="IT"
          className="w-full"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}
