import type { Resort } from "@/db/schema"
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

export const resortsSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<Resort>().withDefault([{ id: "createdAt", desc: true }]),
  filters: getFiltersStateParser<Resort>().withDefault([]),
  joinOperator: joinOperatorParser.withDefault("and"),
  flags: parseAsArrayOf(parseAsString).withDefault([]),
})

export type ResortsSearchParamsType =
  Awaited<ReturnType<typeof resortsSearchParamsCache.parse>>
