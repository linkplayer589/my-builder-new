"use server"

import { db } from "@/db"
import { devices } from "@/db/schema"
import { asc, count, desc } from "drizzle-orm"
import type { AnyColumn } from "drizzle-orm"

import { filterColumns } from "@/lib/filter-columns"
import type { SearchParamsType } from "@/lib/search-params"

const VALID_COLUMNS = new Set(Object.keys(devices))

type DeviceFilter = {
  value: string | string[]
  type: "number" | "boolean" | "date" | "text" | "multi-select"
  operator:
    | "eq"
    | "iLike"
    | "notILike"
    | "lt"
    | "lte"
    | "gt"
    | "gte"
    | "neq"
    | "contains"
    | "notContains"
    | "between"
    | "empty"
    | "notEmpty"
  rowId: string
  id: keyof typeof devices
}

export async function dbGetAllDevicesSort(input: SearchParamsType) {
  console.log("[DB] Fetching Devices...", { input })

  try {
    const offset = (input.page - 1) * input.perPage

    const advancedWhere = filterColumns({
      table: devices,
      filters: (input.filters ?? []).map((f) => ({
        ...f,
        id: f.id.replace("devices_", "") as keyof typeof devices,
      })) as DeviceFilter[],
      joinOperator: input.joinOperator ?? "and",
    })

    let orderBy = [desc(devices.createdAt)]
    if (input.sort.length > 0) {
      try {
        const validSorts = input.sort
          .filter((item) => VALID_COLUMNS.has(item.id.replace("devices_", "")))
          .map((item) => {
            const columnName = item.id.replace(
              "devices_",
              ""
            ) as keyof typeof devices
            const column = devices[columnName] as AnyColumn
            return item.desc ? desc(column) : asc(column)
          })

        orderBy = validSorts.length > 0 ? validSorts : [desc(devices.createdAt)]
      } catch (err) {
        console.error("Sort parsing failed", err)
      }
    }

    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx
        .select()
        .from(devices)
        .limit(input.perPage)
        .offset(offset)
        .where(advancedWhere)
        .orderBy(...orderBy)

      const total = await tx
        .select({ count: count() })
        .from(devices)
        .where(advancedWhere)
        .execute()
        .then((res) => res[0]?.count ?? 0)

      return {
        data,
        total,
      }
    })

    const pageCount = Math.ceil(total / input.perPage)
    return { data, pageCount }
  } catch (error) {
    console.error("Failed to fetch devices with filters:", error)
    return { data: [], pageCount: 0 }
  }
}
