"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { orderSearch } from "../order-search-actions/order-search"
import { type OrderSearchFormProps } from "../order-search-types"

const searchFormSchema = z.object({
  searchType: z.enum(["orderNumber", "deviceId"]),
  searchValue: z.string().min(1, "Please enter a search value"),
})

type SearchFormValues = z.infer<typeof searchFormSchema>

export function OrderSearchForm({ onSearch, onError , isSwap = false , showSearch = true}: OrderSearchFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchType: "deviceId",
      searchValue: "",
    },
  })

  async function onSubmit(data: SearchFormValues) {
    try {
      setIsLoading(true)
      const result = await orderSearch(data)

      if (result.success) {
        if (result.data && result.data.length > 0) {
          onSearch(result.data , data.searchValue)
        } else {
          onError("No orders found")
        }
      } else {
        onError(result.message)
      }
    } catch (error) {
      onError("An error occurred while searching")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <FormField
          control={form.control}
          name="searchType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold sm:text-sm">Search by</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2 sm:space-y-1"
                >
                  {!isSwap && (
                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-3 sm:border-0 sm:p-0">
                      <FormControl>
                        <RadioGroupItem value="orderNumber" className="size-5 sm:size-4" />
                      </FormControl>
                      <FormLabel className="text-base font-normal sm:text-sm">Order Number</FormLabel>
                    </FormItem>
                  )}
                  <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-3 sm:border-0 sm:p-0">
                    <FormControl>
                      <RadioGroupItem value="deviceId" className="size-5 sm:size-4" />
                    </FormControl>
                    <FormLabel className="text-base font-normal sm:text-sm">
                      {isSwap ? "Lifepass" : "Device"} ID
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="searchValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold sm:text-sm">
                {!isSwap ? "Search Value" : "Enter Old Lifepass ID"}
              </FormLabel>
              <FormControl>
                <Input
                  readOnly={!showSearch}
                  placeholder="Enter search value..."
                  className="h-12 text-base sm:h-10 sm:text-sm"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {showSearch && (
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full text-base font-semibold sm:h-10 sm:text-sm"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin sm:size-4" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        )}
      </form>
    </Form>
  )
}
