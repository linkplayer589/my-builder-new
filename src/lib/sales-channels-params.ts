import type { SalesChannel } from "@/db/schema"
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  createParser,
  parseAsString,
} from "nuqs/server"
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers"

const joinOperatorParser = createParser<"and" | "or">({
  parse: (value) => (value === "and" || value === "or" ? value : "and"),
  serialize: (value) => value,
})

/**
 * Search params cache specifically for sales channels data table
 * Uses SalesChannel type for proper type safety with filters and sorting
 */
export const salesChannelsSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<SalesChannel>().withDefault([{ id: "createdAt", desc: true }]),
  filters: getFiltersStateParser<SalesChannel>().withDefault([]),
  joinOperator: joinOperatorParser.withDefault("and"),
  flags: parseAsArrayOf(parseAsString).withDefault([]),
})

export type SalesChannelsSearchParamsType =
  Awaited<ReturnType<typeof salesChannelsSearchParamsCache.parse>>
