// import React from 'react';

// import { useCurrentBlockId } from '../../editor/EditorBlock';
// import { setDocument, setSelectedBlockId } from '../../editor/EditorContext';
// import EditorChildrenIds, { EditorChildrenChange } from '../helpers/EditorChildrenIds';

// import ColumnsContainerPropsSchema, { ColumnsContainerProps } from './ColumnsContainerPropsSchema';
// import { ColumnsContainer } from '@/features/email-template-builder/@usewaypoint/block-columns-container';

// const EMPTY_COLUMNS = [{ childrenIds: [] }, { childrenIds: [] }, { childrenIds: [] }];

// export default function ColumnsContainerEditor({ style, props }: ColumnsContainerProps) {
//   const currentBlockId = useCurrentBlockId();

//   const { columns, ...restProps } = props ?? {};
//   const columnsValue = columns ?? EMPTY_COLUMNS;

//   const updateColumn = (columnIndex: 0 | 1 | 2, { block, blockId, childrenIds }: EditorChildrenChange) => {
//     const nColumns = [...columnsValue];
//     nColumns[columnIndex] = { childrenIds };
//     setDocument({
//       [blockId]: block,
//       [currentBlockId]: {
//         type: 'ColumnsContainer',
//         data: ColumnsContainerPropsSchema.parse({
//           style,
//           props: {
//             ...restProps,
//             columns: nColumns,
//           },
//         }),
//       },
//     });
//     setSelectedBlockId(blockId);
//   };

//   return (
//     <ColumnsContainer
//       props={restProps}
//       style={style}
//       columns={[
//         <EditorChildrenIds childrenIds={columns?.[0]?.childrenIds} onChange={(change) => updateColumn(0, change)} />,
//         <EditorChildrenIds childrenIds={columns?.[1]?.childrenIds} onChange={(change) => updateColumn(1, change)} />,
//         <EditorChildrenIds childrenIds={columns?.[2]?.childrenIds} onChange={(change) => updateColumn(2, change)} />,
//       ]}
//     />
//   );
// }

// import React from "react"
// import {
//   ColumnsContainer,
//   ColumnsContainerProps,
//   ColumnsContainerPropsSchema,
// } from "@/features/email-template-builder/@usewaypoint/block-columns-container"
// import { z } from "zod"

// import { useCurrentBlockId } from "../../editor/EditorBlock"
// import { setDocument, setSelectedBlockId } from "../../editor/EditorContext"
// import EditorChildrenIds, {
//   EditorChildrenChange,
// } from "../helpers/EditorChildrenIds"

// const EMPTY_COLUMNS: { childrenIds: string[] }[] = [
//   { childrenIds: [] },
//   { childrenIds: [] },
//   { childrenIds: [] },
//   { childrenIds: [] },
// ]

// type ColumnsContainerEditorProps = {
//   style?: z.infer<typeof ColumnsContainerPropsSchema>["style"]
//   props?: z.infer<typeof ColumnsContainerPropsSchema>["props"]
//   columns?: { childrenIds: string[] }[]
// }

// export default function ColumnsContainerEditor({
//   style,
//   props,
//   columns,
// }: ColumnsContainerEditorProps) {
//   const currentBlockId = useCurrentBlockId()
//   const restProps = props ?? {}
//   const columnsValue = columns ?? EMPTY_COLUMNS

//   const getActualColumnCount = () => {
//     if (restProps?.fixedWidths) {
//       return restProps.fixedWidths.split(" ").length
//     }
//     return restProps?.columnsCount ?? 2
//   }

//   const actualColumnCount = getActualColumnCount()

//   const updateColumn = (
//     columnIndex: number,
//     { block, blockId, childrenIds }: EditorChildrenChange
//   ) => {
//     const nColumns = [...columnsValue]
//     nColumns[columnIndex] = { childrenIds }
//     setDocument({
//       [blockId]: block,
//       [currentBlockId]: {
//         type: "ColumnsContainer",
//         data: {
//           style,
//           props: {
//             ...restProps,
//             columns: nColumns,
//           },
//         },
//       },
//     })
//     setSelectedBlockId(blockId)
//   }

//   // Create the actual React elements that will be rendered inside the columns
//   const editorColumns = []
//   for (let i = 0; i < actualColumnCount; i++) {
//     editorColumns.push(
//       <EditorChildrenIds
//         key={i}
//         childrenIds={columnsValue[i]?.childrenIds}
//         onChange={(change) => updateColumn(i, change)}
//       />
//     )
//   }

//   return (
//     <ColumnsContainer
//       props={restProps}
//       style={style}
//       columns={editorColumns} // This passes the React elements to be rendered inside cells
//     />
//   )
// }

import React from "react"
import {
  ColumnsContainer,
  ColumnsContainerPropsSchema,
} from "@/features/email-template-builder/@usewaypoint/block-columns-container"
import { z } from "zod"

import { useCurrentBlockId } from "../../editor/EditorBlock"
import {
  setDocument,
  setSelectedBlockId,
  useDocument,
} from "../../editor/EditorContext"
import EditorChildrenIds, {
  EditorChildrenChange,
} from "../helpers/EditorChildrenIds"

type ColumnsContainerEditorProps = {
  style?: z.infer<typeof ColumnsContainerPropsSchema>["style"]
  props?: z.infer<typeof ColumnsContainerPropsSchema>["props"]
  columns?: { childrenIds: string[] }[]
}

export default function ColumnsContainerEditor({
  style,
  props,
  columns,
}: ColumnsContainerEditorProps) {
  const currentBlockId = useCurrentBlockId()
  const document = useDocument()

  // Preserve ALL existing props by getting them from the current document state
  const currentBlock = document[currentBlockId]
  const currentBlockData = (currentBlock as any)?.data || {}

  // Use current document props as the source of truth, fallback to passed props
  const currentProps = currentBlockData.props || props || {}
  const currentStyle = currentBlockData.style || style || {}

  // Get columns from current document state, fallback to passed columns
  const currentColumns = currentProps.columns || columns || []

  const getActualColumnCount = () => {
    if (currentProps?.fixedWidths) {
      return currentProps.fixedWidths.split(" ").length
    }
    return currentProps?.columnsCount ?? 2
  }

  const actualColumnCount = getActualColumnCount()

  const updateColumn = (
    columnIndex: number,
    { block, blockId, childrenIds }: EditorChildrenChange
  ) => {
    const nColumns = [...currentColumns]
    // Ensure we have enough columns
    while (nColumns.length <= columnIndex) {
      nColumns.push({ childrenIds: [] })
    }
    nColumns[columnIndex] = { childrenIds }

    // Preserve ALL existing props and only update the columns
    setDocument({
      [blockId]: block,
      [currentBlockId]: {
        type: "ColumnsContainer",
        data: {
          style: currentStyle, // Use current style
          props: {
            ...currentProps, // Preserve ALL existing props
            columns: nColumns, // Only update columns
          },
        },
      },
    })
    setSelectedBlockId(blockId)
  }

  // Create the actual React elements that will be rendered inside the columns
  const editorColumns = []
  for (let i = 0; i < actualColumnCount; i++) {
    // Ensure we have a column at this index
    const columnData = currentColumns[i] || { childrenIds: [] }

    editorColumns.push(
      <EditorChildrenIds
        key={i}
        childrenIds={columnData.childrenIds}
        onChange={(change) => updateColumn(i, change)}
      />
    )
  }

  return (
    <ColumnsContainer
      props={currentProps} // Use currentProps instead of restProps
      style={currentStyle} // Use currentStyle instead of style
      columns={editorColumns}
    />
  )
}
