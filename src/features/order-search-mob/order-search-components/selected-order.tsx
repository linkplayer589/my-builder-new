"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { type Order } from "@/db/schema"
import { ordersTableSwapPassApi } from "../../orders-table/orders-table-actions/orders-table-swap-pass-api/route"
import { toast } from "sonner"
import { DeviceIdInput as _DeviceIdInput } from "../../create-new-order/create-new-order-components/create-new-order-device-id-input"
import { Controller } from "react-hook-form"
import { SwapPassDeviceIdInput } from "./swap-pass-device-input"

const newLifePassSchema = z.object({
    newLifePassId: z.string().min(1, "New LifePass ID is required"),
})

type NewLifePassFormValues = z.infer<typeof newLifePassSchema>

interface SelectedOrderProps {
    order: Order
    onChange?: (newId: string) => void
    oldFifepassId: string
    oldLifePassId: string
}

export function SelectedOrder({ order, onChange, oldFifepassId, oldLifePassId }: SelectedOrderProps) {
    const {
        control,
        register: _register,
        handleSubmit,
        formState: { errors },
    } = useForm<NewLifePassFormValues>({
        resolver: zodResolver(newLifePassSchema),
    })

    const [swappingPass, setSwappingPass] = React.useState(false)
    const [_passId, _setPassId] = React.useState('')

    const onSubmit = async (data: NewLifePassFormValues) => {
        if (!order?.id) {
            toast.error("Please select an order and enter a new Lifepass ID")
            return
        }
        setSwappingPass(true)
        try {
            const result = await ordersTableSwapPassApi(
                Number(order?.id),
                oldFifepassId,
                data.newLifePassId,
                order?.resortId ?? 0,
                false
            )
            if (result.success) {
                toast.success("Pass swapped successfully")
            } else {
                toast.error(result.message || "Failed to swap pass")
            }
        } catch (error) {
            console.error("Error swapping pass:", error)
            toast.error("Failed to swap pass")
        } finally {
            setSwappingPass(false)
        }
    }

    const formatDate = (date: Date | null) => {
        if (!date) return "No date"
        return new Date(date).toLocaleDateString()
    }

    const formatPrice = (order: Order) => {
        if (!order.calculatedOrderPrice) return "No price"
        const totalPrice =
            order.calculatedOrderPrice.cumulatedPrice?.bestPrice?.amountGross
        if (totalPrice === undefined) return "No price"
        return `$${totalPrice.toFixed(2)}`
    }


    return (
        <div className="space-y-4 pb-4">
            {/* Selected Order Card */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-bold sm:text-lg">Selected Order</h3>
                    <Button variant="ghost" size="sm" onClick={() => onChange?.("")} className="h-8 text-sm">
                        Change
                    </Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-bold sm:text-lg">
                                Order #{order.id || "N/A"}
                            </p>
                            <Badge variant="outline" className="whitespace-nowrap text-xs capitalize sm:text-sm">
                                {order.salesChannel}
                            </Badge>
                        </div>
                        <p className="max-w-full truncate text-sm text-muted-foreground sm:text-base">
                            {order.clientDetails?.name || "No name provided"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                            <span>{formatDate(order.createdAt)}</span>
                            <span>•</span>
                            <span>{order.clientDetails?.mobile || "No phone"}</span>
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1.5 sm:ml-4 sm:items-end">
                        <span className="whitespace-nowrap text-base font-bold sm:text-lg">
                            {formatPrice(order)}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            <Badge variant="secondary" className="w-fit text-xs capitalize sm:text-sm">
                                {order.orderStatus || "N/A"}
                            </Badge>
                            <Badge variant="outline" className="w-fit text-xs capitalize sm:text-sm">
                                {order.paymentStatus || "N/A"}
                            </Badge>
                        </div>
                    </div>
                </div>

                <Separator className="my-3 sm:my-4" />

                {/* Devices Section */}
                <div className="space-y-3">
                    <span className="text-sm font-semibold text-muted-foreground sm:text-base">
                        {order.mythOrderSubmissionData?.devices?.length || 0} Device
                        {order.mythOrderSubmissionData?.devices?.length !== 1 ? "s" : ""}
                    </span>
                    {order.mythOrderSubmissionData?.devices?.length ? (
                        <div className="flex flex-wrap gap-2">
                            {order.mythOrderSubmissionData.devices.map((device, idx) => (
                                <Badge
                                    key={device.deviceId || idx}
                                    variant={oldLifePassId === device.deviceId ? "default" : "secondary"}
                                    className={`text-sm ${oldLifePassId === device.deviceId ? "bg-primary font-bold text-primary-foreground" : ""}`}
                                >
                                    {device.deviceCode && <span className="font-bold">{device.deviceCode}</span>}
                                    {device.deviceCode && device.dtaCode && <span className="mx-1">•</span>}
                                    <span className={device.deviceCode ? "text-xs opacity-80" : ""}>
                                        {device.dtaCode || "N/A"}
                                    </span>
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-muted-foreground">No devices</p>
                    )}
                </div>
            </div>

            {/* New LifePass ID Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label
                        htmlFor="newLifePassId"
                        className="text-base font-semibold sm:text-sm"
                    >
                        New LifePass ID
                    </label>
                    <Controller
                        name="newLifePassId"
                        control={control}
                        render={({ field }) => (
                            <SwapPassDeviceIdInput
                                index={0}
                                {...field}
                            />
                        )}
                    />
                    {errors.newLifePassId && (
                        <p className="text-sm text-destructive">{errors.newLifePassId.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="h-12 w-full text-base font-semibold sm:h-10 sm:text-sm"
                    size="lg"
                    disabled={swappingPass}
                >
                    {swappingPass ? "Swapping..." : "Swap"}
                </Button>
            </form>
        </div>
    )
}
