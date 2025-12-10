"use client"

import { useCallback, useMemo, useState } from "react"
import { ChevronDown, ChevronRight, Copy, Search, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface JsonViewerProps {
  data: unknown
  className?: string
}

type JsonValue = string | number | boolean | null | JsonObject | JsonArray
type JsonObject = { [key: string]: JsonValue }
type JsonArray = JsonValue[]

/**
 * JSON Viewer component with collapsible objects/arrays and search functionality
 */
export function JsonViewer({ data, className = "" }: JsonViewerProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set([""]))
  const [searchTerm, setSearchTerm] = useState("")
  const [highlightedPaths, setHighlightedPaths] = useState<Set<string>>(
    new Set()
  )

  /**
   * Toggle expansion of a path
   */
  const togglePath = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  /**
   * Expand all paths recursively
   */
  const expandAll = useCallback(() => {
    const allPaths = new Set<string>([""])
    const collectPaths = (obj: JsonValue, path: string) => {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          const itemPath = `${path}[${index}]`
          allPaths.add(itemPath)
          if (
            (typeof item === "object" && item !== null) ||
            Array.isArray(item)
          ) {
            collectPaths(item, itemPath)
          }
        })
      } else if (typeof obj === "object" && obj !== null) {
        Object.keys(obj).forEach((key) => {
          const keyPath = path ? `${path}.${key}` : key
          allPaths.add(keyPath)
          const value = obj[key]
          if (
            (typeof value === "object" && value !== null) ||
            Array.isArray(value)
          ) {
            collectPaths(value, keyPath)
          }
        })
      }
    }
    collectPaths(data as JsonValue, "")
    setExpandedPaths(allPaths)
  }, [data])

  /**
   * Collapse all paths
   */
  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set([""]))
  }, [])

  /**
   * Search within JSON and highlight matching paths
   */
  const searchInJson = useCallback(
    (term: string) => {
      if (!term.trim()) {
        setHighlightedPaths(new Set())
        return
      }

      const matches = new Set<string>()
      const lowerTerm = term.toLowerCase()

      const searchRecursive = (obj: JsonValue, path: string) => {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            const itemPath = `${path}[${index}]`
            const itemStr = JSON.stringify(item).toLowerCase()
            if (itemStr.includes(lowerTerm)) {
              matches.add(itemPath)
            }
            if (
              (typeof item === "object" && item !== null) ||
              Array.isArray(item)
            ) {
              searchRecursive(item, itemPath)
            }
          })
        } else if (typeof obj === "object" && obj !== null) {
          Object.keys(obj).forEach((key) => {
            const keyPath = path ? `${path}.${key}` : key
            const value = obj[key]
            const valueStr = JSON.stringify(value).toLowerCase()
            const keyStr = key.toLowerCase()

            if (keyStr.includes(lowerTerm) || valueStr.includes(lowerTerm)) {
              matches.add(keyPath)
            }

            if (
              (typeof value === "object" && value !== null) ||
              Array.isArray(value)
            ) {
              searchRecursive(value, keyPath)
            }
          })
        } else {
          const valueStr = String(obj).toLowerCase()
          if (valueStr.includes(lowerTerm)) {
            matches.add(path)
          }
        }
      }

      searchRecursive(data as JsonValue, "")
      setHighlightedPaths(matches)

      // Auto-expand paths that contain matches
      const pathsToExpand = new Set<string>([""])
      matches.forEach((matchPath) => {
        const parts = matchPath.split(/[.\[\]]/).filter(Boolean)
        let currentPath = ""
        parts.forEach((part, index) => {
          if (index === 0) {
            currentPath = part
          } else {
            const prevPart = parts[index - 1]
            if (prevPart && prevPart.match(/^\d+$/)) {
              currentPath = `${currentPath}[${part}]`
            } else {
              currentPath = `${currentPath}.${part}`
            }
          }
          pathsToExpand.add(currentPath)
        })
      })
      setExpandedPaths((prev) => new Set([...prev, ...pathsToExpand]))
    },
    [data]
  )

  /**
   * Handle search input change
   */
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value)
      searchInJson(value)
    },
    [searchInJson]
  )

  /**
   * Copy minified JSON (no spaces)
   */
  const copyMinified = useCallback(async () => {
    try {
      const minified = JSON.stringify(data)
      await navigator.clipboard.writeText(minified)
      toast.success("Copied minified JSON to clipboard")
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }, [data])

  /**
   * Copy formatted JSON
   */
  const copyFormatted = useCallback(async () => {
    try {
      const formatted = JSON.stringify(data, null, 2)
      await navigator.clipboard.writeText(formatted)
      toast.success("Copied formatted JSON to clipboard")
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }, [data])

  /**
   * Render a JSON value recursively
   */
  const renderValue = useCallback(
    (
      value: JsonValue,
      path: string,
      key?: string,
      isLast = false
    ): React.ReactElement => {
      const isExpanded = expandedPaths.has(path)
      const isHighlighted = highlightedPaths.has(path)
      const highlightClass = isHighlighted
        ? "bg-yellow-500/20 rounded px-1 py-0.5"
        : ""

      if (value === null) {
        return (
          <span className={`text-muted-foreground ${highlightClass}`}>null</span>
        )
      }

      if (typeof value === "boolean") {
        return (
          <span
            className={`${value ? "text-green-600" : "text-red-600"} ${highlightClass}`}
          >
            {String(value)}
          </span>
        )
      }

      if (typeof value === "number") {
        return (
          <span className={`text-blue-600 ${highlightClass}`}>
            {String(value)}
          </span>
        )
      }

      if (typeof value === "string") {
        // Escape special characters for display
        const escaped = value
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t")
        return (
          <span className={`text-orange-600 ${highlightClass}`}>
            "{escaped}"
          </span>
        )
      }

      if (Array.isArray(value)) {
        const isEmpty = value.length === 0

        return (
          <div className={`inline-block ${highlightClass}`}>
            {key && (
              <>
                <span className="text-purple-600">"{key}"</span>
                <span className="text-muted-foreground">: </span>
              </>
            )}
            <span className="inline-flex items-center gap-1">
              <span className="text-muted-foreground">[</span>
              {!isEmpty && (
                <button
                  onClick={() => togglePath(path)}
                  className="inline-flex items-center text-muted-foreground hover:text-foreground"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                  type="button"
                >
                  {isExpanded ? (
                    <ChevronDown className="size-3" />
                  ) : (
                    <ChevronRight className="size-3" />
                  )}
                </button>
              )}
              {isEmpty && <span className="text-muted-foreground">]</span>}
              {!isEmpty && !isExpanded && (
                <span className="text-muted-foreground">
                  {value.length} item{value.length !== 1 ? "s" : ""}]
                </span>
              )}
            </span>
            {!isEmpty && isExpanded && (
              <div className="ml-4 mt-1">
                {value.map((item, index) => {
                  const itemPath = `${path}[${index}]`
                  const isLastItem = index === value.length - 1
                  return (
                    <div key={index} className="mb-1">
                      <span className="text-muted-foreground">{index}: </span>
                      <span className="inline-block">
                        {renderValue(item, itemPath, undefined, isLastItem)}
                      </span>
                      {!isLastItem && (
                        <span className="text-muted-foreground">,</span>
                      )}
                    </div>
                  )
                })}
                <span className="text-muted-foreground">]</span>
              </div>
            )}
          </div>
        )
      }

      if (typeof value === "object" && value !== null) {
        const keys = Object.keys(value)
        const isEmpty = keys.length === 0

        return (
          <div className={`inline-block ${highlightClass}`}>
            {key && (
              <>
                <span className="text-purple-600">"{key}"</span>
                <span className="text-muted-foreground">: </span>
              </>
            )}
            <span className="inline-flex items-center gap-1">
              <span className="text-muted-foreground">{"{"}</span>
              {!isEmpty && (
                <button
                  onClick={() => togglePath(path)}
                  className="inline-flex items-center text-muted-foreground hover:text-foreground"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                  type="button"
                >
                  {isExpanded ? (
                    <ChevronDown className="size-3" />
                  ) : (
                    <ChevronRight className="size-3" />
                  )}
                </button>
              )}
              {isEmpty && <span className="text-muted-foreground">{"}"}</span>}
              {!isEmpty && !isExpanded && (
                <span className="text-muted-foreground">
                  {keys.length} key{keys.length !== 1 ? "s" : ""}
                  {"}"}
                </span>
              )}
            </span>
            {!isEmpty && isExpanded && (
              <div className="ml-4 mt-1">
                {keys.map((objKey, index) => {
                  const keyPath = path ? `${path}.${objKey}` : objKey
                  const isLastKey = index === keys.length - 1
                  const objValue = value[objKey]
                  return (
                    <div key={objKey} className="mb-1">
                      <span className="text-purple-600">"{objKey}"</span>
                      <span className="text-muted-foreground">: </span>
                      <span className="inline-block">
                        {objValue !== undefined && renderValue(
                          objValue,
                          keyPath,
                          undefined,
                          isLastKey
                        )}
                      </span>
                      {!isLastKey && (
                        <span className="text-muted-foreground">,</span>
                      )}
                    </div>
                  )
                })}
                <span className="text-muted-foreground">{"}"}</span>
              </div>
            )}
          </div>
        )
      }

      return <span className={highlightClass}>{String(value)}</span>
    },
    [expandedPaths, highlightedPaths, togglePath]
  )

  const jsonContent = useMemo(() => {
    try {
      // Handle root level - if it's an object or array, render it directly
      // Otherwise wrap it in a display
      if (
        (typeof data === "object" && data !== null) ||
        Array.isArray(data)
      ) {
        return <div className="whitespace-pre-wrap">{renderValue(data as JsonValue, "")}</div>
      }
      return (
        <div className="whitespace-pre-wrap">
          {renderValue(data as JsonValue, "")}
        </div>
      )
    } catch (error) {
      return (
        <div className="text-red-600">
          Error rendering JSON:{" "}
          {error instanceof Error ? error.message : String(error)}
        </div>
      )
    }
  }, [data, renderValue])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Action Bar */}
      <div className="flex flex-col gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search in JSON..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="px-8"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("")
                setHighlightedPaths(new Set())
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
          <Button variant="outline" size="sm" onClick={copyFormatted}>
            <Copy className="mr-2 size-4" />
            Copy Formatted
          </Button>
          <Button variant="outline" size="sm" onClick={copyMinified}>
            <Copy className="mr-2 size-4" />
            Copy Minified
          </Button>
        </div>
      </div>

      {/* JSON Content */}
      <ScrollArea className="h-[calc(100vh-18rem)]">
        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          {jsonContent}
        </div>
      </ScrollArea>
    </div>
  )
}

