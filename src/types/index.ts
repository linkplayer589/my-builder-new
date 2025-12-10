import type { ColumnSort, Row } from "@tanstack/react-table"
import { type SQL } from "drizzle-orm"
import { type z } from "zod"

import { type DataTableConfig as _DataTableConfig } from "@/config/data-table"
import { type filterSchema } from "@/lib/parsers"
import { type dataTableConfig } from "@/config/data-table"

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type StringKeyOf<TData> = Extract<keyof TData, string>

export interface SearchParams {
  [key: string]: string | string[] | undefined
}

export interface Option {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  count?: number
}

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: StringKeyOf<TData>
}

export type ExtendedSortingState<TData> = ExtendedColumnSort<TData>[]

export type ColumnType = typeof dataTableConfig.columnTypes[number]

export type FilterOperator = typeof dataTableConfig.globalOperators[number]

export type JoinOperator = typeof dataTableConfig.joinOperators[number]["value"]

export interface DataTableFilterField<TData> {
  id: StringKeyOf<TData>
  label: string
  placeholder?: string
  options?: Option[]
}

export interface DataTableAdvancedFilterField<TData>
  extends DataTableFilterField<TData> {
  type: ColumnType
}

export interface FilterableColumnMeta<TData> {
  filterType?: ColumnType
  filterLabel?: string
  filterPlaceholder?: string
  filterOptions?: Option[]
  filterable?: boolean
  columnKey?: StringKeyOf<TData>
}

export interface FilterableColumnDef<TData, _TValue> {
  meta?: FilterableColumnMeta<TData>
}

export type Filter<TData> = Prettify<
  Omit<z.infer<typeof filterSchema>, "id"> & {
    id: StringKeyOf<TData>
  }
>

export interface DataTableRowAction<TData> {
  row: Row<TData>
  type: "update" | "delete"
}

export interface QueryBuilderOpts {
  where?: SQL
  orderBy?: SQL
  distinct?: boolean
  nullish?: boolean
}

export type LocalizedText = {
  en?: string;
  de?: string;
  it?: string;
  fr?: string;
}

export interface CalculatedPrice {
  basePrice: PriceDetails;
  bestPrice: PriceDetails;
  success: boolean;
}

export interface PriceDetails {
  amountNet: number;
  amountGross: number;
  currencyCode: string;
  taxDetails: TaxDetails;
  calculateFromPreviousAmount: boolean;
  netPrice: boolean;
}

export interface TaxDetails {
  name: string;
  taxValue: number;
  taxAmount: number;
  taxShortName: string;
  sortOrder: number;
}

