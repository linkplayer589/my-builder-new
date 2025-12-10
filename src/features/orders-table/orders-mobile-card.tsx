"use client"

import * as React from "react"
import { type Order } from "@/db/schema"
import { type Row } from "@tanstack/react-table"
import { format } from "date-fns"
import { type JoinedSession } from "@/features/sessions/session-actions/db-get-sessions"
import {
  Calendar,
  Hash,
  Mail,
  Phone,
  User,
  MapPin,
  ExternalLink,
  Package,
  Repeat,
  RotateCcw,
  Eye,
} from "lucide-react"
import { toast } from "sonner"

import { UniversalTableCard, CardField, CardSection, CardBadgeGroup } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClickAndCollectButton } from "@/features/order-collect/order-collect-components/order-collect-button"
import { MythDialog } from "./orders-table-features/orders-table-myth-dialog"
import { OrdersTablePriceDialog } from "./orders-table-features/orders-table-price-dialog"
import { OrdersTableSwapPassDialog } from "./orders-table-features/orders-table-swap-pass-dialog"
import { OrdersTableReturnLifepassDialog } from "./orders-table-features/orders-table-return-lifepass-dialog"
import { OrdersTableSessionsDialog } from "./orders-table-features/orders-table-sessions-dialog"
import { StripeDialog } from "./orders-table-features/orders-table-stripe-dialog"
import { type StripeInvoiceData } from "@/types/stripe-types"
import { dbGetOrderSessions } from "@/db/server-actions/order-actions/db-get-order-sessions"
// Swap handled directly inside dialog now
import { ordersTableReturnLifepassApi } from "./orders-table-actions/orders-table-return-lifepass-api/route"
import { getOrderStatusIcon, getPaymentStatusIcon } from "./orders-table-utils/get-status-icon"
import { getMythButtonStatus } from "./orders-table-utils/get-myth-button-status"
import { getSkidataButtonStatus } from "./orders-table-utils/get-skidata-button-status"

interface OrdersMobileCardProps {
  row: Row<Order>
}

/**
 * Beautiful mobile card view for Orders
 * Displays key order information in a clean, accessible format with full dialog support
 */
