import * as React from "react"

import {
  BaseZodDictionary,
  BlockConfiguration,
  DocumentBlocksDictionary,
} from "../utils"

export default function buildBlockComponent<T extends BaseZodDictionary>(
  blocks: DocumentBlocksDictionary<T>
) {
  return function BlockComponent({ type, data }: BlockConfiguration<T>) {
    const blockConfig = blocks[type]

    if (!blockConfig) {
      console.error(
        `Block type "${String(type)}" not found in blocks dictionary`
      )
      return null // or a fallback component
    }

    const Component = blockConfig.Component
    return <Component {...data} />
  }
}
