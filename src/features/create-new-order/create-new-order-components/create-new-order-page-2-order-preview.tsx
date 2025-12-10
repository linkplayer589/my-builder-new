import React from "react"
import type { ZodIssue } from "zod"

import { _toLocalDateString } from "@/lib/date-functions"
import { Button } from "@/components/ui/button"
import LifePassLogoBlue from "@/components/branding-and-logos/lifepass-logo-blue"
import { TerminalSelector } from "@/components/terminal-selector"

import type { OrderDataType } from "./create-new-order-sheet"
import { calculateOrderPrice } from "../create-new-order-actions/calculate-order-price/handler"
import { type CalculatedOrderPriceReturn } from "../create-new-order-actions/calculate-order-price/types"
import type { Catalog, Product } from "../create-new-order-actions/get-products/types"

type Props = {
  orderData: OrderDataType | undefined
  catalog: Catalog | undefined
  calculatedOrderPrice: CalculatedOrderPriceReturn | null
  setCalculatedOrderPrice: React.Dispatch<CalculatedOrderPriceReturn>
  nextPage: () => void
}

const CURRENCY_SYMBOL = "€"

export default function OrderPreview({
  orderData,
  catalog,
  calculatedOrderPrice,
  setCalculatedOrderPrice,
  nextPage,
}: Props) {
  const [validationError, setValidationError] = React.useState<
    ZodIssue[] | null
  >(null)

  React.useEffect(() => {
    if (!orderData) {
      return
    }

    // Calculate Order Price Function
    const calculatePrice = async () => {
      const calculateOrderPricePayload = {
        resortId: orderData.resortId,
        startDate: _toLocalDateString(orderData.startDate),
        products: orderData.devices.map((device) => ({
          productId: device.productId,
          consumerCategoryId: device.consumerCategoryId,
          insurance: device.insurance,
        })),
      }

      // Calculate Order Price API Call
      try {
        const result = await calculateOrderPrice(calculateOrderPricePayload)

        if (result.success) {
          setCalculatedOrderPrice(result.data)
          setValidationError(null)
        } else if (result.errorType === "validation") {
          console.error("Validation errors occurred:", result.error)
          setValidationError(result.error)
        } else {
          console.error("Error:", result.error)
        }
      } catch (err) {
        console.error("Unexpected error calculating order price:", err)
        setValidationError(null)
      }
    }

    void calculatePrice()
  }, [orderData, setCalculatedOrderPrice])

  if (!calculatedOrderPrice) {
    return (
      <div className="flex h-full items-center justify-center">
        <LifePassLogoBlue className="animate-pulse" />
      </div>
    )
  }

  if (!catalog) {
    return (
      <div className="flex h-full items-center justify-center">
        <LifePassLogoBlue className="animate-pulse" />
      </div>
    )
  }

  if (validationError) {
    return (
      <div>
        <h1>Validation Errors</h1>
        <ul>
          {validationError.map((error, index) => (
            <li key={index}>
              Error in {error.path.join(".")}: {error.message}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (!calculatedOrderPrice) {
    return <div>No Price Calculation available</div>
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Terminal Selector */}
      <div className="w-full space-y-2">
        <h3 className="text-sm font-semibold text-foreground sm:text-base">Select Terminal</h3>
        <p className="text-xs text-muted-foreground sm:text-sm">Choose the terminal for this order</p>
        <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
          <TerminalSelector />
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground sm:text-base">Order Summary</h3>
        <p className="text-xs text-muted-foreground sm:text-sm">Review your order details</p>
      </div>

      {calculatedOrderPrice.orderItemPrices.map((lineItem, index) => (
        <div
          key={index}
          className="flex flex-col rounded-md border border-gray-200 bg-white p-5"
        >
          <h1 className="text-center text-[#233772]">
            {
              catalog.products
                .find((product: Product) =>
                  product.priceCategories.some(
                    (category) =>
                      category.consumerCategoryId ===
                      lineItem.consumerCategoryId
                  )
                )
                ?.priceCategories.find(
                  (category) =>
                    category.consumerCategoryId === lineItem.consumerCategoryId
                )?.consumerCategoryData.name?.en
            }{" "}
            Ski Pass {index + 1}
          </h1>

          <div className="flex items-center justify-between">
            <h1 className="text-sm text-[#626779] md:text-base">
              {
                catalog.products.find(
                  (product) => product.id === lineItem.productId
                )?.validityCategory.value
              }{" "}
              {(catalog.products.find(
                (product) => product.id === lineItem.productId
              )?.validityCategory.value ?? 0) > 1
                ? "days"
                : "day"}{" "}
              ({CURRENCY_SYMBOL}
              {(
                (lineItem.productPrice?.basePrice.amountGross ?? 0) /
                calculatedOrderPrice.daysValidity
              ).toFixed(2)}
              /day)
            </h1>
            <h1 className="text-sm font-semibold text-[#233772] md:text-base">
              {CURRENCY_SYMBOL}
              {lineItem.productPrice?.basePrice.amountGross.toFixed(2)}
            </h1>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-sm text-[#626779] md:text-base">
              + LifePass rental ({CURRENCY_SYMBOL}
              {lineItem.lifepassRentalPrice?.basePrice.amountGross.toFixed(2)})
            </h1>
            <h1 className="text-sm font-semibold text-[#233772] md:text-base">
              {CURRENCY_SYMBOL}
              {lineItem.lifepassRentalPrice?.basePrice.amountGross.toFixed(2)}
            </h1>
          </div>

          {lineItem.insurancePrice && (
            <div className="flex items-center justify-between">
              <h1 className="text-sm text-[#626779] md:text-base">
                + Insurance ({CURRENCY_SYMBOL}
                {lineItem.insurancePrice?.basePrice.amountGross.toFixed(2)})
              </h1>
              <h1 className="text-sm font-semibold text-[#233772] md:text-base">
                {CURRENCY_SYMBOL}
                {lineItem.insurancePrice?.basePrice.amountGross.toFixed(2)}
              </h1>
            </div>
          )}

          <div className="flex items-center justify-between font-bold">
            <h1 className="text-sm text-[#626779] md:text-base">TOTAL:</h1>
            <h1 className="text-sm text-[#233772] md:text-base">
              {CURRENCY_SYMBOL}
              {(
                (lineItem.productPrice?.basePrice.amountGross ?? 0) +
                (lineItem.lifepassRentalPrice?.basePrice.amountGross ?? 0) +
                (lineItem.insurancePrice?.basePrice.amountGross || 0)
              ).toFixed(2)}
            </h1>
          </div>
        </div>
      ))}
      <div className="my-3 h-px bg-gray-200" />
      <div className="flex w-full items-center justify-between px-1 font-bold">
        <h1 className="text-base text-[#233772] sm:text-lg">Total:</h1>
        <h1 className="text-base text-[#E7328A] sm:text-lg">
          {calculatedOrderPrice &&
            `${CURRENCY_SYMBOL}${calculatedOrderPrice.cumulatedPrice.basePrice.amountGross.toFixed(
              2
            )}`}
        </h1>
      </div>

      <div className="pt-2">
        <Button
          className="h-10 w-full rounded-lg bg-[#e7328a] text-sm font-semibold text-white shadow-sm hover:bg-[#e7328a]/90 sm:h-11 sm:text-base"
          onClick={nextPage}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  )
}