export function OrdersMobileCard({ row }: OrdersMobileCardProps) {
  const order = row.original

  // Dialog states
  const [showMythDialog, setShowMythDialog] = React.useState(false)
  const [showSwapPassDialog, setShowSwapPassDialog] = React.useState(false)
  const [showReturnLifepassDialog, setShowReturnLifepassDialog] = React.useState(false)
  const [showSessionsDialog, setShowSessionsDialog] = React.useState(false)
  const [showStripeDialog, setShowStripeDialog] = React.useState(false)
  const [sessions, setSessions] = React.useState<JoinedSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = React.useState(false)

  // Status icon and color
  const OrderStatusIcon = getOrderStatusIcon(order.orderStatus) as React.ComponentType<{
    className: string
  }>
  const PaymentStatusIcon = getPaymentStatusIcon(order.paymentStatus) as React.ComponentType<{
    className: string
  }>

  const getOrderStatusColor = (status: string) => {
    if (status.includes("complete") || status.includes("active")) return "default"
    if (status.includes("cancelled")) return "destructive"
    if (status.includes("awaiting") || status.includes("ordered")) return "secondary"
    return "outline"
  }

  const getPaymentStatusColor = (status: string) => {
    if (status.includes("fully-paid")) return "default"
    if (status.includes("failed") || status.includes("cancelled") || status.includes("expired")) return "destructive"
    if (status.includes("pending") || status.includes("processing")) return "secondary"
    return "outline"
  }

  // Format price
  const formatPrice = (price: number | string | undefined) => {
    if (!price) return "N/A"
    const numPrice = typeof price === "string" ? parseFloat(price) : price
    return `€${(numPrice / 100).toFixed(2)}`
  }

  // Get total amount
  const totalAmount = order.calculatedOrderPrice?.cumulatedPrice?.bestPrice?.amountGross || 0

  // Format date
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A"
    return format(new Date(date), "dd/MM/yyyy")
  }

  // Get start date
  const startDate = order.orderDetails?.startDate
    ? formatDate(new Date(order.orderDetails.startDate))
    : "N/A"

  // Count devices/passes
  const deviceCount = order.mythOrderSubmissionData?.devices?.length ||
                     order.orderDetails?.products?.length || 0

  // Device codes for swap/return dialogs
  const deviceCodes = order.mythOrderSubmissionData?.devices
    ?.flatMap((device) => device.deviceCode)
    .filter(Boolean) ?? []

  // Handlers
  const handleViewSessions = React.useCallback(async () => {
    if (!order.sessionIds?.length) return

    setIsLoadingSessions(true)
    try {
      const data = await dbGetOrderSessions(order.sessionIds)
      setSessions(data)
      setShowSessionsDialog(true)
    } catch (error) {
      console.error("Error loading sessions:", error)
      toast.error("Failed to load sessions")
    } finally {
      setIsLoadingSessions(false)
    }
  }, [order.sessionIds])

  // Swap handled in dialog (process buttons)

  const handleReturnLifepass = React.useCallback(async (deviceIds: string[]) => {
    try {
      const result = await ordersTableReturnLifepassApi(deviceIds)

      if (result.success) {
        toast.success(result.message ?? "Successfully returned lifepass(es)", {
          duration: 5000,
        })
        setShowReturnLifepassDialog(false)
      } else {
        toast.error(result.message ?? "Failed to return lifepass", {
          duration: 5000,
          description: "Please try again or contact support if the issue persists.",
        })
      }
    } catch (error) {
      console.error("Error returning lifepass:", error)
      toast.error("An unexpected error occurred", {
        duration: 5000,
        description: "Please try again or contact support if the issue persists.",
      })
    }
  }, [])

  return (
    <>
      <UniversalTableCard
        row={row}
        renderHeader={(_row) => (
        <div className="space-y-2">
          {/* Order ID and Status */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Hash className="size-4 text-muted-foreground" />
              <span className="font-semibold">Order #{order.id}</span>
            </div>
            <div className="flex flex-col gap-1">
              <Badge variant={getOrderStatusColor(order.orderStatus)} className="capitalize">
                <OrderStatusIcon className="mr-1 size-3" />
                {order.orderStatus.replace(/-/g, " ")}
              </Badge>
              <Badge variant={getPaymentStatusColor(order.paymentStatus)} className="capitalize text-xs">
                <PaymentStatusIcon className="mr-1 size-3" />
                {order.paymentStatus.replace(/-/g, " ")}
            </Badge>
            </div>
          </div>

          {/* Test Order Badge */}
          {order.testOrder && (
            <Badge variant="destructive" className="text-xs">
              Test Order
            </Badge>
          )}
        </div>
      )}
      renderSummary={(_row) => (
        <div className="space-y-2">
          {/* Client Info */}
          {order.clientDetails && (
            <div className="flex items-center gap-2 text-sm">
              <User className="size-3.5" />
              <span>{order.clientDetails.name || "N/A"}</span>
            </div>
          )}

          {/* Date and Amount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-3.5" />
              <span>Start: {startDate}</span>
            </div>
            {order.calculatedOrderPrice ? (
              <OrdersTablePriceDialog priceObject={order.calculatedOrderPrice} />
            ) : (
              <span className="font-semibold text-primary">
                {formatPrice(totalAmount)}
              </span>
            )}
          </div>

          {/* Device Count */}
          {deviceCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="size-3.5" />
              <span>{deviceCount} {deviceCount === 1 ? "Pass" : "Passes"}</span>
            </div>
          )}
        </div>
      )}
      renderDetails={(_row) => (
        <div className="space-y-4">
          {/* Client Details Section */}
          {order.clientDetails && (
            <CardSection title="Client Information">
              {order.clientDetails.email && (
                <CardField
                  label="Email"
                  value={
                    <div className="flex items-center gap-1 text-xs">
                      <Mail className="size-3" />
                      <span className="truncate">{order.clientDetails.email}</span>
                    </div>
                  }
                />
              )}
              {order.clientDetails.mobile && (
                <CardField
                  label="Phone"
                  value={
                    <div className="flex items-center gap-1 text-xs">
                      <Phone className="size-3" />
                      <span>{order.clientDetails.mobile}</span>
                    </div>
                  }
                />
              )}
            </CardSection>
          )}

          {/* Order Details Section */}
          <CardSection title="Order Details">
            <CardField label="Sales Channel" value={order.salesChannel} />
            <CardField label="Created" value={formatDate(order.createdAt)} />
            {order.otp && <CardField label="OTP" value={order.otp} />}
          </CardSection>

          {/* Payment Status Section */}
          {(order.stripePaymentIntentIds?.[0] || order.skidataOrderSubmissionData || order.mythOrderSubmissionData) && (
            <CardSection title="Integration Status">
              <div className="space-y-2">
                <CardBadgeGroup
                  badges={[
                    order.stripePaymentIntentIds?.[0] && { label: "Stripe", variant: "default" as const },
                    order.skidataOrderSubmissionData && { label: "Skidata", variant: "secondary" as const },
                    order.mythOrderSubmissionData && { label: "Myth", variant: "secondary" as const },
                  ].filter(Boolean) as Array<{ label: string; variant: "default" | "secondary" }>}
                />
              </div>
            </CardSection>
          )}
        </div>
      )}
      renderActions={() => (
        <div className="flex w-full flex-col gap-2">
          {/* Row 1: Primary Actions */}
          <div className="flex gap-2">
            {/* Click & Collect Button (if applicable) */}
            {order.salesChannel === "click-and-collect" && order.calculatedOrderPrice && (
              <div className="flex-1">
                <ClickAndCollectButton
                  orderId={order.id}
                  calculatedOrderPrice={order.calculatedOrderPrice}
                  halfWidth={false}
                  isCollected={order.orderStatus === 'order-active' ||
                    order.orderStatus === 'order-complete' ||
                    Boolean(deviceCodes.length) ||
                    Boolean(order.skidataOrderSubmissionData)}
                />
              </div>
            )}

            {/* View Myth Passes (if applicable) */}
            {order.mythOrderSubmissionData && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowMythDialog(true)}
              >
                <Package className="mr-1 size-3.5" />
                Passes
              </Button>
            )}
          </div>

          {/* Row 2: Pass Management (only if devices exist) */}
          {deviceCodes.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowSwapPassDialog(true)}
              >
                <Repeat className="mr-1 size-3.5" />
                Swap Pass
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowReturnLifepassDialog(true)}
              >
                <RotateCcw className="mr-1 size-3.5" />
                Return
              </Button>
            </div>
          )}

          {/* Row 3: Info & Details */}
          <div className="flex gap-2">
            {/* View Sessions */}
            {order.sessionIds && order.sessionIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => void handleViewSessions()}
                disabled={isLoadingSessions}
              >
                <Eye className="mr-1 size-3.5" />
                {isLoadingSessions ? "Loading..." : "Sessions"}
              </Button>
            )}

            {/* Stripe Payment Details */}
            {(order.stripePaymentIntentIds?.length || order.stripeInvoiceId) && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowStripeDialog(true)}
              >
                <Package className="mr-1 size-3.5" />
                Payments
              </Button>
            )}
          </div>

          {/* Row 4: External Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(`/admin/orders/${order.id}`, "_blank")}
            >
              <ExternalLink className="mr-1 size-3.5" />
              View Full Order Details
            </Button>
          </div>
        </div>
      )}
      />

      {/* Render all dialogs outside the card */}
      <MobileOrderDialogs
        order={order}
        showMythDialog={showMythDialog}
        setShowMythDialog={setShowMythDialog}
        showSwapPassDialog={showSwapPassDialog}
        setShowSwapPassDialog={setShowSwapPassDialog}
        showReturnLifepassDialog={showReturnLifepassDialog}
        setShowReturnLifepassDialog={setShowReturnLifepassDialog}
        showSessionsDialog={showSessionsDialog}
        setShowSessionsDialog={setShowSessionsDialog}
        showStripeDialog={showStripeDialog}
        setShowStripeDialog={setShowStripeDialog}
        sessions={sessions}
        isLoadingSessions={isLoadingSessions}
        deviceCodes={deviceCodes}
        handleReturnLifepass={handleReturnLifepass}
      />
    </>
  )
}

