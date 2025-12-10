import { renderToStaticMarkup } from "../dist/index.mjs"

// Copy all the same functions here
function processContentWithVariables(
  content: string,
  purpose?: string
): string {
  if (!content || !purpose) return content
  if (!content.includes("[")) return content

  if (purpose === "orderDateRange") {
    let replacementCount = 0
    return content.replace(/\[([^\]]+)\]/g, () => {
      replacementCount++
      return replacementCount === 1 ? "{{orderStartDate}}" : "{{orderEndDate}}"
    })
  }

  return content.replace(/\[([^\]]+)\]/g, () => `{{${purpose}}}`)
}

function processBlockPropsWithVariables(props: any): any {
  if (!props || typeof props !== "object") return props

  const processedProps = { ...props }
  const textFields = [
    "text",
    "contents",
    "alt",
    "linkHref",
    "url",
    "imageUrl",
    "src",
    "headingText",
    "primaryText",
    "secondaryText",
    "logoAlt",
    "backgroundImage",
    "logoUrl",
    "content",
    "html",
  ]

  textFields.forEach((field) => {
    if (processedProps[field] && typeof processedProps[field] === "string") {
      processedProps[field] = processContentWithVariables(
        processedProps[field],
        processedProps.purpose
      )
    }
  })

  Object.keys(processedProps).forEach((key) => {
    if (Array.isArray(processedProps[key])) {
      processedProps[key] = processedProps[key].map((item: any) =>
        processBlockPropsWithVariables(item)
      )
    } else if (
      processedProps[key] &&
      typeof processedProps[key] === "object" &&
      key !== "style"
    ) {
      processedProps[key] = processBlockPropsWithVariables(processedProps[key])
    }
  })

  return processedProps
}

function processDocumentWithVariables(document: any): any {
  const processedDocument = { ...document }

  Object.keys(processedDocument).forEach((key) => {
    const block = processedDocument[key]
    if (block && block.data) {
      processedDocument[key] = {
        ...block,
        data: {
          ...block.data,
          props: processBlockPropsWithVariables(block.data.props),
        },
      }
    }
  })

  return processedDocument
}

export function renderEmailTemplateWithVariables(
  document: any,
  { rootBlockId }: { rootBlockId: string }
) {
  const processedDocument = processDocumentWithVariables(document)
  return renderToStaticMarkup(processedDocument, { rootBlockId })
}
