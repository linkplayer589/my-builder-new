"use client"

import { useResort } from "@/features/resorts"

/**
 * Props for ProductDetailsRenderer component
 */
interface TProductDetailsRendererProps {
  productId: string
  consumerCategoryId: string
  hasInsurance: boolean
}

/**
 * Renders product details with name, category, and insurance status
 * 
 * @param props - Component props
 * @param props.productId - Product ID to look up
 * @param props.consumerCategoryId - Consumer category ID to look up
 * @param props.hasInsurance - Whether the product has insurance
 * @returns Formatted product details string
 * 
 * @description
 * Fetches product and category names from resort context and displays them
 * along with insurance status. Shows loading state while data is being fetched.
 * Falls back to IDs if names cannot be found.
 * 
 * Used in price dialogs to show human-readable product information.
 * 
 * @example
 * <ProductDetailsRenderer 
 *   productId="SKI-PASS-123"
 *   consumerCategoryId="ADULT"
 *   hasInsurance={true}
 * />
 * // Renders: "Ski Pass (Adult) (Insured)"
 */
export function ProductDetailsRenderer({
  productId,
  consumerCategoryId,
  hasInsurance,
}: TProductDetailsRendererProps) {
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

