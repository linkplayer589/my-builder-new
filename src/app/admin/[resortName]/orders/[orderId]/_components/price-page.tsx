"use client"

import { useResort } from "@/features/resorts"
import type { OrderPrice } from "@/db/types/skidata-calculated-order-price"

// Define the interface for the price object
interface PriceDialogProps {
    priceObject: OrderPrice
}

function ProductDetails({
    productId,
    consumerCategoryId,
    hasInsurance,
}: {
    productId: string
    consumerCategoryId: string
    hasInsurance: boolean
}) {
    const { getProductName, getConsumerCategoryName, products, categories } =
        useResort()

    // Return early if we don't have the data yet
    if (!products.length || !categories.length) {
        return <span className="text-muted-foreground">Loading data...</span>
    }

    // Get the names
    const productName = getProductName(productId)
    const categoryName = getConsumerCategoryName(consumerCategoryId)

    // Return a more robust display
    return (
        <span className="whitespace-nowrap">
            {productName?.en || `Product ${productId}`} (
            {categoryName?.en || `Category ${consumerCategoryId}`})
            {hasInsurance ? " (Insured)" : " (Not Insured)"}
        </span>
    )
}

export function PricePage({ priceObject }: PriceDialogProps) {
    return (
        <div className="container mx-auto">
            <div className="space-y-4">
                {/* Products Breakdown */}
                <div className="space-y-4">
                    {priceObject.orderItemPrices.map((item, index) => (
                        <div key={index} className="space-y-2">
                            <h4 className="font-semibold">
                                Product:{" "}
                                <ProductDetails
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
                                            {item.productPrice.bestPrice.taxDetails.taxValue * 100}
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
                                            {item.lifepassRentalPrice.bestPrice.amountNet.toFixed(2)}{" "}
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
    )
}
