import type { ColumnType, FilterOperator } from "@/types/index"

/**
 * Determine the default filter operator for a given column type.
 *
 * This function returns the most appropriate default filter operator based on the
 * column's data type. For text columns, it returns 'iLike' (case-insensitive like),
 * while for all other types, it returns 'eq' (equality).
 *
 * @param columnType - The type of the column (e.g., 'text', 'number', 'date', etc.).
 * @returns The default FilterOperator for the given column type.
 */
export function getDefaultFilterOperator(
  columnType: ColumnType
): FilterOperator {
  if (columnType === "text") {
    return "iLike"
  }

  return "eq"
}

