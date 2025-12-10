"use client"

import { type OrderPrice } from "@/db/types/skidata-calculated-order-price"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { ProductDetailsRenderer } from "../../../orders-table-utils/orders-table-product-details-renderer"

/**
 * Props for OrdersTablePriceDialog component
 */
interface TOrdersTablePriceDialogProps {
  priceObject: OrderPrice
}

/**
 * Dialog component for displaying detailed order price breakdown
 * 
 * @param props - Component props
 * @param props.priceObject - Order price object with item breakdowns
 * @returns Dialog component with price details
 * 
 * @description
 * Displays a comprehensive breakdown of order pricing including:
 * - Individual product prices (skipass, lifepass rental, insurance)
 * - Net amounts, VAT, and gross amounts
 * - Tax details per item
 * - Order total with cumulated tax
 * 
 * Used in orders table to show full price details when clicking the price button.
 * 
 * @example
 * <OrdersTablePriceDialog priceObject={order.calculatedOrderPrice} />
 */
export function OrdersTablePriceDialog({ priceObject }: TOrdersTablePriceDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-sm">
          {priceObject.cumulatedPrice.bestPrice.amountGross.toFixed(2)}{" "}
          {priceObject.cumulatedPrice.bestPrice.currencyCode}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-scroll sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            order for {priceObject.orderItemPrices.length} items
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-4">
            {/* Products Breakdown */}
            <div className="space-y-4">
              {priceObject.orderItemPrices.map((item, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-semibold">
                    Product:{" "}
                    <ProductDetailsRenderer
                      productId={item.productId}
                      consumerCategoryId={item.consumerCategoryId}
                      hasInsurance={
                        (item.insurancePrice?.basePrice.amountGross ?? 0) > 0
                      }
                    />
                  </h4>

                  {/* SkiPass */}
                  <div className="ml-4 space-y-1 border-t pt-1 text-sm">
                    <h5 className="font-semibold">SkiPass</h5>
                    <div className="flex justify-between">
                      <span>Net Amount</span>
                      <span>
                        {item.productPrice?.bestPrice.amountNet.toFixed(2)}{" "}
                        {item.productPrice?.bestPrice.currencyCode}
                      </span>
                    </div>

                    {item.productPrice?.bestPrice.taxDetails && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>
                          VAT (
                          {item.productPrice.bestPrice.taxDetails.taxValue *
                            100}
                          %)
                        </span>
                        <span>
                          {item.productPrice.bestPrice.taxDetails.taxAmount.toFixed(
                            2
                          )}{" "}
                          {item.productPrice.bestPrice.currencyCode}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between font-medium">
                      <span>Gross Amount</span>
                      <span>
                        {item.productPrice?.bestPrice.amountGross.toFixed(2)}{" "}
                        {item.productPrice?.bestPrice.currencyCode}
                      </span>
                    </div>
                  </div>

                  {/* LifePass Rental */}
                  {item.lifepassRentalPrice && (
                    <div className="ml-4 space-y-1 border-t pt-1 text-sm">
                      <h5 className="font-semibold">LifePass Rental</h5>
                      <div className="flex justify-between">
                        <span>Net Amount</span>
                        <span>
                          {item.lifepassRentalPrice.bestPrice.amountNet.toFixed(
                            2
                          )}{" "}
                          {item.lifepassRentalPrice.bestPrice.currencyCode}
                        </span>
                      </div>

                      {item.lifepassRentalPrice.bestPrice.taxDetails && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>
                            VAT (
                            {item.lifepassRentalPrice.bestPrice.taxDetails
                              .taxValue * 100}
                            %)
                          </span>
                          <span>
                            {item.lifepassRentalPrice.bestPrice.taxDetails.taxAmount.toFixed(
                              2
                            )}{" "}
                            {item.lifepassRentalPrice.bestPrice.currencyCode}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between font-medium">
                        <span>Gross Amount</span>
                        <span>
                          {item.lifepassRentalPrice.bestPrice.amountGross.toFixed(
                            2
                          )}{" "}
                          {item.lifepassRentalPrice.bestPrice.currencyCode}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Insurance */}
                  {item.insurancePrice && (
                    <div className="ml-4 space-y-1 border-t pt-1 text-sm">
                      <h5 className="font-semibold">Insurance</h5>
                      <div className="flex justify-between">
                        <span>Net Amount</span>
                        <span>
                          {item.insurancePrice.bestPrice.amountNet.toFixed(2)}{" "}
                          {item.insurancePrice.bestPrice.currencyCode}
                        </span>
                      </div>

                      {item.insurancePrice.bestPrice.taxDetails && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>
                            VAT (
                            {item.insurancePrice.bestPrice.taxDetails.taxValue *
                              100}
                            %)
                          </span>
                          <span>
                            {item.insurancePrice.bestPrice.taxDetails.taxAmount.toFixed(
                              2
                            )}{" "}
                            {item.insurancePrice.bestPrice.currencyCode}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between font-medium">
                        <span>Gross Amount</span>
                        <span>
                          {item.insurancePrice.bestPrice.amountGross.toFixed(2)}{" "}
                          {item.insurancePrice.bestPrice.currencyCode}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Order Total Section */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Order Subtotal (Net)</span>
                <span>
                  {priceObject.cumulatedPrice.bestPrice.amountNet.toFixed(2)}{" "}
                  {priceObject.cumulatedPrice.bestPrice.currencyCode}
                </span>
              </div>

              {/* Tax Details */}
              {priceObject.cumulatedPrice.bestPrice.taxDetails && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    VAT (
                    {priceObject.cumulatedPrice.bestPrice.taxDetails.taxValue *
                      100}
                    %)
                  </span>
                  <span>
                    {priceObject.cumulatedPrice.bestPrice.taxDetails.taxAmount.toFixed(
                      2
                    )}{" "}
                    {priceObject.cumulatedPrice.bestPrice.currencyCode}
                  </span>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Order Total (Gross)</span>
                <span>
                  {priceObject.cumulatedPrice.bestPrice.amountGross.toFixed(2)}{" "}
                  {priceObject.cumulatedPrice.bestPrice.currencyCode}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

