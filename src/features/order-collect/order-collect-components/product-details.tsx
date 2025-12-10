"use client"

import { useResort } from "@/features/resorts"

interface ProductDetailsProps {
  productId: string
  consumerCategoryId: string
  hasInsurance: boolean
}

export function ProductDetails({
  productId,
  consumerCategoryId,
  hasInsurance,
}: ProductDetailsProps) {
  const { getProductName, getConsumerCategoryName } = useResort()

  const productName = getProductName(productId)
  const categoryName = getConsumerCategoryName(consumerCategoryId)

  return (
    <div className="text-sm">
      <span className="font-medium">{productName.en ?? productId}</span>
      <span className="text-muted-foreground">
        {" "}
        • {categoryName.en ?? consumerCategoryId}
        {hasInsurance ? " • Insured" : " • Uninsured"}
      </span>
    </div>
  )
}
