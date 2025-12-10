/**
 * Format a date value for table display
 * 
 * @description
 * Formats date values consistently across all tables in YYYY-MM-DD HH:MM format.
 * Handles both string and Date inputs and gracefully handles invalid dates.
 * 
 * @param value - Date value as string or Date object
 * @returns Formatted date string or "Invalid Date" for invalid inputs
 * 
 * @example
 * ```tsx
 * // In a column cell renderer
 * cell: ({ cell }) => formatTableDate(cell.getValue() as string | Date)
 * 
 * // Output: "2025-10-02 14:30"
 * ```
 */
export function formatTableDate(value: string | Date | null | undefined): string {
  if (!value) return 'N/A'
  
  const date = typeof value === 'string' ? new Date(value) : value
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }
  
  const datePart = date.toISOString().split('T')[0]
  const timePart = date.toISOString().split('T')[1]?.slice(0, 5)
  
  return `${datePart} ${timePart}`
}

