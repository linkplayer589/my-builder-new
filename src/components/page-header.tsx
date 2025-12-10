import type { FC } from "react"

interface PageHeaderProps {
  title: string
  description?: string
}

export const PageHeader: FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col space-y-2 px-4 md:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
