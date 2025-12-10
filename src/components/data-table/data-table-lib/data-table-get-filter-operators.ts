import type { ColumnType } from "@/types/index"
import { dataTableConfig } from "@/config/data-table"

/**
 * Retrieve the list of applicable filter operators for a given column type.
 *
 * This function returns an array of filter operators that are relevant and applicable
 * to the specified column type. It uses a predefined mapping of column types to
 * operator lists, falling back to text operators if an unknown column type is provided.
 *
 * @param columnType - The type of the column for which to get filter operators.
 * @returns An array of objects, each containing a label and value for a filter operator.
 */
export function getFilterOperators(columnType: ColumnType) {
  type OperatorOption = {
    readonly label: string
    readonly value: typeof dataTableConfig.globalOperators[number]
  }

  const operatorMap: Record<ColumnType, ReadonlyArray<OperatorOption>> = {
    text: dataTableConfig.textOperators,
    number: dataTableConfig.numericOperators,
    select: dataTableConfig.selectOperators,
    "multi-select": dataTableConfig.selectOperators,
    boolean: dataTableConfig.booleanOperators,
    date: dataTableConfig.dateOperators,
  }

  return operatorMap[columnType] ?? dataTableConfig.textOperators
}

