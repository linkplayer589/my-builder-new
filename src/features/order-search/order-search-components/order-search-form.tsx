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
  searchType: z.enum(["orderNumber", "deviceId", "phoneNumber"]),
  searchValue: z.string().min(1, "Please enter a search value"),
})

type SearchFormValues = z.infer<typeof searchFormSchema>

export function OrderSearchForm({ onSearch, onError }: OrderSearchFormProps) {
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
          onSearch(result.data)
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="searchType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search by</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="orderNumber" />
                    </FormControl>
                    <FormLabel className="font-normal">Order Number</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="deviceId" />
                    </FormControl>
                    <FormLabel className="font-normal">Device ID</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="phoneNumber" />
                    </FormControl>
                    <FormLabel className="font-normal">Phone Number</FormLabel>
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
              <FormLabel>Search Value</FormLabel>
              <FormControl>
                <Input placeholder="Enter search value..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </form>
    </Form>
  )
}
