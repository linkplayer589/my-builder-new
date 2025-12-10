import { Badge } from "@/components/ui/badge"

interface DateBadgeProps {
  date: string | Date
  className?: string
}

export function RelativeDayBadge({ date, className = "" }: DateBadgeProps) {
  // Create dates and normalize to start of day
  const startDate = new Date(date)
  const normalizedStartDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  )

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  let badgeText = ""
  let variant: "default" | "secondary" | "outline" = "outline"

  const startTime = normalizedStartDate.getTime()
  const todayTime = today.getTime()
  const tomorrowTime = tomorrow.getTime()
  const yesterdayTime = yesterday.getTime()

  if (startTime === todayTime) {
    badgeText = "Today"
    variant = "default"
  } else if (startTime === tomorrowTime) {
    badgeText = "Tomorrow"
    variant = "secondary"
  } else if (startTime === yesterdayTime) {
    badgeText = "Yesterday"
    variant = "outline"
  } else {
    const diffTime = startTime - todayTime
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays > 0) {
      badgeText = `${diffDays}d+`
      variant = "outline"
    } else {
      badgeText = `${Math.abs(diffDays)}d-`
      variant = "outline"
    }
  }

  return (
    <Badge variant={variant} className={`text-xs ${className}`}>
      {badgeText}
    </Badge>
  )
}
