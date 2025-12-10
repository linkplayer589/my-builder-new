/**
 * Truncate text with ellipsis
 * 
 * @description
 * Truncates long text values for display in table cells
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation (default: 50)
 * @returns Truncated text with ellipsis if needed
 * 
 * @example
 * ```tsx
 * cell: ({ cell }) => truncateText(cell.getValue() as string, 30)
 * ```
 */
export function truncateText(text: string | null | undefined, maxLength = 50): string {
  if (!text) return 'N/A'
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

