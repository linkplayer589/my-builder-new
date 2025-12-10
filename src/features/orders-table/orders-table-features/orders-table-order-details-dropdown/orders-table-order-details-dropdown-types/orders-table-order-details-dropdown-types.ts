import { type Order } from "@/db/schema"

/**
 * Props for the OrdersTableOrderDetailsDropdown component
 *
 * @property order - The complete order object with all related data
 * @property isExpanded - Whether the details are currently expanded
 * @property onToggle - Callback to toggle expansion state
 *
 * Note: Sessions are now fetched internally using the order's sessionIds
 * rather than being passed as props.
 */
export type TOrdersTableOrderDetailsDropdownProps = {
  order: Order
  isExpanded: boolean
  onToggle: () => void
}

/**
 * Tab options for the order details dropdown view
 */
export type TOrderDetailsDropdownTab = "overview" | "myth" | "skidata" | "stripe" | "sessions"
