// Conversion function to get date part in local time
export function _toLocalDateString(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0") // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}