// import React from 'react';

// import { useCurrentBlockId } from '../../editor/EditorBlock';
// import { setDocument, setSelectedBlockId, useDocument } from '../../editor/EditorContext';
// import EditorChildrenIds from '../helpers/EditorChildrenIds';
// import { Container, ContainerProps } from '@/features/email-template-builder/@usewaypoint/block-container';

// export default function ContainerEditor({ style, props }: ContainerProps) {
//   const childrenIds = props?.childrenIds ?? [];

//   const document = useDocument();
//   const currentBlockId = useCurrentBlockId();

//   return (
//     <Container style={style}>
//       <EditorChildrenIds
//         childrenIds={childrenIds}
//         onChange={({ block, blockId, childrenIds }) => {
//           setDocument({
//             [blockId]: block,
//             [currentBlockId]: {
//               type: 'Container',
//               data: {
//                 ...document[currentBlockId].data,
//                 props: { childrenIds: childrenIds },
//               },
//             },
//           });
//           setSelectedBlockId(blockId);
//         }}
//       />
//     </Container>
//   );
// }

import React from "react"
import {
  Container,
  ContainerProps,
} from "@/features/email-template-builder/@usewaypoint/block-container"

import { useCurrentBlockId } from "../../editor/EditorBlock"
import {
  setDocument,
  setSelectedBlockId,
  useDocument,
} from "../../editor/EditorContext"
import EditorChildrenIds from "../helpers/EditorChildrenIds"

export default function ContainerEditor({ style, props }: ContainerProps) {
  const childrenIds = props?.childrenIds ?? []

  const document = useDocument()
  const currentBlockId = useCurrentBlockId()

  return (
    <Container style={style} props={props}>
      <EditorChildrenIds
        childrenIds={childrenIds}
        onChange={({ block, blockId, childrenIds }) => {
          setDocument({
            [blockId]: block,
            [currentBlockId]: {
              type: "Container",
              data: {
                ...(document as any)[currentBlockId].data,
                props: {
                  ...(document as any)[currentBlockId].data.props,
                  childrenIds: childrenIds,
                },
              },
            },
          })
          setSelectedBlockId(blockId)
        }}
      />
    </Container>
  )
}