function MobileOrderDialogs({
  order,
  showMythDialog,
  setShowMythDialog,
  showSwapPassDialog,
  setShowSwapPassDialog,
  showReturnLifepassDialog,
  setShowReturnLifepassDialog,
  showSessionsDialog,
  setShowSessionsDialog,
  showStripeDialog,
  setShowStripeDialog,
  sessions,
  isLoadingSessions,
  deviceCodes,
  handleReturnLifepass,
}: {
  order: Order
  showMythDialog: boolean
  setShowMythDialog: (show: boolean) => void
  showSwapPassDialog: boolean
  setShowSwapPassDialog: (show: boolean) => void
  showReturnLifepassDialog: boolean
  setShowReturnLifepassDialog: (show: boolean) => void
  showSessionsDialog: boolean
  setShowSessionsDialog: (show: boolean) => void
  showStripeDialog: boolean
  setShowStripeDialog: (show: boolean) => void
  sessions: JoinedSession[]
  isLoadingSessions: boolean
  deviceCodes: string[]
  handleReturnLifepass: (deviceIds: string[]) => Promise<void>
}) {
  return (
    <>
      {/* Myth Dialog - Now with controlled open state */}
      {order.mythOrderSubmissionData && (
        <MythDialog
          mythOrderSubmissionData={order.mythOrderSubmissionData}
          open={showMythDialog}
          onOpenChange={setShowMythDialog}
          buttonStatus={getMythButtonStatus(order)}
        />
      )}

      {/* Stripe Dialog - Now with controlled open state */}
      {(order.stripePaymentIntentIds?.length || order.stripeInvoiceId) && (
        <StripeDialog
          orderId={order.id}
          stripePaymentIntentIds={order.stripePaymentIntentIds ?? undefined}
          stripeInvoiceId={order.stripeInvoiceId ?? undefined}
          stripeInvoiceDatas={(order.stripeInvoiceDatas as unknown as StripeInvoiceData[]) ?? undefined}
          stripeTransactionDatas={order.stripeTransactionDatas ?? undefined}
          stripePaymentIntentId={order.stripePaymentIntentIds?.[0]}
          stripeTransactionData={order.stripeTransactionDatas?.[0] || null}
          open={showStripeDialog}
          onOpenChange={setShowStripeDialog}
        />
      )}

      {/* TODO: Skidata and Price dialogs need to be updated to support controlled open state */}

      {/* Swap Pass Dialog */}
      <OrdersTableSwapPassDialog
        open={showSwapPassDialog}
        onOpenChange={setShowSwapPassDialog}
        orderId={order.id}
        resortId={order.resortId}
        deviceCodes={deviceCodes}
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
        defaultOldPassId={deviceCodes.length === 1 ? deviceCodes[0] : undefined}
      />

      {/* Return Lifepass Dialog */}
      <OrdersTableReturnLifepassDialog
        open={showReturnLifepassDialog}
        onOpenChange={setShowReturnLifepassDialog}
        onReturn={handleReturnLifepass}
        deviceCodes={deviceCodes}
      />

      {/* Sessions Dialog */}
      <OrdersTableSessionsDialog
        open={showSessionsDialog}
        onOpenChange={setShowSessionsDialog}
        sessions={sessions}
        isLoading={isLoadingSessions}
      />
    </>
  )
}
