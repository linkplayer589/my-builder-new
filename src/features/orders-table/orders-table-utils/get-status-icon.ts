import { type Order } from "@/db/schema"
import { Activity, CheckCircle2, CircleX, DollarSign, Package, PackageCheck, ShoppingCart, Timer, Undo2, XCircle } from "lucide-react"

/**
 * Get icon for order lifecycle status
 *
 * @param status - Order status from the orderStatus column
 * @returns Lucide icon component for the status
 */
export function getOrderStatusIcon(status: Order["orderStatus"]) {
    const statusIcons = {
        // Order lifecycle states
        "ordered": ShoppingCart,
        "awaiting-collection": Package,
        "order-active": Activity,
        "cancelled": XCircle,
        "cancelled-refunded": Undo2,
        "order-complete": PackageCheck,
    } as const

    return statusIcons[status] ?? CircleX
}

/**
 * Get icon for payment status
 *
 * @param status - Payment status from the paymentStatus column
 * @returns Lucide icon component for the status
 */
export function getPaymentStatusIcon(status: Order["paymentStatus"]) {
    const statusIcons = {
        // Payment pending/processing statuses
        "intent-payment-pending": Timer,
        "payment-processing": Timer,
        "payment-requires-action": Timer,
        "payment-sent-to-terminal": Timer,
        // Payment completion statuses
        "deposit-paid": DollarSign,
        "fully-paid": CheckCircle2,
        // Payment failure statuses
        "payment-failed": CircleX,
        "payment-cancelled": CircleX,
        "payment-expired": CircleX,
        // Other payment statuses
        "partially-funded": DollarSign,
        "capturable": Timer,
    } as const

    return statusIcons[status] ?? CircleX
}

/**
 * @deprecated Use getOrderStatusIcon or getPaymentStatusIcon instead
 * Get icon for the deprecated combined status field
 *
 * @param status - Status from the deprecated status column
 * @returns Lucide icon component for the status
 */
export function getStatusIcon(status: Order["status"]) {
    const statusIcons = {
        // Order creation statuses
        "order-created": Timer,
        "intent-payment-pending": Timer,
        // Payment processing statuses
        "payment-processing": Timer,
        "payment-requires-action": Timer,
        "payment-sent-to-terminal": Timer,
        // Payment completion statuses
        "deposit-paid": DollarSign,
        "fully-paid": CheckCircle2,
        // Payment failure statuses
        "payment-failed": CircleX,
        "payment-cancelled": CircleX,
        "payment-expired": CircleX,
        // Order submission statuses
        "order-submitting": Timer,
        "order-active": Activity,
        "submission-failed": CircleX,
        // Post-completion statuses
        "order-refunded": Undo2,
        "partially-funded": DollarSign,
        "capturable": Timer,
        "order-complete": CheckCircle2,
    } as const

    return statusIcons[status] ?? CircleX
}

