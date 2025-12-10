"use client"

import { type Order } from "@/db/schema"
import { format } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MythPage } from "@/app/admin/[resortName]/orders/[orderId]/_components/myth-page"
import { useCallback, useEffect, useState } from "react"
import type { JoinedSession } from "@/features/sessions/session-actions/db-get-sessions"
import { dbGetOrderSessions } from "@/db/server-actions/order-actions/db-get-order-sessions"
import { ClickAndCollectButton } from "@/features/order-collect/order-collect-components/order-collect-button"
import { SkidataPage } from "./skidata-page"
import { StripePage } from "./stripe-page"
import { PricePage } from "./price-page"
import { OrderSessionsPage } from "./order-sessions-page"

interface OrderDetailsProps {
  order: Order
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [sessions, setSessions] = useState<JoinedSession[]>([])
  const handleViewSessions = useCallback(async () => {
    if (!order.sessionIds?.length) return

    setIsLoadingSessions(true)
    try {
      const data = await dbGetOrderSessions(order.sessionIds)
      setSessions(data)

    } catch (error) {
      console.error("Error loading sessions:", error)
    } finally {
      setIsLoadingSessions(false)
    }
  }, [order.sessionIds])
  useEffect(() => {
    handleViewSessions().catch((error) => {
      console.error("Failed to load sessions:", error)
    })
  }, [handleViewSessions])

  if (!order) {
    return null
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Order ID
              </p>
              <p className="text-sm">{order.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <p className="text-sm capitalize">{order.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-sm">
                {order.createdAt
                  ? format(new Date(order.createdAt), "PPP")
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Sales Channel
              </p>
              {order.salesChannel === 'click-and-collect' ? (
                <ClickAndCollectButton
                  orderId={order.id}
                  calculatedOrderPrice={order.calculatedOrderPrice}
                  halfWidth={true} // Adding the width class here
                  isCollected={order.status === 'order-complete' ||
                    order.status === 'order-active' ||
                    Boolean(order?.mythOrderSubmissionData?.devices?.length) ||
                    Boolean(order?.skidataOrderSubmissionData)}
                />
              ) : (
                <p className="text-sm">{order.salesChannel}</p>
              )}

            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">OTP</p>
              <p className="text-sm">{order.otp}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Test Order
              </p>
              <p className="text-sm">{order.testOrder ? "Yes" : "No"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {order.clientDetails && (
      <Card>
  <CardHeader>
    <CardTitle>Customer Information</CardTitle>
  </CardHeader>
  <CardContent className="grid gap-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Name</p>
        <p className="break-words text-sm">{order.clientDetails.name || "N/A"}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Email</p>
        <p className="break-words text-sm">{order.clientDetails.email || "N/A"}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Phone</p>
        <p className="break-words text-sm">{order.clientDetails.mobile || "N/A"}</p>
      </div>
    </div>
  </CardContent>
</Card>

      )}

      {order.orderDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Start Date
                </p>
                <p className="text-sm">
                  {order.orderDetails.startDate
                    ? format(new Date(order.orderDetails.startDate), "PPP")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  End Date
                </p>
                <p className="text-sm">
                  {order.orderDetails.endDate
                    ? format(new Date(order.orderDetails.endDate), "PPP")
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Myth Order Details</CardTitle>
        </CardHeader>
        {order.mythOrderSubmissionData ? (
          <MythPage
            mythOrderSubmissionData={order?.mythOrderSubmissionData}
          />
        ) : (
          <div className="flex items-center justify-center text-gray-500">
            <p>Not Added.</p>
          </div>

        )}
        <div className="h-4" />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Skidata Order Details</CardTitle>
        </CardHeader>
        {order?.skidataOrderSubmissionData ? (
          <SkidataPage
            orderId={order?.id}
            resortId={order?.resortId}
            skidataOrderSubmissionData={order?.skidataOrderSubmissionData}
          />
        ) : (
          <div className="flex items-center justify-center text-gray-500">
            <p>Not Submitted.</p>
          </div>
        )}
        <div className="h-4" />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>

        {order?.calculatedOrderPrice ? (
          <PricePage
            priceObject={order.calculatedOrderPrice}
          />
        ) : (
          <div className="flex items-center justify-center text-gray-500">
            <p>No record found.</p>
          </div>
        )}
        <div className="h-4" />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Stripe Details</CardTitle>
        </CardHeader>

        {order?.stripePaymentIntentIds?.[0] ? (
          <StripePage
            orderId={order.id}
            stripePaymentIntentId={order.stripePaymentIntentIds[0]}
            stripeTransactionData={order.stripeTransactionDatas?.[0] || null}
          />
        ) : (
          <div className="flex items-center justify-center text-gray-500">
            <p>No stripe record found.</p>
          </div>
        )}
        <div className="h-4" />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Sessions</CardTitle>
        </CardHeader>


        <OrderSessionsPage
          isLoading={isLoadingSessions}
          sessions={sessions}

        />
        <div className="h-4" />
      </Card>
    </div>
  )
}
