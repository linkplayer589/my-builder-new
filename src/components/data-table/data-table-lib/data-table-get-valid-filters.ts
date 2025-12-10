import type { Filter } from "@/types/index"

/**
 * Filters out invalid or empty filters from an array of filters.
 *
 * This function processes an array of filters and returns a new array
 * containing only the valid filters. A filter is considered valid if:
 * - It has an 'isEmpty' or 'isNotEmpty' operator, or
 * - Its value is not empty (for array values, at least one element must be present;
 *   for other types, the value must not be an empty string, null, or undefined)
 *
 * @param filters - An array of Filter objects to be validated.
 * @returns A new array containing only the valid filters.
 */
export function getValidFilters<TData>(
  filters: Filter<TData>[]
): Filter<TData>[] {
  return filters.filter(
    (filter) =>
      filter.operator === "empty" ||
      filter.operator === "notEmpty" ||
      (Array.isArray(filter.value)
        ? filter.value.length > 0
        : filter.value !== "" &&
        filter.value !== null &&
        filter.value !== undefined)
  )
}

