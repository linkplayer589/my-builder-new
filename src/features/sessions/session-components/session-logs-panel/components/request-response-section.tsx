import { Badge } from "@/components/ui/badge"

import { type RequestData } from "../types"

interface RequestResponseSectionProps {
  title: "Request" | "Response"
  data: RequestData
}

export function RequestResponseSection({
  title,
  data,
}: RequestResponseSectionProps) {
  if (!data) return null
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-2">
        {title === "Request" && "method" in data && "url" in data && (
          <div className="mb-2 space-y-1 text-sm">
            <div>
              Method: <Badge variant="outline">{data.method}</Badge>
            </div>
            <div>
              URL: <span className="text-muted-foreground">{data.url}</span>
            </div>
          </div>
        )}
        <details>
          <summary className="cursor-pointer text-sm text-muted-foreground">
            View {title === "Request" ? "Headers & Body" : "Full Response"}
          </summary>
          <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted p-2 text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}
