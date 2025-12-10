"use client"

import React, { CSSProperties, useMemo } from "react"
import insane, { AllowedTags } from "insane"
import { marked, Renderer, Tokens } from "marked"

const ALLOWED_TAGS: AllowedTags[] = [
  "a",
  "article",
  "b",
  "blockquote",
  "br",
  "caption",
  "code",
  "del",
  "details",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "ins",
  "kbd",
  "li",
  "main",
  "ol",
  "p",
  "pre",
  "section",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]
const GENERIC_ALLOWED_ATTRIBUTES = ["style", "title"]

function sanitizer(html: string): string {
  return insane(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      ...ALLOWED_TAGS.reduce<Record<string, string[]>>((res, tag) => {
        res[tag] = [...GENERIC_ALLOWED_ATTRIBUTES]
        return res
      }, {}),
      img: [
        "src",
        "srcset",
        "alt",
        "width",
        "height",
        ...GENERIC_ALLOWED_ATTRIBUTES,
      ],
      table: ["width", ...GENERIC_ALLOWED_ATTRIBUTES],
      td: ["align", "width", ...GENERIC_ALLOWED_ATTRIBUTES],
      th: ["align", "width", ...GENERIC_ALLOWED_ATTRIBUTES],
      a: ["href", "target", ...GENERIC_ALLOWED_ATTRIBUTES],
      ol: ["start", ...GENERIC_ALLOWED_ATTRIBUTES],
      ul: ["start", ...GENERIC_ALLOWED_ATTRIBUTES],
    },
  })
}

class CustomRenderer extends Renderer {
  table(token: Tokens.Table): string {
    const header = token.header.map((cell) => this.tablecell(cell)).join("")
    const rows = token.rows
      .map((row) => {
        const cells = row.map((cell) => this.tablecell(cell)).join("")
        return `<tr>${cells}</tr>`
      })
      .join("")

    return `<table width="100%">
              <thead><tr>${header}</tr></thead>
              <tbody>${rows}</tbody>
            </table>`
  }
}

function renderMarkdownString(str: string): string {
  const html = marked.parse(str, {
    async: false,
    breaks: true,
    gfm: true,
    pedantic: false,
    silent: false,
    renderer: new CustomRenderer(),
  })
  if (typeof html !== "string") {
    throw new Error("marked.parse did not return a string")
  }
  return sanitizer(html)
}

type Props = {
  style: CSSProperties
  markdown: string
}
export default function EmailMarkdown({ markdown, ...props }: Props) {
  const data = useMemo(() => renderMarkdownString(markdown), [markdown])
  return <div {...props} dangerouslySetInnerHTML={{ __html: data }} />
}
