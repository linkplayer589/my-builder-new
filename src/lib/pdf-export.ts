import jsPDF from "jspdf"
import autoTable, { type UserOptions } from "jspdf-autotable"
import { format } from "date-fns"

import { type OrderStatistics } from "@/features/statistics/statistics-actions/db-get-statistics"
import { type SkiDataProduct, type SkiDataConsumerCategory } from "@/types/skidata-types"

interface ExportStatisticsToPDFParams {
    statistics: OrderStatistics
    from: Date
    to: Date
    products: SkiDataProduct[]
    categories: SkiDataConsumerCategory[]
    getProductName: (productId: string) => string
    getConsumerCategoryName: (categoryId: string) => string
}

type TableRow = [string, ...string[]]

// @ts-expect-error - jsPDF types are incomplete
interface ExtendedJsPDF extends jsPDF {
    lastAutoTable?: {
        finalY: number
    }
    internal: {
        pageSize: {
            width: number
            height: number
        }
    }
}

interface PrefixData {
    count: number
    total: number
    orderCount: number
    lifepassCount: number
    days: number
}

// Memoized table options to reduce object creation
const TABLE_OPTIONS: UserOptions = {
    theme: "grid" as const,
    headStyles: { fillColor: [66, 66, 66] },
    margin: { top: 15 },
    styles: { overflow: 'linebreak', cellWidth: 'wrap' },
    columnStyles: { text: { cellWidth: 'auto' } }
}

// Helper function to format currency
const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
    }).format(amount)

// Helper function to format numbers
const formatNumber = (value: number): string =>
    new Intl.NumberFormat("en-US").format(Math.round(value))

function sortTableRows(rows: TableRow[]): TableRow[] {
    return [...rows].sort((a, b) => {
        if (!a[1] || !b[1]) return 0
        const valueA = parseFloat(a[1].replace('€', '') || '0')
        const valueB = parseFloat(b[1].replace('€', '') || '0')
        return valueB - valueA
    })
}

function _getPrefixData(prefix: string | undefined, data: Record<string, PrefixData>): PrefixData | null {
    if (!prefix || !data[prefix]) return null
    return data[prefix]
}

function _createPDF(): ExtendedJsPDF {
    return new jsPDF() as ExtendedJsPDF
}

export async function exportStatisticsToPDF({ statistics, from, to, products: _products, categories, getProductName, getConsumerCategoryName }: ExportStatisticsToPDFParams) {
    try {
        // Create document with specific settings for better performance
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true
        }) as ExtendedJsPDF

        const pageWidth = doc.internal.pageSize.width
        let yPosition = 20

        // Pre-calculate all data before starting PDF generation
        const summaryData: TableRow[] = [
            ["Total Revenue", formatCurrency(statistics.totalRevenue)],
            ["Total Orders", formatNumber(statistics.totalOrders)],
            ["Total Lifepasses", formatNumber(statistics.totalLifepasses)],
            ["Average Order Value", formatCurrency(statistics.averageOrderValue)],
            ["Total Rental Days", formatNumber(statistics.totalRentalDays)]
        ]

        const revenueSplitData: TableRow[] = [
            ["Insurance", formatCurrency(statistics.revenueSplit.insurance)],
            ["Lifepass Rental", formatCurrency(statistics.revenueSplit.lifepass)],
            ["Ski Tickets", formatCurrency(statistics.revenueSplit.skiTicket)]
        ]

        // Pre-calculate channel data
        const channelData = sortTableRows(
            Object.entries(statistics.salesByChannel.reduce((acc, day) => {
                Object.entries(day.channels).forEach(([channel, data]) => {
                    const cleanChannel = channel === "undefined" ? "Other" : channel
                    if (!acc[cleanChannel]) {
                        acc[cleanChannel] = { total: 0, orderCount: 0, lifepassCount: 0, days: 0 }
                    }
                    acc[cleanChannel].total += data.amount
                    acc[cleanChannel].orderCount += data.orderCount
                    acc[cleanChannel].lifepassCount += data.lifepassCount
                    acc[cleanChannel].days += data.days
                })
                return acc
            }, {} as Record<string, { total: number; orderCount: number; lifepassCount: number; days: number }>))
                .map(([channel, data]): TableRow => [
                    channel,
                    formatCurrency(data.total),
                    formatNumber(data.orderCount),
                    formatNumber(data.lifepassCount),
                    formatNumber(data.days)
                ])
        )

        // Pre-calculate product data
        const productData = sortTableRows(
            statistics.productDistribution.map((item): TableRow => [
                getProductName(item.productId),
                formatCurrency(item.total),
                formatNumber(item.orderCount),
                formatNumber(item.lifepassCount),
                formatNumber((item.daysValidity || 0) * item.lifepassCount)
            ])
        )

        // Pre-calculate category data
        const categoryData = sortTableRows(
            statistics.consumerCategoryDistribution.map((item): TableRow => {
                const category = categories.find(c => c.id === item.categoryId)
                const name = getConsumerCategoryName(item.categoryId)
                const description = category?.description?.en
                const rentalDays = (item.daysValidity || 0) * item.lifepassCount
                return [
                    description ? `${name} - ${description}` : name,
                    formatCurrency(item.total),
                    formatNumber(item.orderCount),
                    formatNumber(item.lifepassCount),
                    formatNumber(rentalDays)
                ]
            })
        )

        // Generate PDF with pre-calculated data
        doc.setFontSize(20)
        doc.text("Statistics Report", pageWidth / 2, yPosition, { align: "center" })

        yPosition += 10
        doc.setFontSize(12)
        doc.text(
            `Period: ${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`,
            pageWidth / 2,
            yPosition,
            { align: "center" }
        )

        // Add tables efficiently
        const addTable = (head: string[], body: TableRow[], startY: number) => {
            autoTable(doc, {
                ...TABLE_OPTIONS,
                startY,
                head: [head],
                body,
                didDrawPage: (data) => {
                    // Add page number
                    const str = `Page ${data.pageNumber}`
                    doc.setFontSize(10)
                    doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10)
                }
            })
            return (doc.lastAutoTable?.finalY || 0) + 15
        }

        // Add all tables
        yPosition = addTable(
            ["Metric", "Value"],
            summaryData,
            yPosition + 15
        )

        yPosition = addTable(
            ["Category", "Amount"],
            revenueSplitData,
            yPosition
        )

        yPosition = addTable(
            ["Channel", "Revenue", "Orders", "Lifepasses", "Device Days"],
            channelData,
            yPosition
        )

        yPosition = addTable(
            ["Product", "Revenue", "Orders", "Lifepasses", "Rental Days"],
            productData,
            yPosition
        )

        yPosition = addTable(
            ["Category", "Revenue", "Orders", "Lifepasses", "Rental Days"],
            categoryData,
            yPosition
        )

        // Save the PDF with optimized settings
        const fileName = `statistics-report-${format(from, "yyyy-MM-dd")}-to-${format(to, "yyyy-MM-dd")}.pdf`
        doc.save(fileName)

    } catch (error) {
        console.error("Error generating PDF:", error)
        throw new Error("Failed to generate PDF report. The operation timed out. Please try again with a smaller date range.")
    }
} 