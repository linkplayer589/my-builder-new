import { renderToStaticMarkup } from "../@usewaypoint/email-builder/dist/index.mjs"

export function generateHtmlFromDocument(document: any): string {
  return renderToStaticMarkup(document, { rootBlockId: "root" })
}
