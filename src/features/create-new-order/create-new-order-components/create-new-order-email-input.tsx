"use client"

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface Props {
  value: string
  onChange: (value: string) => void
}

export function EmailInput({ value, onChange }: Props) {
  return (
    <FormItem className="w-full">
      <FormLabel htmlFor="client-email">Email</FormLabel>
      <FormControl>
        <Input
          id="client-email"
          type="email"
          placeholder="email@example.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}
