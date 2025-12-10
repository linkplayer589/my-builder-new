"use server"

import { db } from "@/db"
import { deviceHistory } from "@/db/schemas/device-history"
import { and, asc, count, desc, eq, type SQL } from "drizzle-orm"
import type { AnyColumn } from "drizzle-orm"

import { filterColumns } from "@/lib/filter-columns"
import type { SearchParamsType } from "@/lib/search-params"

/**
 * Explicitly typed list of valid column names for device history
 */
const VALID_COLUMNS = new Set<string>([
  'id',
  'deviceSerial',
  'eventType',
  'eventTimestamp',
  'locationType',
  'locationId',
  'locationName',
  'resortId',
  'orderId',
  'sessionId',
  'clientId',
  'statusBefore',
  'statusAfter',
  'eventDetails',
  'initiatedBy',
  'userAgent',
  'ipAddress',
  'notes',
  'processingStatus',
  'processingError',
  'processingDuration',
  'createdAt',
  'updatedAt',
])

/**
 * Type-safe column name type
 */
type DeviceHistoryColumnName = 
  | 'id'
  | 'deviceSerial'
  | 'eventType'
  | 'eventTimestamp'
  | 'locationType'
  | 'locationId'
  | 'locationName'
  | 'resortId'
  | 'orderId'
  | 'sessionId'
  | 'clientId'
  | 'statusBefore'
  | 'statusAfter'
  | 'eventDetails'
  | 'initiatedBy'
  | 'userAgent'
  | 'ipAddress'
  | 'notes'
  | 'processingStatus'
  | 'processingError'
  | 'processingDuration'
  | 'createdAt'
  | 'updatedAt'

/**
 * Filter type for device history queries
 */
type DeviceHistoryFilter = {
  rowId: string
  value: string | string[]
  type: "number" | "boolean" | "date" | "text" | "multi-select" | "select"
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
  id: DeviceHistoryColumnName
}

/**
 * Type-safe column accessor with explicit mapping
 * 
 * Note: The deviceHistory schema columns are asserted as AnyColumn to satisfy Drizzle ORM's
 * query builder requirements. The schema is properly typed in the database schema file.
 */
function getDeviceHistoryColumn(columnName: DeviceHistoryColumnName): AnyColumn {
  const columnMap: Record<DeviceHistoryColumnName, AnyColumn> = {
    id: deviceHistory.id as AnyColumn,
    deviceSerial: deviceHistory.deviceSerial as AnyColumn,
    eventType: deviceHistory.eventType as AnyColumn,
    eventTimestamp: deviceHistory.eventTimestamp as AnyColumn,
    locationType: deviceHistory.locationType as AnyColumn,
    locationId: deviceHistory.locationId as AnyColumn,
    locationName: deviceHistory.locationName as AnyColumn,
    resortId: deviceHistory.resortId as AnyColumn,
    orderId: deviceHistory.orderId as AnyColumn,
    sessionId: deviceHistory.sessionId as AnyColumn,
    clientId: deviceHistory.clientId as AnyColumn,
    statusBefore: deviceHistory.statusBefore as AnyColumn,
    statusAfter: deviceHistory.statusAfter as AnyColumn,
    eventDetails: deviceHistory.eventDetails as AnyColumn,
    initiatedBy: deviceHistory.initiatedBy as AnyColumn,
    userAgent: deviceHistory.userAgent as AnyColumn,
    ipAddress: deviceHistory.ipAddress as AnyColumn,
    notes: deviceHistory.notes as AnyColumn,
    processingStatus: deviceHistory.processingStatus as AnyColumn,
    processingError: deviceHistory.processingError as AnyColumn,
    processingDuration: deviceHistory.processingDuration as AnyColumn,
    createdAt: deviceHistory.createdAt as AnyColumn,
    updatedAt: deviceHistory.updatedAt as AnyColumn,
  }
  
  return columnMap[columnName]
}

/**
 * Fetch device history with advanced filtering, sorting, and pagination
 * Optionally filter by specific device serial number
 * 
 * @param input - Search parameters including filters, sorting, and pagination
 * @param deviceSerial - Optional device serial number to filter by
 * @returns Promise containing data array and page count
 */
export async function dbGetDeviceHistory(
  input: SearchParamsType,
  deviceSerial?: string
) {
  console.log("[DB] Fetching Device History...", { input, deviceSerial })

  try {
    const offset = (input.page - 1) * input.perPage

    // Build advanced where conditions from filters
    const advancedWhere = filterColumns({
      table: deviceHistory,
      filters: (input.filters ?? []).map((f) => ({
        ...f,
        id: f.id.replace("deviceHistory_", "") as DeviceHistoryColumnName,
      })) as DeviceHistoryFilter[],
      joinOperator: input.joinOperator ?? "and",
    })

    // Combine device serial filter with advanced filters
    const whereConditions: SQL[] = []
    
    if (deviceSerial) {
      whereConditions.push(eq(deviceHistory.deviceSerial as AnyColumn, deviceSerial))
    }
    
    if (advancedWhere) {
      whereConditions.push(advancedWhere)
    }
    
    const finalWhere: SQL | undefined = whereConditions.length > 0 
      ? (whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
      : undefined

    // Build order by clause with type-safe column access
    let orderBy: SQL<unknown>[] = [desc(deviceHistory.eventTimestamp as AnyColumn)]
    
    if (input.sort.length > 0) {
      try {
        const validSorts: SQL<unknown>[] = []
        
        for (const item of input.sort) {
          const columnName = item.id.replace("deviceHistory_", "")
          
          if (VALID_COLUMNS.has(columnName)) {
            const column = getDeviceHistoryColumn(columnName as DeviceHistoryColumnName)
            validSorts.push(item.desc ? desc(column) : asc(column))
          }
        }

        if (validSorts.length > 0) {
          orderBy = validSorts
        }
      } catch (err) {
        console.error("Sort parsing failed", err)
      }
    }

    // Execute transaction with properly typed queries
    const result = await db.transaction(async (tx) => {
      // Build and execute data query
      const baseDataQuery = tx.select().from(deviceHistory)
      
      const dataQuery = finalWhere 
        ? baseDataQuery.where(finalWhere)
        : baseDataQuery

      const data = await dataQuery
        .limit(input.perPage)
        .offset(offset)
        .orderBy(...orderBy)

      // Build and execute count query
      const baseCountQuery = tx.select({ count: count() }).from(deviceHistory)
      
      const countQuery = finalWhere
        ? baseCountQuery.where(finalWhere)
        : baseCountQuery

      const totalResult = await countQuery.execute()
      const firstResult = totalResult[0]
      const totalCount = firstResult ? firstResult.count : 0

      // Safely convert count to number
      const total: number = typeof totalCount === 'number' 
        ? totalCount 
        : typeof totalCount === 'string'
          ? parseInt(totalCount, 10)
          : 0

      return {
        data,
        total,
      }
    })

    const { data, total } = result
    const pageCount = Math.ceil(total / input.perPage)
    
    return { data, pageCount }
  } catch (error) {
    console.error("Failed to fetch device history:", error)
    return { data: [], pageCount: 0 }
  }
}

/**
 * Fetch a single device by ID from the devices table
 * 
 * @param id - The numeric ID of the device to fetch
 * @returns Promise containing the device or null if not found
 */
export async function dbGetDeviceById(id: number) {
  console.log("[DB] Fetching Device by ID...", { id })

  try {
    const device = await db.query.devices.findFirst({
      where: (devices, { eq }) => eq(devices.id, id),
    })

    return device ?? null
  } catch (error) {
    console.error("Failed to fetch device by ID:", error)
    return null
  }
}