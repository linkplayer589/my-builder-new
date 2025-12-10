// import React, { CSSProperties } from 'react';
// import { TStyle } from '../TStyle';

// type TReaderBlockWrapperProps = {
//   style: TStyle;
//   children: JSX.Element;
// };

// export default function ReaderBlockWrapper({ style, children }: TReaderBlockWrapperProps) {
//   const { padding, borderColor, ...restStyle } = style;
//   const cssStyle: CSSProperties = {
//     ...restStyle,
//   };

//   if (padding) {
//     const { top, bottom, left, right } = padding;
//     cssStyle.padding = `${top}px ${right}px ${bottom}px ${left}px`;
//   }

//   if (borderColor) {
//     cssStyle.border = `1px solid ${borderColor}`;
//   }

//   return <div style={{ maxWidth: '100%', ...cssStyle }}>{children}</div>;
// }

// import React, { CSSProperties } from "react"
// import { useReaderDocument } from "@/features/email-template-builder/@usewaypoint/email-builder/dist/index.mjs"

// import { useDocument } from "../../../editor/EditorContext"
// import { TStyle } from "../TStyle"

// interface Position {
//   x: number
//   y: number
// }

// interface BlockProps {
//   position?: Position
//   zIndex?: number
//   [key: string]: any // Allow other props
// }

// interface BlockData {
//   props?: BlockProps
//   style?: TStyle
//   childrenIds?: string[]
// }

// interface DocumentBlock {
//   type: string
//   data?: BlockData
// }

// interface Document {
//   [key: string]: DocumentBlock
// }

// interface ReaderBlockWrapperProps {
//   id: string
//   style?: TStyle
//   children?: React.ReactNode
// }

// // Mock these since they're defined elsewhere
// const READER_DICTIONARY: any = {}
// const BaseReaderBlock: React.ComponentType<any> = () => null

// function ReaderBlockWrapper({ id, style, children }: ReaderBlockWrapperProps) {
//   if (!id) {
//     console.error("ReaderBlockWrapper called without id")
//     return null
//   }

//   const readerDocument = useReaderDocument()
//   const editorDocument = useDocument()
//   // Use reader document if available, otherwise fall back to editor document
//   const document = (readerDocument || editorDocument) as Document

//   const blockData = document[id]

//   console.log(`Rendering block ${id}:`, {
//     type: blockData?.type,
//     data: blockData?.data,
//     availableTypes: Object.keys(READER_DICTIONARY),
//   })

//   if (!blockData) {
//     console.error(`Block ${id} not found in document`)
//     return null
//   }

//   if (!READER_DICTIONARY[blockData.type]) {
//     console.error(
//       `Block type ${blockData.type} not registered. Available:`,
//       Object.keys(READER_DICTIONARY)
//     )
//     return <div>Unknown block type: {blockData.type}</div>
//   }

//   // Convert TStyle to CSSProperties for the wrapper
//   const { padding, borderColor, ...restStyle } = style || {}
//   const cssStyle: CSSProperties = {
//     ...restStyle,
//   }

//   if (padding) {
//     const { top, bottom, left, right } = padding
//     cssStyle.padding = `${top}px ${right}px ${bottom}px ${left}px`
//   }

//   if (borderColor) {
//     cssStyle.border = `1px solid ${borderColor}`
//   }

//   // If children are provided, just wrap them
//   if (children) {
//     return (
//       <div style={{ display: "inline-block", maxWidth: "100%", ...cssStyle }}>
//         {children}
//       </div>
//     )
//   }

//   // Otherwise, render the block from document data
//   const { data } = blockData
//   const blockStyle = data?.style || {}

//   // Create the base block component without style (will be handled by wrapper)
//   const baseBlockProps = { ...blockData }
//   if (baseBlockProps.data && baseBlockProps.data.style) {
//     // Remove style from data since we're handling it in the wrapper
//     const { style: dataStyle, ...dataWithoutStyle } = baseBlockProps.data
//     baseBlockProps.data = dataWithoutStyle
//   }

//   const baseBlock = React.createElement(BaseReaderBlock, { ...baseBlockProps })

//   // Apply block-specific styles from data
//   const {
//     padding: blockPadding,
//     borderColor: blockBorderColor,
//     ...blockRestStyle
//   } = blockStyle
//   const blockCssStyle: CSSProperties = {
//     ...blockRestStyle,
//   }

//   if (blockPadding) {
//     const { top, bottom, left, right } = blockPadding
//     blockCssStyle.padding = `${top}px ${right}px ${bottom}px ${left}px`
//   }

//   if (blockBorderColor) {
//     blockCssStyle.border = `1px solid ${blockBorderColor}`
//   }

//   return (
//     <div
//       style={{
//         display: "inline-block",
//         maxWidth: "100%",
//         ...cssStyle,
//         ...blockCssStyle,
//       }}
//     >
//       {baseBlock}
//     </div>
//   )
// }

// export default ReaderBlockWrapper

import React, { CSSProperties } from "react"

import { TStyle } from "../TStyle"

interface ReaderBlockWrapperProps {
  id: string
  style?: TStyle
  children?: React.ReactNode
}

function ReaderBlockWrapper({ id, style, children }: ReaderBlockWrapperProps) {
  if (!id) {
    console.error("ReaderBlockWrapper called without id")
    return null
  }

  // Convert TStyle to CSSProperties for the wrapper
  const { padding, borderColor, ...restStyle } = style || {}
  const cssStyle: CSSProperties = {
    // display: "inline-block",
    maxWidth: "100%",
    ...restStyle,
  }

  if (padding) {
    const { top, bottom, left, right } = padding
    cssStyle.padding = `${top}px ${right}px ${bottom}px ${left}px`
  }

  // if (borderColor) {
  //   cssStyle.border = `1px solid ${borderColor}`
  // }

  // Just wrap the children with the style - don't try to render the block content
  return <div style={cssStyle}>{children}</div>
}

export default ReaderBlockWrapper
