"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import {
    RefreshCcw,
    Save,
    Trash2,
    Download,
    Loader2,
    AlertTriangle,
    Settings,
} from "lucide-react"
import { useSkidataStream } from "../resort-config-hooks/resort-config-use-skidata-stream"
import { invalidateCatalogCache } from "../resort-config-actions/resort-config-invalidate-cache"
import { batchUpdateSalesChannelConfigs } from "../resort-config-actions/resort-config-update-sales-channel"
import { ResortConfigLogTerminal } from "./resort-config-log-terminal"
import { ResortConfigPriceTable } from "./resort-config-price-table"
import { ResortConfigSalesChannelCard } from "./resort-config-sales-channel-card"
import { ResortConfigTestSection } from "./resort-config-test-section"
import type {
    TSalesChannelConfigUpdate,
    SalesChannel,
    Resort,
} from "../resort-config-types/resort-config-types"

/**
 * Props for the resort configuration client component
 */
type TResortConfigClientProps = {
    /** The resort to configure */
    resort: Resort
    /** Sales channels for the resort */
    salesChannels: SalesChannel[]
}

/**
 * Main client component for resort configuration
 *
 * @description
 * Orchestrates all the resort configuration functionality including:
 * - Skidata price streaming
 * - Sales channel configuration
 * - Cache invalidation
 * - Configuration testing
 *
 * @param props - Component props
 * @returns JSX Element
 */
