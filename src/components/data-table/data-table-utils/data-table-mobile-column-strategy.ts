/**
 * Standard mobile column indices
 * 
 * @description
 * Defines which columns to show on mobile:
 * - First 2 columns (ID and primary field)
 * - Second-to-last column (usually a date field)
 * 
 * This provides a consistent mobile experience across all tables.
 */
export const MOBILE_COLUMN_STRATEGY = {
  /**
   * Filter function for mobile columns
   * Shows first 2 columns and second-to-last column
   */
  filter: (columns: unknown[], index: number, totalLength: number): boolean => {
    return index < 2 || index === totalLength - 2
  },
  
  /**
   * Get indices of columns to show on mobile
   */
  getIndices: (totalColumns: number): number[] => {
    return [0, 1, totalColumns - 2]
  },
}

