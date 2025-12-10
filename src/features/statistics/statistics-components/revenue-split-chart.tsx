"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface RevenueSplitChartProps {
  data: {
    insurance: number
    lifepass: number
    skiTicket: number
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function RevenueSplitChart({ data }: RevenueSplitChartProps) {
  // Transform data for the chart
  const chartData = React.useMemo(() => {
    return [
      {
        label: "Insurance",
        value: data.insurance,
        fill: "var(--color-insurance)",
      },
      {
        label: "Lifepass Rental",
        value: data.lifepass,
        fill: "var(--color-lifepass)",
      },
      {
        label: "Ski Tickets",
        value: data.skiTicket,
        fill: "var(--color-skiTicket)",
      },
    ]
  }, [data])

  const totalRevenue = React.useMemo(() => {
    return data.insurance + data.lifepass + data.skiTicket
  }, [data])

  const chartConfig: ChartConfig = {
    total: {
      label: "Total Revenue",
    },
    insurance: {
      label: "Insurance",
      color: "hsl(var(--chart-1))",
    },
    lifepass: {
      label: "Lifepass Rental",
      color: "hsl(var(--chart-2))",
    },
    skiTicket: {
      label: "Ski Tickets",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-2">
        <CardTitle>Revenue Split</CardTitle>
        <CardDescription>
          Distribution of revenue by product type
        </CardDescription>
        <div className="mt-2 text-center">
          <div className="text-sm text-muted-foreground">Total Revenue</div>
          <div className="text-xl font-semibold">
            {formatCurrency(totalRevenue)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    const numValue =
                      typeof value === "string"
                        ? parseFloat(value)
                        : Number(value)
                    return formatCurrency(numValue)
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (
                    viewBox &&
                    "cx" in viewBox &&
                    "cy" in viewBox &&
                    viewBox.cy !== undefined
                  ) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy - 4}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {formatCurrency(data.lifepass)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy + 20}
                          className="fill-muted-foreground text-sm"
                        >
                          LifePass Revenue
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="grid grid-cols-3 gap-4 text-center">
          {chartData.map((category) => (
            <div key={category.label}>
              <div className="font-medium">{category.label}</div>
              <div className="text-muted-foreground">
                {formatCurrency(category.value)}
              </div>
              <div className="text-xs text-muted-foreground">
                {((category.value / totalRevenue) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}
