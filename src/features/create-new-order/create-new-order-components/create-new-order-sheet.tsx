import React from "react"
import { useResort } from "@/features/resorts"

import LifePassLogoBlue from "@/components/branding-and-logos/lifepass-logo-blue"

import { type CalculatedOrderPriceReturn } from "../create-new-order-actions/calculate-order-price/types"
import { type Catalog } from "../create-new-order-actions/get-products/types"
import OrderForm from "./create-new-order-page-1-order-form"
import { OrderPayment } from "./create-new-order-page-3-order-payment"
import OrderPreview from "./create-new-order-page-2-order-preview"
import { OrderSubmission } from "./create-new-order-page-4-order-submission"

export type OrderDataType = {
  orderId?: number
  name: string
  telephone: string
  email: string
  languageCode: "en" | "it" | "fr" | "de"
  resortId: number
  startDate: Date
  devices: {
    deviceId: string
    productId: string
    consumerCategoryId: string
    insurance: boolean
  }[]
  skidataOrderSubmissionData?: {
    orderId: string
    confirmationNumber: string
    asynchronousExecutionToken: {
      executionId: string
    }
  }
  mythOrderSubmissionData?: {
    id: string
    groupId: string
    leadBookerName: string
    orderId: string
    authCode: string
    from: string
    to: string
    status: string
    contactDetails: {
      id: string
      telephone: string
      email: string
      contactName: string
      contactPreferences: string[]
    }
    devices: unknown[]
    registrationUrlBase64QrCode: string
    registrationUrl: string
  }
}

const MAX_STEPS = 4

export function CreateNewOrderSheet() {
  const { resortId } = useResort()

  // Multipage Page Setting Logic
  const [currentPage, setCurrentPage] = React.useState(0)
  const nextPage = React.useCallback(() => {
    setCurrentPage((prev) => (prev < MAX_STEPS - 1 ? prev + 1 : prev))
  }, [])
  const prevPage = React.useCallback(() => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev))
  }, [])

  const [catalog, setCatalog] = React.useState<Catalog | undefined>()

  // Flow States
  const [orderData, setOrderData] = React.useState<OrderDataType | undefined>()
  const [calculatedOrderPrice, setCalculatedOrderPrice] =
    React.useState<CalculatedOrderPriceReturn | null>(null)
  const [orderId, setOrderId] = React.useState<number | undefined>()
  const [bypassPayment, setBypassPayment] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (orderData) {
      console.log("Order Data:", orderData)
    }
  }, [orderData])

  // Multipage Pages
  const pages: React.ReactElement[] = React.useMemo(
    () => [
      <OrderForm
        key={0}
        orderData={orderData}
        setCatalog={setCatalog}
        setOrderData={setOrderData}
        nextPage={nextPage}
      />,
      <OrderPreview
        key={1}
        orderData={orderData}
        calculatedOrderPrice={calculatedOrderPrice}
        setCalculatedOrderPrice={setCalculatedOrderPrice}
        catalog={catalog}
        nextPage={nextPage}
      />,
      <OrderPayment
        key={2}
        calculatedOrderPrice={calculatedOrderPrice}
        orderId={orderId}
        setOrderId={setOrderId}
        orderData={orderData}
        catalog={catalog}
        nextPage={nextPage}
        prevPage={prevPage}
        bypassPayment={bypassPayment}
        setBypassPayment={setBypassPayment}
      />,
      <OrderSubmission
        key={3}
        orderData={orderData}
        orderId={orderId}
        setOrderId={setOrderId}
        resortId={resortId}
        bypassPayment={bypassPayment}
      />,
    ],

    [
      orderData,
      nextPage,
      calculatedOrderPrice,
      catalog,
      prevPage,
      orderId,
      setOrderId,
      bypassPayment,
      setBypassPayment,
      resortId,
    ]
  )

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <React.Suspense
        fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <LifePassLogoBlue className="size-8 animate-pulse sm:size-12" />
          </div>
        }
      >
        {pages[currentPage]}
      </React.Suspense>
    </div>
  )
}
