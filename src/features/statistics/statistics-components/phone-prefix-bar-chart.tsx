"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle as _Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PhonePrefixData {
  prefix: string
  count: number
}

interface PhonePrefixBarChartProps {
  data: PhonePrefixData[]
}

export function PhonePrefixBarChart({ data }: PhonePrefixBarChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    fill: "hsl(var(--primary))",
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders by Phone Prefix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="prefix" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
