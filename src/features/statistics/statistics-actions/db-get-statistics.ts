"use server"

import { and, eq, gte, lte, sql as _sql, or } from "drizzle-orm"
import { type DateRange } from "react-day-picker"
import { startOfDay as _startOfDay } from "date-fns"
import { parsePhoneNumber } from 'libphonenumber-js'
import { cache } from 'react'

import { db } from "@/db"
import { orders } from "@/db/schema"
import { type OrderPrice } from "@/db/types/skidata-calculated-order-price"


type OrderStatus = "active" | "incomplete" | "pending" | "paid" | "submitted" | "complete" | "refunded" | "cancelled"

interface _OrderWithPrice {
    id: number
    status: OrderStatus
    salesChannel: string
    calculatedOrderPrice: OrderPrice | null
    createdAt: Date | null
}

type SalesChannelData = {
    [key: string]: {
        amount: number
        orderCount: number
        lifepassCount: number
        days: number
    }
}

export interface OrderStatistics {
    totalRevenue: number
    totalOrders: number
    totalLifepasses: number
    averageOrderValue: number
    totalRentalDays: number
    salesByChannel: {
        date: string
        channels: SalesChannelData
    }[]
    phonePrefixDistribution: {
        prefix: string
        count: number
    }[]
    productDistribution: {
        productId: string
        total: number
        orderCount: number
        lifepassCount: number
        daysValidity: number
    }[]
    consumerCategoryDistribution: {
        categoryId: string
        total: number
        orderCount: number
        lifepassCount: number
        daysValidity: number
    }[]
    revenueSplit: {
        insurance: number
        lifepass: number
        skiTicket: number
    }
}

const _COUNTRY_CODES: Record<string, string> = {
    "1": "USA/Canada (+1)",
    "44": "UK (+44)",
    "33": "France (+33)",
    "41": "Switzerland (+41)",
    "39": "Italy (+39)",
    "43": "Austria (+43)",
    "49": "Germany (+49)",
    "31": "Netherlands (+31)",
    "32": "Belgium (+32)",
    "45": "Denmark (+45)",
    "46": "Sweden (+46)",
    "47": "Norway (+47)",
    "48": "Poland (+48)",
    "34": "Spain (+34)",
    "351": "Portugal (+351)",
    "353": "Ireland (+353)",
    "358": "Finland (+358)",
    "420": "Czech Republic (+420)",
    "7": "Russia (+7)",
    "86": "China (+86)",
    "81": "Japan (+81)",
    "82": "South Korea (+82)",
    "61": "Australia (+61)",
    "64": "New Zealand (+64)",
    "27": "South Africa (+27)",
    "91": "India (+91)",
    "55": "Brazil (+55)",
    "52": "Mexico (+52)",
}

function cleanSalesChannelName(channel: string): string | null {
    const normalizedChannel = channel.toLowerCase()

    // Filter out swapped lifepass channels
    if (normalizedChannel.includes('swapped lifepass')) {
        return null
    }

    if (normalizedChannel.startsWith('kiosk - id = ')) {
        return channel.replace(/^kiosk - id = /i, '')
    }
    // Normalize cash desk variations
    if (normalizedChannel.includes('cash') && normalizedChannel.includes('desk')) {
        return 'Cash Desk'
    }
    // Normalize click-and-collect variations
    if (normalizedChannel.includes('click') && normalizedChannel.includes('collect')) {
        return 'Click & Collect'
    }
    return channel
}

// Cache key generator for statistics
function _getStatisticsCacheKey(resortId: number, dateRange: DateRange): string {
    return `statistics:${resortId}:${dateRange.from?.toISOString()}:${dateRange.to?.toISOString()}`
}

/**
 * Options for statistics query
 */
interface StatisticsOptions {
    /** Whether to include test orders in statistics (default: false) */
    includeTestOrders?: boolean
}

