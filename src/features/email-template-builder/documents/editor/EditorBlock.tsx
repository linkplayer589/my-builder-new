import React, { createContext, useContext } from "react"

import { EditorBlock as CoreEditorBlock } from "./core"
import { useDocument } from "./EditorContext"

const EditorBlockContext = createContext<{
  id: string
  position?: { x: number; y: number }
  isAbsolutePositioned?: boolean
} | null>(null)

export const useCurrentBlockId = () => {
  const context = useContext(EditorBlockContext)
  if (!context) throw new Error("No EditorBlockContext")
  return context.id
}

type EditorBlockProps = {
  id: string
  isAbsolutePositioned?: boolean
  position?: { x: number; y: number }
}

/**
 *
 * @param id - Block id
 * @returns EditorBlock component that loads data from the EditorDocumentContext
 */
export default function EditorBlock({
  id,
  isAbsolutePositioned = false,
  position = { x: 0, y: 0 },
}: EditorBlockProps) {
  const document = useDocument()
  const block = document[id]
  if (!block) {
    throw console.log("Could not find block")
  }
  return (
    <EditorBlockContext.Provider value={{ id, position, isAbsolutePositioned }}>
      <CoreEditorBlock {...(block as any)} />
    </EditorBlockContext.Provider>
  )
}
