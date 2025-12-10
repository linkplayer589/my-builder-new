import { useEffect, useState } from "react"

function useRowExpansionAndMobile() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768
      setIsMobile(isMobile)

      // If switching from mobile to desktop, close the expanded row
      if (!isMobile) {
        setExpandedRow(null)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const toggleRowExpansion = (rowId: string) => {
    if (isMobile) {
      setExpandedRow((prev) => (prev === rowId ? null : rowId))
    }
  }

  return {
    expandedRow,
    isMobile,
    toggleRowExpansion,
  }
}

export default useRowExpansionAndMobile
