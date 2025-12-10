import React, { useMemo } from "react"

import { renderToStaticMarkup } from "../../@usewaypoint/email-builder/dist/index.mjs"
import { useDocument } from "../../documents/editor/EditorContext"
import HighlightedCodePanel from "./helper/HighlightedCodePanel"

export default function HtmlPanel() {
  const document = useDocument()
  const code = useMemo(
    () => renderToStaticMarkup(document as any, { rootBlockId: "root" }),
    [document]
  )
  return <HighlightedCodePanel type="html" value={code} />
}
