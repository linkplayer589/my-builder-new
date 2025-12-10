import type { Kiosk } from "@/db/schema"
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

export const kiosksSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<Kiosk>().withDefault([{ id: "createdAt", desc: true }]),
  filters: getFiltersStateParser<Kiosk>().withDefault([]),
  joinOperator: joinOperatorParser.withDefault("and"),
  flags: parseAsArrayOf(parseAsString).withDefault([]),
})

export type KioskSearchParamsType =
  Awaited<ReturnType<typeof kiosksSearchParamsCache.parse>>
