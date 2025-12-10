"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Monitor,
    Smartphone,
    ShoppingCart,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type {
    TSalesChannelCardProps,
    TSalesChannelConfigUpdate,
    TSkidataProduct,
    TSkidataConsumer,
} from "../resort-config-types/resort-config-types"

/**
 * Gets the appropriate icon for a sales channel type
 */
function getChannelIcon(type: string) {
    switch (type) {
        case "kiosk":
            return <Monitor className="h-4 w-4" />
        case "cash-desk":
            return <Smartphone className="h-4 w-4" />
        case "web":
            return <ShoppingCart className="h-4 w-4" />
        default:
            return <Monitor className="h-4 w-4" />
    }
}

/**
 * Gets a display label for a sales channel type
 */
function getChannelLabel(type: string) {
    switch (type) {
        case "kiosk":
            return "Kiosk"
        case "cash-desk":
            return "Cash Desk"
        case "web":
            return "Click & Collect"
        default:
            return type
    }
}

/**
 * Gets the product name from metadata
 */
function getProductName(product: TSkidataProduct): string {
    return product.name.en ?? product.name.de ?? product.id
}

/**
 * Gets the consumer category name from metadata
 */
function getConsumerName(consumer: TSkidataConsumer): string {
    return consumer.name.en ?? consumer.name.de ?? consumer.id
}

/**
 * Sales channel configuration card component
 *
 * @description
 * Displays a sales channel's configuration with checkboxes to toggle
 * which products and consumer categories are active for that channel.
 *
 * @param props - Component props
 * @returns JSX Element
 */
