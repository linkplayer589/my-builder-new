import React from "react"

interface Props {
  children: React.ReactNode
}

export default function AdminLayout({ children }: Props) {
  return <div className="min-h-screen">{children} </div>
}
