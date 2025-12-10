"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-[120px]" />
          <Skeleton className="mt-2 h-4 w-[100px]" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-[80px]" />
          <Skeleton className="mt-2 h-4 w-[100px]" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Lifepasses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-[80px]" />
          <Skeleton className="mt-2 h-4 w-[100px]" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Rental Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-[80px]" />
          <Skeleton className="mt-2 h-4 w-[100px]" />
        </CardContent>
      </Card>
    </div>
  )
}
