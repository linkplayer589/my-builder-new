"use client"

import { useState } from "react"
import Image from "next/image"
import { useResort } from "@/features/resorts"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { RelativeDayBadge } from "@/components/ui/relative-day-badge"

import { ordersTableReturnLifepassApi } from "@/features/orders-table/orders-table-actions/orders-table-return-lifepass-api/route"
import { ordersTableSwapPassApi } from "@/features/orders-table/orders-table-actions/orders-table-swap-pass-api/route"
import { getMythOrder } from "@/features/orders-table/orders-table-features/orders-table-myth-dialog/orders-table-myth-dialog-actions/get-myth-order/route"
import { type MythOrderDetails } from "@/features/orders-table/orders-table-features/orders-table-myth-dialog/orders-table-myth-dialog-actions/get-myth-order/types"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export interface MythDialogProps {
    mythOrderSubmissionData: MythOrderDetails
}

// Add a new component for displaying product details
function ProductDetails({
    productId,
    consumerCategoryId,
    hasInsurance,
}: {
    productId: string
    consumerCategoryId: string
    hasInsurance: boolean
}) {
    const { getProductName, getConsumerCategoryName } = useResort()

    const productName = getProductName(productId)
    const categoryName = getConsumerCategoryName(consumerCategoryId)

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-medium">Product:</span>
                <span className="text-muted-foreground">
                    {productName.en ?? "N/A"} - {categoryName.en ?? "N/A"}
                    {hasInsurance ? " (Insured)" : " (Not Insured)"}
                </span>
            </div>
        </div>
    )
}

interface Device {
    id: string
    deviceCode: string | null
    imei?: string
    dtaCode?: string
    battery?: number
    deviceAllocated?: boolean
    connected?: boolean
    productId?: string
    consumerCategoryId?: string
    insurance?: boolean
}