export function ResortConfigSalesChannelCard({
    salesChannel,
    products,
    consumers,
    onChange,
    isLoading = false,
}: TSalesChannelCardProps) {
    const [expandedSection, setExpandedSection] = useState<"products" | "categories" | null>(null)

    // Current selected IDs from the sales channel
    const selectedProductIds = useMemo(
        () => new Set(salesChannel.activeProductIds ?? []),
        [salesChannel.activeProductIds]
    )
    const selectedConsumerIds = useMemo(
        () => new Set(salesChannel.activeConsumerCategoryIds ?? []),
        [salesChannel.activeConsumerCategoryIds]
    )

    /**
     * Handles toggling a product selection
     */
    const handleProductToggle = useCallback((productId: string, checked: boolean) => {
        const newIds = new Set(selectedProductIds)
        if (checked) {
            newIds.add(productId)
        } else {
            newIds.delete(productId)
        }

        const update: TSalesChannelConfigUpdate = {
            id: salesChannel.id,
            activeProductIds: Array.from(newIds),
            activeConsumerCategoryIds: Array.from(selectedConsumerIds),
        }
        onChange(update)
    }, [salesChannel.id, selectedProductIds, selectedConsumerIds, onChange])

    /**
     * Handles toggling a consumer category selection
     */
    const handleConsumerToggle = useCallback((consumerId: string, checked: boolean) => {
        const newIds = new Set(selectedConsumerIds)
        if (checked) {
            newIds.add(consumerId)
        } else {
            newIds.delete(consumerId)
        }

        const update: TSalesChannelConfigUpdate = {
            id: salesChannel.id,
            activeProductIds: Array.from(selectedProductIds),
            activeConsumerCategoryIds: Array.from(newIds),
        }
        onChange(update)
    }, [salesChannel.id, selectedProductIds, selectedConsumerIds, onChange])

    /**
     * Handles selecting all products
     */
    const handleSelectAllProducts = useCallback(() => {
        const allIds = products.map(p => p.id)
        const update: TSalesChannelConfigUpdate = {
            id: salesChannel.id,
            activeProductIds: allIds,
            activeConsumerCategoryIds: Array.from(selectedConsumerIds),
        }
        onChange(update)
    }, [salesChannel.id, products, selectedConsumerIds, onChange])

    /**
     * Handles deselecting all products
     */
    const handleDeselectAllProducts = useCallback(() => {
        const update: TSalesChannelConfigUpdate = {
            id: salesChannel.id,
            activeProductIds: [],
            activeConsumerCategoryIds: Array.from(selectedConsumerIds),
        }
        onChange(update)
    }, [salesChannel.id, selectedConsumerIds, onChange])

    /**
     * Handles selecting all consumers
     */
    const handleSelectAllConsumers = useCallback(() => {
        const allIds = consumers.map(c => c.id)
        const update: TSalesChannelConfigUpdate = {
            id: salesChannel.id,
            activeProductIds: Array.from(selectedProductIds),
            activeConsumerCategoryIds: allIds,
        }
        onChange(update)
    }, [salesChannel.id, consumers, selectedProductIds, onChange])

    /**
     * Handles deselecting all consumers
     */
    const handleDeselectAllConsumers = useCallback(() => {
        const update: TSalesChannelConfigUpdate = {
            id: salesChannel.id,
            activeProductIds: Array.from(selectedProductIds),
            activeConsumerCategoryIds: [],
        }
        onChange(update)
    }, [salesChannel.id, selectedProductIds, onChange])

    return (
        <Card className={`transition-opacity ${isLoading ? "opacity-60 pointer-events-none" : ""}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {getChannelIcon(salesChannel.type)}
                        </div>
                        <div>
                            <CardTitle className="text-lg">{salesChannel.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-xs">
                                    {getChannelLabel(salesChannel.type)}
                                </Badge>
                                {salesChannel.depotTickets && (
                                    <Badge variant="secondary" className="text-xs">
                                        Depot
                                    </Badge>
                                )}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                        <div>{selectedProductIds.size}/{products.length} products</div>
                        <div>{selectedConsumerIds.size}/{consumers.length} categories</div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Products Section */}
                <div className="border rounded-lg">
                    <button
                        onClick={() => setExpandedSection(
                            expandedSection === "products" ? null : "products"
                        )}
                        className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors"
                    >
                        <span className="font-medium">Active Products</span>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                {selectedProductIds.size} selected
                            </Badge>
                            {expandedSection === "products" ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </div>
                    </button>

                    {expandedSection === "products" && (
                        <div className="border-t p-3 space-y-3">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSelectAllProducts}
                                >
                                    Select All
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDeselectAllProducts}
                                >
                                    Deselect All
                                </Button>
                            </div>
                            <ScrollArea className="h-[200px] pr-4">
                                <div className="grid gap-2">
                                    {products.map(product => (
                                        <label
                                            key={product.id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                        >
                                            <Checkbox
                                                checked={selectedProductIds.has(product.id)}
                                                onCheckedChange={(checked) =>
                                                    handleProductToggle(product.id, checked as boolean)
                                                }
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">
                                                    {getProductName(product)}
                                                </div>
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    {product.id}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>

                {/* Consumer Categories Section */}
                <div className="border rounded-lg">
                    <button
                        onClick={() => setExpandedSection(
                            expandedSection === "categories" ? null : "categories"
                        )}
                        className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors"
                    >
                        <span className="font-medium">Active Categories</span>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                {selectedConsumerIds.size} selected
                            </Badge>
                            {expandedSection === "categories" ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </div>
                    </button>

                    {expandedSection === "categories" && (
                        <div className="border-t p-3 space-y-3">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSelectAllConsumers}
                                >
                                    Select All
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDeselectAllConsumers}
                                >
                                    Deselect All
                                </Button>
                            </div>
                            <ScrollArea className="h-[200px] pr-4">
                                <div className="grid gap-2">
                                    {consumers.map(consumer => (
                                        <label
                                            key={consumer.id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                        >
                                            <Checkbox
                                                checked={selectedConsumerIds.has(consumer.id)}
                                                onCheckedChange={(checked) =>
                                                    handleConsumerToggle(consumer.id, checked as boolean)
                                                }
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">
                                                    {getConsumerName(consumer)}
                                                </div>
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    {consumer.id}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