export function ResortConfigClient({ resort, salesChannels: initialSalesChannels }: TResortConfigClientProps) {
    // Stream hook for Skidata prices
    const { session, startStream, stopStream, clearLogs, isStreaming } = useSkidataStream()

    // Local state for sales channel configurations
    const [pendingUpdates, setPendingUpdates] = useState<Map<number, TSalesChannelConfigUpdate>>(new Map())
    const [activeScenario, setActiveScenario] = useState<"HIGH" | "LOW" | "HIGH-DEPOT" | "LOW-DEPOT">("HIGH")
    const [showSaveConfirm, setShowSaveConfirm] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isInvalidating, setIsInvalidating] = useState(false)

    /**
     * Checks if there are unsaved changes
     */
    const hasUnsavedChanges = pendingUpdates.size > 0

    /**
     * Gets the effective sales channel configuration (original + pending updates)
     */
    const getEffectiveChannel = useCallback((channel: SalesChannel): SalesChannel => {
        const pending = pendingUpdates.get(channel.id)
        if (!pending) return channel

        return {
            ...channel,
            activeProductIds: pending.activeProductIds,
            activeConsumerCategoryIds: pending.activeConsumerCategoryIds,
        }
    }, [pendingUpdates])

    /**
     * Handles configuration changes from sales channel cards
     */
    const handleConfigChange = useCallback((update: TSalesChannelConfigUpdate) => {
        setPendingUpdates(prev => {
            const newMap = new Map(prev)
            newMap.set(update.id, update)
            return newMap
        })
    }, [])

    /**
     * Saves all pending configuration changes
     */
    const handleSave = useCallback(async () => {
        if (pendingUpdates.size === 0) return

        setIsSaving(true)
        setShowSaveConfirm(false)

        try {
            const updates = Array.from(pendingUpdates.values())
            const results = await batchUpdateSalesChannelConfigs(updates)

            const successCount = results.filter(r => r.data !== null).length
            const failureCount = results.length - successCount

            if (failureCount === 0) {
                toast({
                    title: "Configuration saved",
                    description: `Successfully updated ${successCount} sales channel${successCount !== 1 ? "s" : ""}`,
                })
                setPendingUpdates(new Map())
            } else {
                toast({
                    title: "Partial save",
                    description: `${successCount} succeeded, ${failureCount} failed`,
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Save failed",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }, [pendingUpdates])

    /**
     * Invalidates the catalog cache
     */
    const handleInvalidateCache = useCallback(async () => {
        setIsInvalidating(true)

        try {
            const result = await invalidateCatalogCache(resort.id)

            if (result.data?.success) {
                toast({
                    title: "Cache invalidated",
                    description: "Catalog cache has been cleared successfully",
                })
            } else {
                toast({
                    title: "Cache invalidation failed",
                    description: result.error ?? "Unknown error",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Cache invalidation failed",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive",
            })
        } finally {
            setIsInvalidating(false)
        }
    }, [resort.id])

    /**
     * Products from metadata for configuration UI
     */
    const products = useMemo(() => session.metadata?.products ?? [], [session.metadata])

    /**
     * Consumer categories from metadata for configuration UI
     */
    const consumers = useMemo(() => session.metadata?.consumers ?? [], [session.metadata])

    return (
        <div className="space-y-6">
            {/* Header with resort info */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Settings className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle>{resort.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-0.5">
                                    <Badge variant="outline">{resort.config.DEFAULT_CURRENCY}</Badge>
                                    <span>ID: {resort.id}</span>
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasUnsavedChanges && (
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Unsaved changes
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <Button
                    onClick={isStreaming ? stopStream : startStream}
                    variant={isStreaming ? "destructive" : "default"}
                    disabled={isSaving || isInvalidating}
                >
                    {isStreaming ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Stop Stream
                        </>
                    ) : session.state === "connecting" ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Fetch Latest Skidata Prices
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    onClick={handleInvalidateCache}
                    disabled={isStreaming || isSaving || isInvalidating}
                >
                    {isInvalidating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Invalidating...
                        </>
                    ) : (
                        <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Invalidate Catalog Cache
                        </>
                    )}
                </Button>

                <Button
                    onClick={() => setShowSaveConfirm(true)}
                    disabled={!hasUnsavedChanges || isStreaming || isSaving || isInvalidating}
                    className="ml-auto"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Configuration ({pendingUpdates.size})
                        </>
                    )}
                </Button>
            </div>

            {/* Log Terminal */}
            {(session.logs.length > 0 || isStreaming) && (
                <ResortConfigLogTerminal
                    logs={session.logs}
                    onClear={clearLogs}
                    maxHeight="200px"
                />
            )}

            {/* Price Table */}
            <ResortConfigPriceTable
                priceData={session.priceData}
                products={products}
                consumers={consumers}
                productNames={session.productNames}
                consumerNames={session.consumerNames}
                activeScenario={activeScenario}
                onScenarioChange={setActiveScenario}
            />

            {/* Sales Channel Configuration */}
            {products.length > 0 && consumers.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">Sales Channel Configuration</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Configure which products and categories are available for each sales channel
                            </p>
                        </div>
                        {hasUnsavedChanges && (
                            <Button variant="ghost" size="sm" onClick={() => setPendingUpdates(new Map())}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Reset Changes
                            </Button>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {initialSalesChannels.map((channel) => (
                            <ResortConfigSalesChannelCard
                                key={channel.id}
                                salesChannel={getEffectiveChannel(channel)}
                                products={products}
                                consumers={consumers}
                                onChange={handleConfigChange}
                                isLoading={isSaving}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* No metadata notice */}
            {products.length === 0 && consumers.length === 0 && session.state !== "streaming" && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Settings className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium">Configuration Not Available</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-md">
                            Fetch the latest Skidata prices first to load product and category metadata
                            for configuration.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Test Configuration Section */}
            <ResortConfigTestSection resortId={resort.id} />

            {/* Save Confirmation Dialog */}
            <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Confirm Configuration Save
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to save these changes? This will immediately
                            affect which products are available for sale through the configured
                            sales channels.
                            <br /><br />
                            <strong className="text-foreground">
                                {pendingUpdates.size} sales channel{pendingUpdates.size !== 1 ? "s" : ""} will be updated.
                            </strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSave}>
                            Yes, Save Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

