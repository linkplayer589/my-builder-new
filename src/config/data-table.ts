import { Pickaxe, SquareSquare } from "lucide-react"

export type DataTableConfig = typeof dataTableConfig

export const dataTableConfig = {
  featureFlags: [
    {
      label: "Advanced table",
      value: "advancedTable" as const,
      icon: Pickaxe,
      tooltipTitle: "Toggle advanced table",
      tooltipDescription: "A filter and sort builder to filter and sort rows.",
    },
    {
      label: "Floating bar",
      value: "floatingBar" as const,
      icon: SquareSquare,
      tooltipTitle: "Toggle floating bar",
      tooltipDescription: "A floating bar that sticks to the top of the table.",
    },
  ],
  textOperators: [
    { label: "Contains", value: "iLike" as const },
    { label: "Does not contain", value: "notILike" as const },
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "neq" as const },
    { label: "Is empty", value: "empty" as const },
    { label: "Is not empty", value: "notEmpty" as const },
  ],
  numericOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "neq" as const },
    { label: "Is less than", value: "lt" as const },
    { label: "Is less than or equal to", value: "lte" as const },
    { label: "Is greater than", value: "gt" as const },
    { label: "Is greater than or equal to", value: "gte" as const },
    { label: "Is empty", value: "empty" as const },
    { label: "Is not empty", value: "notEmpty" as const },
  ],
  dateOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "neq" as const },
    { label: "Is before", value: "lt" as const },
    { label: "Is after", value: "gt" as const },
    { label: "Is on or before", value: "lte" as const },
    { label: "Is on or after", value: "gte" as const },
    { label: "Is between", value: "between" as const },
    { label: "Is relative to today", value: "contains" as const },
    { label: "Is empty", value: "empty" as const },
    { label: "Is not empty", value: "notEmpty" as const },
  ],
  selectOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "neq" as const },
    { label: "Is empty", value: "empty" as const },
    { label: "Is not empty", value: "notEmpty" as const },
  ],
  booleanOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "neq" as const },
  ],
  joinOperators: [
    { label: "And", value: "and" },
    { label: "Or", value: "or" },
  ],
  sortOrders: [
    { label: "Asc", value: "asc" as const },
    { label: "Desc", value: "desc" as const },
  ],
  columnTypes: [
    "text",
    "number",
    "date",
    "boolean",
    "multi-select",
    "select",
  ],
  globalOperators: [
    "eq",
    "neq",
    "contains",
    "notContains",
    "gt",
    "gte",
    "lt",
    "lte",
    "between",
    "empty",
    "notEmpty",
    "iLike",
    "notILike",
  ],
} as const