function DeviceActions({
    device,
    onSuccess,
    orderId,
    resortId,
}: {
    device: Device
    onSuccess: () => void
    orderId: number
    resortId: number
}) {
    const [_isSwapOpen, setIsSwapOpen] = useState(false)
    const [_isReturnOpen, setIsReturnOpen] = useState(false)

    const _handleSwap = async (
        oldPassId: string,
        newPassId: string,
        swapSkipass: boolean
    ) => {
        try {
            const result = await ordersTableSwapPassApi(
                orderId,
                oldPassId,
                newPassId,
                resortId,
                swapSkipass
            )
            if (result.success) {
                toast.success(result.message)
                setIsSwapOpen(false)
                onSuccess()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Failed to swap pass")
        }
    }

    const _handleReturn = async (deviceIds: string[]) => {
        try {
            const result = await ordersTableReturnLifepassApi(deviceIds)
            if (result.success) {
                toast.success(result.message)
                setIsReturnOpen(false)
                onSuccess()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Failed to return lifepass")
        }
    }


    return (
        <div className="mt-2 flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSwapOpen(true)}
                disabled={!device.deviceCode}
            >
                Swap Pass
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReturnOpen(true)}
                disabled={!device.deviceCode}
            >
                Return Pass
            </Button>
        </div>
    )
}

export function MythPage({ mythOrderSubmissionData }: MythDialogProps) {
    const { resortId } = useResort()
    const [showReturnAllConfirm, setShowReturnAllConfirm] = useState(false)

    const query = useQuery<MythOrderDetails & { updatedAt?: string }, Error>({
        queryKey: ["mythOrder", mythOrderSubmissionData.orderId],
        queryFn: async () => {
            try {
                const response = await getMythOrder(
                    Number(mythOrderSubmissionData.orderId)
                )
                if (!response.success) {
                    const errorResponse = response as unknown as {
                        success: false
                        error: string
                        meta?: unknown
                    }
                    const errorMessage =
                        errorResponse.error || "Failed to fetch order details"
                    toast.error(errorMessage)
                    throw new Error(errorMessage)
                }
                
                if (!response.orderDetails) {
                    throw new Error("No order details in response")
                }
                
                toast.success("Order details refreshed")
                return {
                    ...response.orderDetails,
                    updatedAt: response.updatedAt,
                }
            } catch (err) {
                const error = err as Error
                const errorMessage = error?.message || "Failed to fetch order details"
                toast.error(errorMessage)
                throw new Error(errorMessage)
            }
        },
        enabled: true,
        retry: 1,
    })

    const { data: orderData, refetch, isLoading, isFetching, error } = query
    const displayData = orderData || mythOrderSubmissionData;
    const handleReturnAll = async () => {
        if (!displayData?.devices) {
            toast.error("No devices available")
            return
        }

        const deviceCodes = displayData.devices
            .map((device: { deviceCode?: string | null }) => device?.deviceCode)
            .filter((code: string | null | undefined): code is string => code !== null && code !== undefined)

        if (deviceCodes.length === 0) {
            toast.error("No devices to return")
            return
        }

        try {
            const result = await ordersTableReturnLifepassApi(deviceCodes)
            if (result.success) {
                toast.success(result.message)
                void refetch()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Failed to return lifepasses")
        } finally {
            setShowReturnAllConfirm(false)
        }
    }

    return (
        <div className="container mx-auto">


            <Tabs defaultValue="orderData">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="orderData">Order Data</TabsTrigger>
                    <TabsTrigger value="submission">Submission</TabsTrigger>
                </TabsList>

                <TabsContent value="orderData" className="space-y-4">
                    <div className="flex items-center justify-end gap-2">
                        <p className="text-sm text-muted-foreground">
                            Last updated:{" "}
                            {orderData?.updatedAt
                                ? new Date(orderData.updatedAt).toLocaleString()
                                : "N/A"}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                try {
                                    await refetch()
                                } catch (error) {
                                    toast.error("Failed to refresh order details")
                                }
                            }}
                            className="gap-2"
                            disabled={isFetching}
                        >
                            <ReloadIcon
                                className={`size-4 ${isFetching ? "animate-spin" : ""}`}
                            />
                            Refresh
                        </Button>
                    </div>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <ReloadIcon className="size-6 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="py-8 text-center">
                            <p className="text-sm text-destructive">{error.message}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">Order ID:</span>
                                    <span className="text-muted-foreground">
                                        {displayData?.orderId || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">Group ID:</span>
                                    <span className="text-muted-foreground">
                                        {displayData?.groupId || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">Auth Code:</span>
                                    <span className="text-muted-foreground">
                                        {displayData?.authCode || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">Status:</span>
                                    <span className="text-muted-foreground">
                                        {displayData?.status || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">From:</span>
                                    <span className="text-muted-foreground">
                                        <RelativeDayBadge
                                            date={
                                                displayData?.from
                                                    ? new Date(displayData.from)
                                                    : new Date()
                                            }
                                        />
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">To:</span>
                                    <span className="text-muted-foreground">
                                        <RelativeDayBadge
                                            date={
                                                displayData?.to
                                                    ? new Date(displayData.to)
                                                    : new Date()
                                            }
                                        />
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Contact Details</h4>
                                <div className="space-y-2 rounded-md border p-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Phone:</span>
                                        <span className="text-muted-foreground">
                                            {displayData?.contactDetails?.telephone || "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Email:</span>
                                        <span className="text-muted-foreground">
                                            {displayData?.contactDetails?.email || "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Contact Name:</span>
                                        <span className="text-muted-foreground">
                                            {displayData?.contactDetails?.contactName || "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">Devices</h4>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowReturnAllConfirm(true)}
                                        disabled={
                                            !displayData?.devices?.some((d: { deviceCode?: string }) => d.deviceCode)
                                        }
                                    >
                                        Return All Devices
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    {(displayData?.devices || []).map((device: Device) => (
                                        <div
                                            key={device.id}
                                            className="space-y-2 rounded-md border p-4"
                                        >
                                            <div className="flex flex-col text-sm sm:flex-row sm:justify-between">
                                                <span className="font-medium">Device Code:</span>
                                                <span className="mt-1 text-muted-foreground sm:mt-0">
                                                    {device?.deviceCode || "No device assigned"}
                                                </span>
                                            </div>

                                            <ProductDetails
                                                productId={device?.productId || ""}
                                                consumerCategoryId={device?.consumerCategoryId || ""}
                                                hasInsurance={device?.insurance || false}
                                            />

                                            {device?.deviceCode ? (
                                                <>
                                                    <div className="flex flex-col text-sm sm:flex-row sm:justify-between">
                                                        <span className="font-medium">IMEI:</span>
                                                        <span className="mt-1 text-muted-foreground sm:mt-0">
                                                            {device?.imei || "N/A"}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col text-sm sm:flex-row sm:justify-between">
                                                        <span className="font-medium">DTA Code:</span>
                                                        <span className="mt-1 text-muted-foreground sm:mt-0">
                                                            {device?.dtaCode || "N/A"}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col text-sm sm:flex-row sm:justify-between">
                                                        <span className="font-medium">Battery:</span>
                                                        <span className="mt-1 text-muted-foreground sm:mt-0">
                                                            {device?.battery || 0}%
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col text-sm sm:flex-row sm:justify-between">
                                                        <span className="font-medium">Status:</span>
                                                        <span className="mt-1 text-muted-foreground sm:mt-0">
                                                            {device?.deviceAllocated ? "Allocated" : "Not Allocated"} •{" "}
                                                            {device?.connected ? "Connected" : "Disconnected"}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-sm italic text-muted-foreground">
                                                    No device details available
                                                </div>
                                            )}

                                            <DeviceActions
                                                device={device}
                                                onSuccess={refetch}
                                                orderId={Number(displayData?.orderId) || 0}
                                                resortId={resortId}
                                            />
                                        </div>

                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Registration</h4>
                                    <div className="space-y-2 rounded-md border p-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">URL:</span>
                                            <a
                                                href={displayData?.registrationUrl || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline"
                                            >
                                                Open Registration
                                            </a>
                                        </div>
                                        <div className="flex justify-center p-4">
                                            {displayData?.registrationUrlBase64QrCode ? (
                                                <Image
                                                    src={displayData?.registrationUrlBase64QrCode || ""}
                                                    alt="Registration QR Code"
                                                    width={200}
                                                    height={200}
                                                    className="max-w-[200px]"
                                                />
                                            ) : (
                                                <div className="text-sm text-muted-foreground">
                                                    QR Code not available
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="submission" className="space-y-4">
                    <div className="flex items-center justify-end gap-2">
                        <p className="text-sm text-muted-foreground">
                            Last updated:{" "}
                            {mythOrderSubmissionData?.updatedAt ? (
                                <RelativeDayBadge
                                    date={new Date(mythOrderSubmissionData.updatedAt)}
                                />
                            ) : (
                                "N/A"
                            )}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Order ID:</span>
                                <span className="text-muted-foreground">
                                    {mythOrderSubmissionData.orderId}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Group ID:</span>
                                <span className="text-muted-foreground">
                                    {mythOrderSubmissionData.groupId}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Auth Code:</span>
                                <span className="text-muted-foreground">
                                    {mythOrderSubmissionData.authCode}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Status:</span>
                                <span className="text-muted-foreground">
                                    {mythOrderSubmissionData.status}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">From:</span>
                                <span className="text-muted-foreground">
                                    <RelativeDayBadge
                                        date={
                                            mythOrderSubmissionData?.from
                                                ? new Date(mythOrderSubmissionData.from)
                                                : new Date()
                                        }
                                    />
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">To:</span>
                                <span className="text-muted-foreground">
                                    <RelativeDayBadge
                                        date={
                                            mythOrderSubmissionData?.to
                                                ? new Date(mythOrderSubmissionData.to)
                                                : new Date()
                                        }
                                    />
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Contact Details</h4>
                            <div className="space-y-2 rounded-md border p-4">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">Phone:</span>
                                    <span className="text-muted-foreground">
                                        {mythOrderSubmissionData?.contactDetails?.telephone ||
                                            "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">Email:</span>
                                    <span className="text-muted-foreground">
                                        {mythOrderSubmissionData?.contactDetails?.email ||
                                            "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">Contact Name:</span>
                                    <span className="text-muted-foreground">
                                        {mythOrderSubmissionData?.contactDetails?.contactName ||
                                            "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Devices</h4>
                            <div className="space-y-4">
                                {(mythOrderSubmissionData?.devices || []).map((device: { id: string; deviceCode?: string; imei?: string; nickname?: string; dtaCode?: string; battery?: number; deviceAllocated?: boolean; connected?: boolean; productId?: string; consumerCategoryId?: string; insurance?: boolean }) => (
                                    <div
                                        key={device.id}
                                        className="space-y-2 rounded-md border p-4"
                                    >
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Device Code:</span>
                                            <span className="text-muted-foreground">
                                                {device?.deviceCode || "No device assigned"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">IMEI:</span>
                                            <span className="text-muted-foreground">
                                                {device?.imei || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">DTA Code:</span>
                                            <span className="text-muted-foreground">
                                                {device?.dtaCode || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Battery:</span>
                                            <span className="text-muted-foreground">
                                                {device?.battery || 0}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Status:</span>
                                            <span className="text-muted-foreground">
                                                {device?.deviceAllocated
                                                    ? "Allocated"
                                                    : "Not Allocated"}{" "}
                                                • {device?.connected ? "Connected" : "Disconnected"}
                                            </span>
                                        </div>
                                        <ProductDetails
                                            productId={device?.productId || ""}
                                            consumerCategoryId={device?.consumerCategoryId || ""}
                                            hasInsurance={device?.insurance || false}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Registration</h4>
                            <div className="space-y-2 rounded-md border p-4">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">URL:</span>
                                    <a
                                        href={mythOrderSubmissionData.registrationUrl || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                    >
                                        Open Registration
                                    </a>
                                </div>
                                <div className="flex justify-center p-4">
                                    {mythOrderSubmissionData?.registrationUrlBase64QrCode ? (
                                        <Image
                                            src={
                                                mythOrderSubmissionData?.registrationUrlBase64QrCode ||
                                                ""
                                            }
                                            alt="Registration QR Code"
                                            width={200}
                                            height={200}
                                            className="max-w-[200px]"
                                        />
                                    ) : (
                                        <div className="text-sm text-muted-foreground">
                                            QR Code not available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
            <Dialog
                open={showReturnAllConfirm}
                onOpenChange={setShowReturnAllConfirm}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Return All Passes</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to return all passes for this order? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:justify-start">
                        <Button variant="destructive" onClick={handleReturnAll}>
                            Return All
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowReturnAllConfirm(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div
                className="h-4"
            />
        </div>
    )
}
