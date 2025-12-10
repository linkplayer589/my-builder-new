import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react"

export function TaskStatusIconSwitch({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="size-4 text-green-500" />
    case "failed":
      return <XCircle className="size-4 text-red-500" />
    case "warning":
      return <AlertTriangle className="size-4 text-yellow-500" />
    default:
      return <Clock className="size-4 text-blue-500" />
  }
}
