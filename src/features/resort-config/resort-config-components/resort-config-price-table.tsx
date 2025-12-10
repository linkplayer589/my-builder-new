"use client"

import { useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Sun, Snowflake, Package } from "lucide-react"
import type {
    TPriceTableProps,
    TSkidataProduct,
    TSkidataConsumer,
    TLocalizedText,
} from "../resort-config-types/resort-config-types"

/**
 * Gets the best available name from a localized text object
 */
function getLocalizedName(name: TLocalizedText | undefined, fallback: string): string {
    if (!name) return fallback
    return name.en ?? name.de ?? name.it ?? name.fr ?? fallback
}

/**
 * Gets the product name from metadata (fallback)
 */
function getProductNameFromMetadata(product: TSkidataProduct): string {
    return product.name.en ?? product.name.de ?? product.id
}

/**
 * Gets the consumer category name from metadata (fallback)
 */
function getConsumerNameFromMetadata(consumer: TSkidataConsumer): string {
    return consumer.name.en ?? consumer.name.de ?? consumer.id
}

/**
 * Formats a price value for display
 */
function formatPrice(value: number | string | undefined): string {
    if (value === undefined || value === null) return "—"
    if (typeof value === "string") return value // Error code
    return `€${value.toFixed(2)}`
}

/**
 * Gets the color class based on price value
 */
function getPriceColorClass(value: number | string | undefined): string {
    if (value === undefined || value === null) return "text-muted-foreground/30"
    if (typeof value === "string") return "text-red-500 animate-pulse" // Error code
    if (value === 0) return "text-muted-foreground"
    return "text-foreground font-medium"
}

/**
 * Gets background class for cell animation
 */
function getCellBgClass(value: number | string | undefined): string {
    if (value === undefined || value === null) return "bg-muted/20"
    if (typeof value === "string") return "bg-red-500/10" // Error
    return "bg-emerald-500/10 animate-in fade-in duration-300" // Success - flash green briefly
}

/**
 * Scenario icons and labels
 */
const SCENARIO_CONFIG = {
    HIGH: { icon: Sun, label: "High Season", color: "text-amber-500" },
    LOW: { icon: Snowflake, label: "Low Season", color: "text-sky-500" },
    "HIGH-DEPOT": { icon: Package, label: "High Season (Depot)", color: "text-amber-500" },
    "LOW-DEPOT": { icon: Package, label: "Low Season (Depot)", color: "text-sky-500" },
} as const

/**
 * Price table component for displaying Skidata prices
 *
 * @description
 * Displays price data in a table format with Products as columns
 * and Consumer Categories as rows. Supports multiple scenarios
 * via tabs (HIGH/LOW season, with/without depot).
 *
 * @param props - Component props
 * @returns JSX Element
 */