// Cache the main statistics function
const getStatisticsInternal = cache(async function getStatisticsInternal(
    resortId: number,
    dateRange: DateRange,
    options: StatisticsOptions = {}
): Promise<OrderStatistics> {
    const { includeTestOrders = false } = options

    console.log("[DB] Fetching statistics for:", {
        resortId,
        dateRange: {
            from: dateRange.from?.toISOString(),
            to: dateRange.to?.toISOString(),
        },
        includeTestOrders,
    })

    if (!dateRange.from || !dateRange.to) {
        throw new Error("Date range must be specified")
    }

    // Build where conditions
    // Use paymentStatus and orderStatus fields (status is legacy and not always updated)
    const whereConditions = [
        eq(orders.resortId, resortId),
        gte(orders.createdAt, dateRange.from),
        lte(orders.createdAt, dateRange.to),
        or(
            // Check new paymentStatus field for fully-paid orders
            eq(orders.paymentStatus, "fully-paid"),
            // Check new orderStatus field for completed orders
            eq(orders.orderStatus, "order-complete"),
            // Fallback to legacy status field for older records
            eq(orders.status, "fully-paid"),
            eq(orders.status, "order-complete")
        ),
    ]

    // Only filter out test orders if not including them
    if (!includeTestOrders) {
        whereConditions.push(eq(orders.testOrder, false))
    }

    // Fetch current period orders with myth submission data
    const currentPeriodOrders = await db
        .select({
            id: orders.id,
            status: orders.status,
            salesChannel: orders.salesChannel,
            calculatedOrderPrice: orders.calculatedOrderPrice,
            createdAt: orders.createdAt,
            mythOrderSubmissionData: orders.mythOrderSubmissionData,
        })
        .from(orders)
        .where(and(...whereConditions))

    console.log("📦 Current period orders:", {
        count: currentPeriodOrders.length,
    })

    // Get unique sales channels
    const uniqueSalesChannels = new Set<string>()
    currentPeriodOrders.forEach(order => {
        const cleanedChannel = cleanSalesChannelName(order.salesChannel || 'undefined')
        if (cleanedChannel) {
            uniqueSalesChannels.add(cleanedChannel)
        }
    })

    // Group orders by date and sales channel
    const salesByChannel = new Map<string, SalesChannelData>()

    // Process current period orders
    currentPeriodOrders.forEach((order) => {
        if (!order.createdAt) return

        const date = order.createdAt.toISOString().split('T')[0]
        if (!date) return

        const amount = order.calculatedOrderPrice?.cumulatedPrice?.bestPrice?.amountGross || 0
        const cleanedChannel = cleanSalesChannelName(order.salesChannel || 'undefined')
        // Skip this order if the channel is filtered out (null)
        if (!cleanedChannel) return

        const lifepassCount = order.calculatedOrderPrice?.orderItemPrices?.length || 0
        const daysValidity = order.calculatedOrderPrice?.daysValidity || 0
        const totalDays = daysValidity * lifepassCount

        if (!salesByChannel.has(date)) {
            // Initialize all channels with 0
            const channelData: SalesChannelData = {}
            uniqueSalesChannels.forEach(channel => {
                if (channel) { // Only add non-null channels
                    channelData[channel] = {
                        amount: 0,
                        orderCount: 0,
                        lifepassCount: 0,
                        days: 0,
                    }
                }
            })
            salesByChannel.set(date, channelData)
        }

        const channelData = salesByChannel.get(date)!
        if (!channelData[cleanedChannel]) {
            channelData[cleanedChannel] = {
                amount: 0,
                orderCount: 0,
                lifepassCount: 0,
                days: 0,
            }
        }
        channelData[cleanedChannel].amount += amount
        channelData[cleanedChannel].orderCount += 1
        channelData[cleanedChannel].lifepassCount += lifepassCount
        channelData[cleanedChannel].days += totalDays
    })

    // Convert Map to sorted array
    const salesByChannelArray = Array.from(salesByChannel.entries())
        .map(([date, channels]) => ({
            date,
            channels,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

    console.log("📊 Sales by channel:", {
        uniqueChannels: Array.from(uniqueSalesChannels),
    })

    // Calculate statistics
    const totalRevenue = currentPeriodOrders.reduce(
        (sum: number, order) =>
            sum + (order.calculatedOrderPrice?.cumulatedPrice?.bestPrice?.amountGross || 0),
        0
    )
    const totalOrders = currentPeriodOrders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate total rental days by multiplying number of lifepasses by days validity
    const totalRentalDays = currentPeriodOrders.reduce((sum: number, order) => {
        const daysValidity = order.calculatedOrderPrice?.daysValidity || 0
        const lifepassCount = order.calculatedOrderPrice?.orderItemPrices?.length || 0
        return sum + (daysValidity * lifepassCount)
    }, 0)

    // Calculate total lifepasses based on order items count
    const lifepassDebugInfo = [] as { orderId: number; count: number; items: unknown[] }[]
    const totalLifepasses = currentPeriodOrders.reduce(
        (sum: number, order) => {
            const count = order.calculatedOrderPrice?.orderItemPrices?.length || 0
            lifepassDebugInfo.push({
                orderId: order.id,
                count,
                items: order.calculatedOrderPrice?.orderItemPrices || []
            })
            return sum + count
        },
        0
    )

    console.log("🎫 Total Lifepasses Calculation:", {
        total: totalLifepasses
    })

    console.log("🎫 Lifepasses and Rental Days:", {
        lifepasses: {
            total: totalLifepasses,
            // breakdown: currentPeriodOrders.map(order => ({
            //     orderId: order.id,
            //     daysValidity: order.calculatedOrderPrice?.daysValidity || 0,
            //     lifepassCount: order.calculatedOrderPrice?.orderItemPrices?.length || 0,
            //     totalDays: (order.calculatedOrderPrice?.daysValidity || 0) *
            //         (order.calculatedOrderPrice?.orderItemPrices?.length || 0)
            // }))
        },
        rentalDays: {
            total: totalRentalDays
        }
    })

    // Process phone prefixes
    const prefixCounts = new Map<string, number>()

    currentPeriodOrders.forEach((order) => {
        const mythData = order.mythOrderSubmissionData as { contactDetails?: { telephone?: string } } | null
        const phoneNumber = mythData?.contactDetails?.telephone

        if (phoneNumber) {
            try {
                const parsedNumber = parsePhoneNumber(phoneNumber)
                if (parsedNumber?.country) {
                    const label = `${parsedNumber.country} (+${parsedNumber.countryCallingCode})`
                    prefixCounts.set(label, (prefixCounts.get(label) ?? 0) + 1)
                }
            } catch {
                // If parsing fails, skip this number
                console.log("Failed to parse phone number:", phoneNumber)
            }
        }
    })

    const phonePrefixDistribution = Array.from(prefixCounts.entries())
        .map(([prefix, count]) => ({ prefix, count }))
        .sort((a, b) => b.count - a.count)

    // Process product distribution
    const productDistribution = new Map<string, { total: number; orderCount: number; lifepassCount: number; daysValidity: number }>()
    currentPeriodOrders.forEach((order) => {
        if (!order.calculatedOrderPrice?.orderItemPrices) return
        const daysValidity = order.calculatedOrderPrice.daysValidity || 0

        order.calculatedOrderPrice.orderItemPrices.forEach((item) => {
            const productId = item.productId || 'unknown'
            if (!productDistribution.has(productId)) {
                productDistribution.set(productId, {
                    total: 0,
                    orderCount: 0,
                    lifepassCount: 0,
                    daysValidity: daysValidity
                })
            }
            const stats = productDistribution.get(productId)!
            stats.total += item.productPrice?.basePrice?.amountGross || 0
            stats.orderCount += 1
            stats.lifepassCount += 1 // Each item is a lifepass
            stats.daysValidity = daysValidity // Update daysValidity for this product
        })
    })

    // Process consumer category distribution
    const categoryDistribution = new Map<string, { total: number; orderCount: number; lifepassCount: number; daysValidity: number }>()
    currentPeriodOrders.forEach((order) => {
        if (!order.calculatedOrderPrice?.orderItemPrices) return
        const daysValidity = order.calculatedOrderPrice.daysValidity || 0

        order.calculatedOrderPrice.orderItemPrices.forEach((item) => {
            const categoryId = item.consumerCategoryId || 'unknown'
            if (!categoryDistribution.has(categoryId)) {
                categoryDistribution.set(categoryId, {
                    total: 0,
                    orderCount: 0,
                    lifepassCount: 0,
                    daysValidity: daysValidity
                })
            }
            const stats = categoryDistribution.get(categoryId)!
            stats.total += item.productPrice?.basePrice?.amountGross || 0
            stats.orderCount += 1
            stats.lifepassCount += 1 // Each item is a lifepass
            stats.daysValidity = daysValidity // Update daysValidity for this category
        })
    })

    // Process revenue split
    const revenueSplit = {
        insurance: 0,
        lifepass: 0,
        skiTicket: 0,
    }

    currentPeriodOrders.forEach((order) => {
        if (!order.calculatedOrderPrice?.orderItemPrices) return

        // Sum up all product prices for ski tickets
        order.calculatedOrderPrice.orderItemPrices.forEach((item) => {
            if (item.productPrice?.basePrice?.amountGross) {
                revenueSplit.skiTicket += item.productPrice.basePrice.amountGross
            }
        })

        // Sum up all insurance prices from orderItemPrices
        order.calculatedOrderPrice.orderItemPrices.forEach((item) => {
            if (item.insurancePrice?.basePrice?.amountGross) {
                revenueSplit.insurance += item.insurancePrice.basePrice.amountGross
            }
        })

        // Sum up all lifepass prices from orderItemPrices
        order.calculatedOrderPrice.orderItemPrices.forEach((item) => {
            if (item.lifepassRentalPrice?.basePrice?.amountGross) {
                revenueSplit.lifepass += item.lifepassRentalPrice.basePrice.amountGross
            }
        })
    })

    const statistics = {
        totalRevenue,
        totalOrders,
        totalLifepasses,
        averageOrderValue,
        totalRentalDays,
        salesByChannel: salesByChannelArray,
        phonePrefixDistribution,
        productDistribution: Array.from(productDistribution.entries()).map(([productId, stats]) => ({
            productId,
            ...stats,
        })),
        consumerCategoryDistribution: Array.from(categoryDistribution.entries()).map(([categoryId, stats]) => ({
            categoryId,
            ...stats,
        })),
        revenueSplit,
    }

    // console.log("📈 Final statistics:", statistics)

    return statistics
})

// Export the server action
export async function getStatistics(
    resortId: number,
    dateRange: DateRange,
    options: StatisticsOptions = {}
): Promise<OrderStatistics> {
    return getStatisticsInternal(resortId, dateRange, options)
}