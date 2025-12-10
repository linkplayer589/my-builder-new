import { notFound } from "next/navigation"
import type { Order } from "@/db/schema"
import { getOrderById } from "@/db/server-actions/order-actions/db-get-order-by-id"

import OrderActionsTabs from "./_components/order-actions-tabs"
import { OrderDetails } from "./_components/order-details"
import Header from "@/components/layouts/Header"

interface OrderPageProps {
  params: Promise<{
    orderId: string
    resortName: string
    order: Order
  }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId, resortName } = await params
  const parsedOrderId = parseInt(orderId)

  if (isNaN(parsedOrderId)) {
    notFound()
  }

  try {
    const order = await getOrderById(parsedOrderId)

    if (!order) {
      notFound()
    }
    return (

      <div className="container mx-auto py-6">
         <Header
            breadcrumbItems={[
              { label: "Dashboard", isLink: false, href: "/dashboard" },
              { label: "Orders", isLink:false, href: "/orders" },
              { label: "Order #" + order?.id, isLink: false, href: "/orders" },
            ]}
          />
        <div className="mb-6">
          {/* Flex column by default, row on medium screens and up */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold">
              {resortName.charAt(0).toUpperCase() + resortName.slice(1)} - Order #
              {parsedOrderId}
            </h1>
            <OrderActionsTabs order={order} resortName={resortName} />
          </div>
        </div>
        <OrderDetails order={order} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching order:", error)
    notFound()
  }
}
