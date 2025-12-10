import type { Filter, JoinOperator } from "@/types"
import { endOfDay, startOfDay } from "date-fns"
import {
  and,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lt,
  lte,
  ne,
  notIlike,
  notInArray,
  or,
  type AnyColumn,
  type SQL,
  type Table,
} from "drizzle-orm"

/**
 * Construct SQL conditions based on the provided filters for a specific table.
 *
 * This function takes a table and an array of filters, and returns a SQL
 * expression that represents the logical combination of these conditions. The conditions
 * are combined using the specified join operator (either 'AND' or 'OR'), which is determined
 * by the first filter's joinOperator property.
 *
 * Each filter can specify various operators (e.g., equality, inequality,
 * comparison for numbers and dates, etc.) and the function will generate the appropriate
 * SQL expressions based on the filter's type and value.
 *
 * @param table - The table to apply the filters on.
 * @param filters - An array of filters to be applied to the table.
 * @param joinOperator - The join operator to use for combining the filters.
 * @returns A SQL expression representing the combined filters, or undefined if no valid
 * filters are found.
 */
export function filterColumns<T extends Table>({
  table,
  filters,
  joinOperator,
}: {
  table: T
  filters: Filter<T>[]
  joinOperator: JoinOperator
}): SQL | undefined {
  const joinFn = joinOperator === "and" ? and : or

  const conditions = filters.map((filter) => {
    const column = table[filter.id] as AnyColumn

    switch (filter.operator) {
      case "eq":
        if (Array.isArray(filter.value)) {
          return inArray(column, filter.value)
        } else if (
          column.dataType === "boolean" &&
          typeof filter.value === "string"
        ) {
          return eq(column, filter.value === "true")
        } else if (filter.type === "date") {
          const date = new Date(filter.value)
          const start = startOfDay(date)
          const end = endOfDay(date)
          return and(gte(column, start), lte(column, end))
        } else {
          return eq(column, filter.value)
        }
      case "neq":
        if (Array.isArray(filter.value)) {
          return notInArray(column, filter.value)
        } else if (column.dataType === "boolean") {
          return ne(column, filter.value === "true")
        } else if (filter.type === "date") {
          const date = new Date(filter.value)
          const start = startOfDay(date)
          const end = endOfDay(date)
          return or(lt(column, start), gt(column, end))
        } else {
          return ne(column, filter.value)
        }
      case "contains":
      case "iLike":
        return filter.type === "text" && typeof filter.value === "string"
          ? ilike(column, `%${filter.value}%`)
          : undefined
      case "notContains":
      case "notILike":
        return filter.type === "text" && typeof filter.value === "string"
          ? notIlike(column, `%${filter.value}%`)
          : undefined
      case "lt":
        return filter.type === "number"
          ? lt(column, filter.value)
          : filter.type === "date" && typeof filter.value === "string"
            ? lt(column, endOfDay(new Date(filter.value)))
            : undefined
      case "lte":
        return filter.type === "number"
          ? lte(column, filter.value)
          : filter.type === "date" && typeof filter.value === "string"
            ? lte(column, endOfDay(new Date(filter.value)))
            : undefined
      case "gt":
        return filter.type === "number"
          ? gt(column, filter.value)
          : filter.type === "date" && typeof filter.value === "string"
            ? gt(column, startOfDay(new Date(filter.value)))
            : undefined
      case "gte":
        return filter.type === "number"
          ? gte(column, filter.value)
          : filter.type === "date" && typeof filter.value === "string"
            ? gte(column, startOfDay(new Date(filter.value)))
            : undefined
      case "between":
        return filter.type === "date" &&
          Array.isArray(filter.value) &&
          filter.value.length === 2
          ? and(
            filter.value[0]
              ? gte(column, startOfDay(new Date(filter.value[0])))
              : undefined,
            filter.value[1]
              ? lte(column, endOfDay(new Date(filter.value[1])))
              : undefined
          )
          : undefined
      case "empty":
        return eq(column, null)
      case "notEmpty":
        return ne(column, null)
      default:
        return undefined
    }
  })

  const validConditions = conditions.filter(
    (condition) => condition !== undefined
  )

  return validConditions.length > 0 ? joinFn(...validConditions) : undefined
}

/**
 * Get table column.
 * @param table The table to get the column from.
 * @param columnKey The key of the column to retrieve from the table.
 * @returns The column corresponding to the provided key.
 */
export function getColumn<T extends Table>(
  table: T,
  columnKey: keyof T
): AnyColumn {
  return table[columnKey] as AnyColumn
}
