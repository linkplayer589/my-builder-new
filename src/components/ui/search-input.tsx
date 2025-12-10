"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  disabled?: boolean
  placeholder?: string
  loading: boolean
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  disabled = false,
  placeholder = "Search...",
  loading = false,
}: SearchInputProps) {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-10"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            onSearch()
          }
        }}
      />
      <button
        type="button"
        onClick={onSearch}
        disabled={disabled}
        aria-label="Search"
        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:bg-muted"
        }`}
      >
        {loading ? (
          <Icons.spinner className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <Search className="size-5 text-muted-foreground" />
        )}
      </button>
    </div>
  )
}
