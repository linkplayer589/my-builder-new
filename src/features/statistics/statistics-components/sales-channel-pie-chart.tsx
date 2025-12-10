"use client"

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from "recharts"
import {
  type NameType,
  type ValueType,
} from "recharts/types/component/DefaultTooltipContent"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"

interface SalesChannelPieChartProps {
  data: {
    channel: string
    total: number
  }[]
}

interface ChartDataItem {
  channel: string
  value: number
  amount: number
  fill: string
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

interface _TooltipData {
  payload: ChartDataItem
  dataKey: string
  name: string
  value: number
}

export function SalesChannelPieChart({ data }: SalesChannelPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.total, 0)

  // Calculate percentages and prepare chart data
  const chartData = data.map((item, index) => ({
    channel: item.channel === "undefined" ? "Other" : item.channel,
    value: (item.total / total) * 100,
    amount: item.total,
    fill: `hsl(var(--chart-${(index % 12) + 1}))`,
  }))

  // Create chart config dynamically
  const chartConfig: ChartConfig = {
    value: {
      label: "Percentage",
    },
    ...data.reduce(
      (acc, item, index) => ({
        ...acc,
        [item.channel]: {
          label: item.channel === "undefined" ? "Other" : item.channel,
          color: `hsl(var(--chart-${(index % 12) + 1}))`,
        },
      }),
      {}
    ),
  }

  const CustomTooltip = ({
    active,
    payload,
  }: TooltipProps<ValueType, NameType>) => {
    if (!active || !payload?.length || !payload[0]?.payload) return null

    const data = payload[0].payload as ChartDataItem
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="font-medium">{data.channel}</div>
          <div>Revenue: {formatCurrency(data.amount)}</div>
          <div>Share: {formatPercentage(data.value)}</div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Distribution by Channel</CardTitle>
        <CardDescription>
          Revenue breakdown across different sales channels
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[500px]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto size-full min-h-[500px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 40, right: 160, bottom: 40, left: 160 }}>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="channel"
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="70%"
                paddingAngle={2}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius: _innerRadius,
                  outerRadius,
                  value,
                  channel,
                }: {
                  cx: number
                  cy: number
                  midAngle: number
                  innerRadius: number
                  outerRadius: number
                  value: number
                  channel: string
                }) => {
                  const RADIAN = Math.PI / 180
                  const radius = outerRadius * 1.4
                  const x = cx + radius * Math.cos(-midAngle * RADIAN)
                  const y = cy + radius * Math.sin(-midAngle * RADIAN)

                  return (
                    <text
                      x={x}
                      y={y}
                      className="fill-muted-foreground"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="middle"
                      fontSize={14}
                    >
                      {channel} ({formatPercentage(value)})
                    </text>
                  )
                }}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.channel} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={CustomTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Total Revenue: {formatCurrency(total)}
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
          {chartData.map((item) => (
            <div key={item.channel} className="flex flex-col">
              <span className="font-medium">{item.channel}</span>
              <span className="text-muted-foreground">
                {formatCurrency(item.amount)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({formatPercentage(item.value)})
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}
