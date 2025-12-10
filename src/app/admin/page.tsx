"use client"

import { useCallback } from "react"
import { type Resort } from "@/db/schema"
import { useResort } from "@/features/resorts"

import { Card } from "@/components/ui/card"
import { LoadingScreen } from "@/components/loading-screen"

function ResortCard({ resort }: { resort: Resort }) {
  const { setActiveResort } = useResort()

  const handleClick = useCallback(() => {
    setActiveResort(resort)
  }, [setActiveResort, resort])

  return (
    <button onClick={handleClick} className="block w-full">
      <Card className="flex h-24 items-center justify-center p-6 hover:bg-accent">
        <span className="text-lg font-semibold">{resort.name}</span>
      </Card>
    </button>
  )
}

function ResortList() {
  const { resorts, isLoading } = useResort()

  if (isLoading || !resorts) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center gap-4">
        <LoadingScreen />
        <h1>Loading...</h1>
      </div>
    )
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Select a Resort</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {resorts.map((resort) => (
          <ResortCard key={resort.id} resort={resort} />
        ))}
      </div>
    </div>
  )
}

export default function AdminPage() {
  return <ResortList />
}
