'use client'
import { Button } from '@/components/ui/button';
import type { Order } from '@/db/schema';
import { ordersTableReturnLifepassApi } from '@/features/orders-table/orders-table-actions/orders-table-return-lifepass-api/route';
// Swap now handled within dialog via process buttons
import { dbToggleTestOrder } from '@/db/server-actions/order-actions/db-toggle-test-order';
import { OrdersTableReturnLifepassDialog } from '@/features/orders-table/orders-table-features/orders-table-return-lifepass-dialog';
import { OrdersTableSwapPassDialog } from '@/features/orders-table/orders-table-features/orders-table-swap-pass-dialog';
import { Download, RefreshCcw, Undo } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

interface OrderActionsTabsProps {
    resortName: string;
    order: Order

}

const OrderActionsTabs: React.FC<OrderActionsTabsProps> = ({ resortName: _resortName, order }) => {
    const [showSwapPassDialog, setShowSwapPassDialog] = React.useState(false);
    const [showReturnLifepassDialog, setShowReturnLifepassDialog] = React.useState(false);

    // Swap handled in dialog (process buttons)

    const handleReturnLifepass = React.useCallback(
        async (deviceIds: string[]) => {
            try {
                const result = await ordersTableReturnLifepassApi(deviceIds)

                if (result.success) {
                    toast.success(
                        result.message ?? "Successfully returned lifepass(es)",
                        {
                            duration: 5000,
                        }
                    )
                    setShowReturnLifepassDialog(false)
                } else {
                    toast.error(result.message ?? "Failed to return lifepass", {
                        duration: 5000,
                        description:
                            "Please try again or contact support if the issue persists.",
                    })
                }
            } catch (error) {
                console.error("Error returning lifepass:", error)
                toast.error("An unexpected error occurred", {
                    duration: 5000,
                    description:
                        "Please try again or contact support if the issue persists.",
                })
            }
        },
        []
    )

    return (
        <React.Fragment>
            <div className="flex flex-wrap gap-2 md:gap-4">
                <Button
                    onClick={() => setShowSwapPassDialog(true)}
                    variant="outline"
                    size="sm"
                    className="min-w-[calc(50%-0.5rem)] flex-1 gap-2 md:min-w-0 md:flex-initial"
                >
                    <RefreshCcw className="size-4" aria-hidden="true" />
                    <span>Swap Pass</span>
                </Button>
                <Button
                    onClick={() => setShowReturnLifepassDialog(true)}
                    variant="outline"
                    size="sm"
                    className="min-w-[calc(50%-0.5rem)] flex-1 gap-2 md:min-w-0 md:flex-initial"
                >
                    <Undo className="size-4" aria-hidden="true" />
                    <span>Return LifePass</span>
                </Button>
                <Button
                    onClick={() => {
                        void dbToggleTestOrder({
                            id: order.id,
                            testOrder: !order.testOrder,
                        }).then((updatedOrder) => {
                            toast.success(`Order marked as ${updatedOrder.data?.testOrder ? 'Test Order' : 'Real Order'}.`)
                        })
                    }}
                    variant="outline"
                    size="sm"
                    className="min-w-[calc(50%-0.5rem)] flex-1 gap-2 md:min-w-0 md:flex-initial"
                >
                    <span>
                        {order.testOrder ? "Mark as Real Order" : "Mark as Test Order"}
                    </span>
                </Button>
                <Button
                    onClick={() => {
                        window.open(
                            `https://mtech-api.jordangigg.workers.dev/api/orders/${order.id}/receipt`,
                            "_blank"
                        )
                    }}
                    variant="outline"
                    size="sm"
                    className="min-w-[calc(50%-0.5rem)] flex-1 gap-2 md:min-w-0 md:flex-initial"
                >
                    <Download className="size-4" aria-hidden="true" />
                    <span>Download Receipt</span>
                </Button>
            </div>
            {showSwapPassDialog && (
                <OrdersTableSwapPassDialog
                    open={showSwapPassDialog}
                    onOpenChange={setShowSwapPassDialog}
                    orderId={order.id}
                    resortId={order.resortId}
                    deviceCodes={
                        order.mythOrderSubmissionData?.devices
                            ?.flatMap((device) => device.deviceCode)
                            .filter(Boolean) ?? []
                    }
                    deviceDetailsByCode={(() => {
                        const devices = order.mythOrderSubmissionData?.devices as Array<{ deviceCode?: string; productId?: string; consumerCategoryId?: string }> | undefined
                        const map: Record<string, { productId: string; consumerCategoryId: string }> = {}
                        devices?.forEach((d) => {
                            if (d?.deviceCode && d?.productId && d?.consumerCategoryId) {
                                map[d.deviceCode] = { productId: d.productId, consumerCategoryId: d.consumerCategoryId }
                            }
                        })
                        return map
                    })()}
                    previousSkidataOrderId={(order.skidataOrderSubmissionData as { orderId?: string } | undefined)?.orderId}
                    defaultOldPassId={(() => {
                        const codes = order.mythOrderSubmissionData?.devices
                          ?.flatMap((device) => device.deviceCode)
                          .filter(Boolean) as string[] | undefined
                        return codes && codes.length === 1 ? codes[0] : undefined
                    })()}
                />
            )}
            {showReturnLifepassDialog && (
                <OrdersTableReturnLifepassDialog
                    open={showReturnLifepassDialog}
                    onOpenChange={setShowReturnLifepassDialog}
                    onReturn={handleReturnLifepass}
                    deviceCodes={
                        order.mythOrderSubmissionData?.devices
                            ?.flatMap((device) => device.deviceCode)
                            .filter(Boolean) ?? []
                    }
                />
            )}
        </React.Fragment>
    );
};

export default OrderActionsTabs;