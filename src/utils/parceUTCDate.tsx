export function parseUTCDate(dateString: string | undefined, defaultDate: Date): Date {
    if (!dateString) return defaultDate
    const date = new Date(dateString)
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
      )
    )
  }