export function ResortConfigPriceTable({
    priceData,
    products,
    consumers,
    productNames,
    consumerNames,
    activeScenario,
    onScenarioChange,
}: TPriceTableProps) {
    /**
     * Gets the best product name - prefer stream name, fallback to metadata
     */
    const getProductName = useCallback((product: TSkidataProduct): string => {
        const streamName = productNames.get(product.id)
        if (streamName) {
            return getLocalizedName(streamName, product.id)
        }
        return getProductNameFromMetadata(product)
    }, [productNames])

    /**
     * Gets the best consumer name - prefer stream name, fallback to metadata
     */
    const getConsumerName = useCallback((consumer: TSkidataConsumer): string => {
        const streamName = consumerNames.get(consumer.id)
        if (streamName) {
            return getLocalizedName(streamName, consumer.id)
        }
        return getConsumerNameFromMetadata(consumer)
    }, [consumerNames])
    /**
     * Gets the price map for the current scenario
     */
    const currentPriceMap = useMemo(() => {
        switch (activeScenario) {
            case "HIGH":
                return priceData.highSeason
            case "LOW":
                return priceData.lowSeason
            case "HIGH-DEPOT":
                return priceData.highDepot
            case "LOW-DEPOT":
                return priceData.lowDepot
            default:
                return priceData.highSeason
        }
    }, [activeScenario, priceData])

    /**
     * Counts total cells filled in current scenario
     */
    const cellsFilled = useMemo(() => {
        let count = 0
        currentPriceMap.forEach(categoryMap => {
            count += categoryMap.size
        })
        return count
    }, [currentPriceMap])

    /**
     * Total possible cells
     */
    const totalCells = products.length * consumers.length

    /**
     * Checks if metadata is available (products and consumers loaded)
     */
    const hasMetadata = products.length > 0 && consumers.length > 0

    /**
     * Gets counts for each scenario
     */
    const scenarioCounts = useMemo(() => ({
        HIGH: priceData.highSeason.size,
        LOW: priceData.lowSeason.size,
        "HIGH-DEPOT": priceData.highDepot.size,
        "LOW-DEPOT": priceData.lowDepot.size,
    }), [priceData])

    // Show empty state only if no metadata is available
    if (!hasMetadata) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sun className="h-5 w-5 text-amber-500" />
                        Skidata Prices
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <Package className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">No price data available</p>
                        <p className="text-sm mt-1">
                            Click "Fetch Latest Skidata Prices" to load price data
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Sun className="h-5 w-5 text-amber-500" />
                        Skidata Prices
                    </CardTitle>
                    {totalCells > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                            <Badge variant={cellsFilled === totalCells ? "default" : "secondary"} className="font-mono">
                                {cellsFilled} / {totalCells}
                            </Badge>
                            {cellsFilled > 0 && cellsFilled < totalCells && (
                                <span className="text-muted-foreground animate-pulse">
                                    Loading...
                                </span>
                            )}
                            {cellsFilled === totalCells && (
                                <span className="text-emerald-500">
                                    ✓ Complete
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Tabs
                    value={activeScenario}
                    onValueChange={(val) => onScenarioChange(val as typeof activeScenario)}
                >
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                        {(Object.keys(SCENARIO_CONFIG) as Array<keyof typeof SCENARIO_CONFIG>).map((scenario) => {
                            const config = SCENARIO_CONFIG[scenario]
                            const Icon = config.icon
                            const count = scenarioCounts[scenario]

                            return (
                                <TabsTrigger
                                    key={scenario}
                                    value={scenario}
                                    className="flex items-center gap-2"
                                    disabled={count === 0}
                                >
                                    <Icon className={`h-4 w-4 ${config.color}`} />
                                    <span className="hidden sm:inline">{config.label}</span>
                                    {count > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                            {count}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>

                    {(Object.keys(SCENARIO_CONFIG) as Array<keyof typeof SCENARIO_CONFIG>).map((scenario) => (
                        <TabsContent key={scenario} value={scenario}>
                            <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="font-bold sticky left-0 bg-muted/50 z-10 min-w-[180px]">
                                                Consumer Category
                                            </TableHead>
                                            {products.map((product) => (
                                                <TableHead
                                                    key={product.id}
                                                    className="text-center min-w-[120px]"
                                                >
                                                    <div className="font-medium truncate max-w-[120px]" title={getProductName(product)}>
                                                        {getProductName(product)}
                                                    </div>
                                                    <div className="text-xs font-normal text-muted-foreground font-mono">
                                                        {product.id}
                                                    </div>
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {consumers.map((consumer) => {
                                            const categoryPrices = currentPriceMap.get(consumer.id)

                                            return (
                                                <TableRow key={consumer.id}>
                                                    <TableCell className="font-medium sticky left-0 bg-background z-10">
                                                        <div className="truncate max-w-[180px]" title={getConsumerName(consumer)}>
                                                            {getConsumerName(consumer)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground font-mono">
                                                            {consumer.id}
                                                        </div>
                                                    </TableCell>
                                                    {products.map((product) => {
                                                        const price = categoryPrices?.get(product.id)

                                                        return (
                                                            <TableCell
                                                                key={product.id}
                                                                className={`text-center transition-all duration-200 ${getPriceColorClass(price)} ${getCellBgClass(price)}`}
                                                            >
                                                                {formatPrice(price)}
                                                            </TableCell>
                                                        )
                                                    })}
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    )
}

