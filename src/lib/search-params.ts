import { orders, type Order } from "@/db/schema"
import {
    createSearchParamsCache,
    parseAsArrayOf,
    parseAsInteger,
    createParser,
    parseAsString,
} from "nuqs/server"
import { z } from "zod"
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers"
import { dataTableConfig as _dataTableConfig } from "@/config/data-table"

const joinOperatorParser = createParser<"and" | "or">({
    parse: (value) => {
        if (value === "and" || value === "or") return value
        return "and"
    },
    serialize: (value) => value,
})

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(25),
    sort: getSortingStateParser<Order>().withDefault([{ id: "createdAt", desc: true }]),
    status: parseAsArrayOf(z.enum(orders.status.enumValues)).withDefault([]),
    filters: getFiltersStateParser<Order>().withDefault([]),
    joinOperator: joinOperatorParser.withDefault("and"),
    flags: parseAsArrayOf(parseAsString).withDefault([]),
})

export type SearchParamsType = Awaited<ReturnType<typeof searchParamsCache.parse>> 