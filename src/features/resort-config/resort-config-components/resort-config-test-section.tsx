"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Monitor,
    Smartphone,
    ShoppingCart,
    Play,
    Loader2,
    CheckCircle2,
    XCircle,
} from "lucide-react"
import { testEndpoint } from "../resort-config-actions/resort-config-test-endpoints"
import type { TTestEndpointResponse, TApiResult } from "../resort-config-types/resort-config-types"

/**
 * Props for the test section component
 */
type TTestSectionProps = {
    /** Resort ID to test */
    resortId: number
}

/**
 * Test result state for each endpoint
 */
type TTestResults = {
    kiosk: TApiResult<TTestEndpointResponse> | null
    cashDesk: TApiResult<TTestEndpointResponse> | null
    web: TApiResult<TTestEndpointResponse> | null
}

/**
 * Endpoint configuration
 */
const ENDPOINT_CONFIG = {
    kiosk: {
        icon: Monitor,
        label: "Kiosk",
        description: "Test kiosk products endpoint",
    },
    cashDesk: {
        icon: Smartphone,
        label: "Cash Desk",
        description: "Test cash desk products endpoint",
    },
    web: {
        icon: ShoppingCart,
        label: "Web (Click & Collect)",
        description: "Test click and collect products endpoint",
    },
} as const

/**
 * Gets today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

/**
 * Test section component for verifying API endpoints
 *
 * @description
 * Provides buttons to test kiosk, cash desk, and web endpoints
 * with the current configuration. Displays the JSON response
 * to verify correct products/prices are returned.
 *
 * @param props - Component props
 * @returns JSX Element
 */
export function ResortConfigTestSection({ resortId }: TTestSectionProps) {
    const [startDate, setStartDate] = useState(getTodayDate)
    const [loading, setLoading] = useState<Record<string, boolean>>({})
    const [results, setResults] = useState<TTestResults>({
        kiosk: null,
        cashDesk: null,
        web: null,
    })
    const [activeTab, setActiveTab] = useState<keyof typeof ENDPOINT_CONFIG>("kiosk")

    /**
     * Runs a test for a specific endpoint
     */
    const runTest = useCallback(async (endpoint: "kiosk" | "cashDesk" | "web") => {
        setLoading(prev => ({ ...prev, [endpoint]: true }))

        try {
            const apiEndpoint = endpoint === "cashDesk" ? "cash-desk" : endpoint
            const result = await testEndpoint(apiEndpoint, resortId, startDate)

            setResults(prev => ({ ...prev, [endpoint]: result }))
        } catch (error) {
            setResults(prev => ({
                ...prev,
                [endpoint]: {
                    data: null,
                    error: error instanceof Error ? error.message : "Test failed",
                    status: 500,
                },
            }))
        } finally {
            setLoading(prev => ({ ...prev, [endpoint]: false }))
        }
    }, [resortId, startDate])

    /**
     * Runs all tests simultaneously
     */
    const runAllTests = useCallback(async () => {
        setLoading({ kiosk: true, cashDesk: true, web: true })

        await Promise.all([
            runTest("kiosk"),
            runTest("cashDesk"),
            runTest("web"),
        ])
    }, [runTest])

    /**
     * Renders the test result for an endpoint
     */
    const renderResult = (endpoint: keyof typeof ENDPOINT_CONFIG) => {
        const result = results[endpoint]

        if (!result) {
            return (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Monitor className="h-10 w-10 mb-3 opacity-50" />
                    <p>No test results yet</p>
                    <p className="text-sm mt-1">Click the test button to run the endpoint test</p>
                </div>
            )
        }

        const isSuccess = result.data?.success
        const catalogs = result.data?.catalogs ?? []

        return (
            <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                    {isSuccess ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Success
                        </Badge>
                    ) : (
                        <Badge variant="destructive">
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Failed
                        </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                        Status: {result.status}
                    </span>
                    {isSuccess && (
                        <span className="text-sm text-muted-foreground">
                            • {catalogs.length} catalog{catalogs.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {/* Error Message */}
                {result.error && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                        {result.error}
                    </div>
                )}

                {/* JSON Response */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Response (catalogs):</Label>
                    <ScrollArea className="h-[300px] rounded-lg border bg-zinc-950 p-4">
                        <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap">
                            {JSON.stringify(catalogs, null, 2)}
                        </pre>
                    </ScrollArea>
                </div>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-primary" />
                    Test Configuration
                </CardTitle>
                <CardDescription>
                    Verify your configuration by testing the actual API endpoints
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Test Parameters */}
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="max-w-[200px]"
                        />
                    </div>
                    <Button
                        onClick={runAllTests}
                        disabled={Object.values(loading).some(Boolean)}
                        className="min-w-[140px]"
                    >
                        {Object.values(loading).some(Boolean) ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Testing...
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" />
                                Test All
                            </>
                        )}
                    </Button>
                </div>

                {/* Endpoint Tests */}
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as keyof typeof ENDPOINT_CONFIG)}>
                    <TabsList className="grid w-full grid-cols-3">
                        {(Object.keys(ENDPOINT_CONFIG) as Array<keyof typeof ENDPOINT_CONFIG>).map((key) => {
                            const config = ENDPOINT_CONFIG[key]
                            const Icon = config.icon
                            const result = results[key]
                            const isLoading = loading[key]
                            const hasResult = result !== null
                            const isSuccess = result?.data?.success

                            return (
                                <TabsTrigger
                                    key={key}
                                    value={key}
                                    className="flex items-center gap-2"
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{config.label}</span>
                                    {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                                    {!isLoading && hasResult && (
                                        isSuccess ? (
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                        ) : (
                                            <XCircle className="h-3 w-3 text-destructive" />
                                        )
                                    )}
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>

                    {(Object.keys(ENDPOINT_CONFIG) as Array<keyof typeof ENDPOINT_CONFIG>).map((key) => {
                        const config = ENDPOINT_CONFIG[key]
                        const Icon = config.icon

                        return (
                            <TabsContent key={key} value={key} className="mt-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{config.label}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {config.description}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => runTest(key)}
                                            disabled={loading[key]}
                                        >
                                            {loading[key] ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Testing...
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Run Test
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {renderResult(key)}
                                </div>
                            </TabsContent>
                        )
                    })}
                </Tabs>
            </CardContent>
        </Card>
    )
}

