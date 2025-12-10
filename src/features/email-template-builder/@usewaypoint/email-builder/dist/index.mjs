// var __defProp = Object.defineProperty;
// var __defProps = Object.defineProperties;
// var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
// var __getOwnPropSymbols = Object.getOwnPropertySymbols;
// var __hasOwnProp = Object.prototype.hasOwnProperty;
// var __propIsEnum = Object.prototype.propertyIsEnumerable;
// var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
// var __spreadValues = (a, b) => {
//   for (var prop in b || (b = {}))
//     if (__hasOwnProp.call(b, prop))
//       __defNormalProp(a, prop, b[prop]);
//   if (__getOwnPropSymbols)
//     for (var prop of __getOwnPropSymbols(b)) {
//       if (__propIsEnum.call(b, prop))
//         __defNormalProp(a, prop, b[prop]);
//     }
//   return a;
// };
// var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
// var __objRest = (source, exclude) => {
//   var target = {};
//   for (var prop in source)
//     if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
//       target[prop] = source[prop];
//   if (source != null && __getOwnPropSymbols)
//     for (var prop of __getOwnPropSymbols(source)) {
//       if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
//         target[prop] = source[prop];
//     }
//   return target;
// };

// // src/renderers/renderToStaticMarkup.tsx
// import React from 'react';
// import React5 from "react";
// import { renderToStaticMarkup as baseRenderToStaticMarkup } from "react-dom/server";

// // src/Reader/core.tsx
// import React4, { createContext, useContext } from "react";
// import React2 from "react";

// import { z as z4 } from "zod";
// import { Avatar, AvatarPropsSchema } from "../../block-avatar";
// import { Button, ButtonPropsSchema } from "../../block-button";
// import { Divider, DividerPropsSchema } from "../../block-divider";
// import { Heading, HeadingPropsSchema } from "../../block-heading";
// import { Html, HtmlPropsSchema } from "../../block-html";
// import { Image, ImagePropsSchema } from "../../block-image";
// import { Spacer, SpacerPropsSchema } from "../../block-spacer";
// import { Text, TextPropsSchema } from "../../block-text";
// import { Header, HeaderPropsSchema } from '../../block-header'; 
// import { BottomSection, BottomSectionPropsSchema } from '../../block-bottom'; // USE THE ACTUAL BOTTOM SECTION BLOCK
// import { Container, ContainerPropsSchema } from "../../block-container"; // USE THE ACTUAL CONTAINER BLOCK
// import { ColumnsContainer, ColumnsContainerPropsSchema } from "../../block-columns-container"; // USE THE ACTUAL COLUMNS CONTAINER BLOCK
// import {
//   buildBlockComponent,
//   buildBlockConfigurationDictionary,
//   buildBlockConfigurationSchema
// } from "../../document-core/src";
// import { CanvasContainerPropsSchema } from "../../../documents/blocks/helpers/block-wrappers/CanvasContainerPropsSchema";
// import CanvasContainerReader from "../../../documents/blocks/helpers/block-wrappers/CanvasContainerReader";
// import ReaderBlockWrapper from "../../../documents/blocks/helpers/block-wrappers/ReaderBlockWrapper";
// import EmailLayoutReader from '../../../documents/blocks/EmailLayout/EmailLayoutReader'
// import EmailLayoutPropsSchema from '../../../documents/blocks/EmailLayout/EmailLayoutPropsSchema'
// import {convertToEmailHTML} from './convertToEmailTables'

// // SIMPLIFIED READER COMPONENTS - USE THE ACTUAL BLOCKS DIRECTLY

// // Header Reader - Use the actual Header block component
// function HeaderReader({ style, props }) {
//   return React4.createElement(Header, { style, props });
// }

// // BottomSection Reader - Use the actual BottomSection block component  
// function BottomSectionReader({ style, props }) {
//   return React4.createElement(BottomSection, { style, props });
// }

// // ColumnsContainer Reader - Use the actual ColumnsContainer block component
// function ColumnsContainerReader({ style, props }) {
//   const document = useReaderDocument();
//   const _a = props != null ? props : {}, { 
//     columns 
//   } = _a, restProps = __objRest(_a, ["columns"]);
  
//   let cols = void 0;
//   if (columns) {
//     cols = columns.map((col) => 
//       col.childrenIds
//         .filter(childId => !!document[childId])
//         .map((childId) => /* @__PURE__ */ React.createElement(ReaderBlock, { key: childId, id: childId }))
//     );
//   }

//   return /* @__PURE__ */ React.createElement(ColumnsContainer, { 
//     props: restProps, 
//     columns: cols, 
//     style: style 
//   });
// }

// // Container Reader - Use the actual Container block component
// function ContainerReader({ style, props }) {
//   const document = useReaderDocument();
//   const childrenIds = (props?.childrenIds) ?? [];
  
//   const validChildrenIds = childrenIds.filter(childId => !!document[childId]);
  
//   return /* @__PURE__ */ React2.createElement(Container, { style, props }, 
//     validChildrenIds.map((childId) => /* @__PURE__ */ React2.createElement(ReaderBlock, { key: childId, id: childId }))
//   );
// }

// var ReaderContext = createContext({});
// function useReaderDocument() {
//   return useContext(ReaderContext);
// }

// // SIMPLIFIED READER DICTIONARY - USE ACTUAL BLOCK COMPONENTS
// var READER_DICTIONARY = buildBlockConfigurationDictionary({
//   // Use actual block components instead of custom readers where possible
//   Header: {
//     schema: HeaderPropsSchema,
//     Component: Header, // Use the actual Header block directly
//   },
//   BottomSection: {
//     schema: BottomSectionPropsSchema,
//     Component: BottomSection, // Use the actual BottomSection block directly
//   },
//   EmailLayout: {
//     schema: EmailLayoutPropsSchema,
//     Component: EmailLayoutReader, // Keep custom reader for children handling
//   },
//   Container: {
//     schema: ContainerPropsSchema,
//     Component: ContainerReader, // Keep custom reader for children handling
//   },
//   ColumnsContainer: {
//     schema: ColumnsContainerPropsSchema,
//     Component: ColumnsContainerReader, // Keep custom reader for children handling
//   },
//   CanvasContainer: {
//     schema: CanvasContainerPropsSchema,
//     Component: CanvasContainerReader
//   },
  
//   // Basic blocks - use directly
//   Avatar: {
//     schema: AvatarPropsSchema,
//     Component: Avatar
//   },
//   Button: {
//     schema: ButtonPropsSchema,
//     Component: Button
//   },
//   Divider: {
//     schema: DividerPropsSchema,
//     Component: Divider
//   },
//   Heading: {
//     schema: HeadingPropsSchema,
//     Component: Heading
//   },
//   Html: {
//     schema: HtmlPropsSchema,
//     Component: Html
//   },
//   Image: {
//     schema: ImagePropsSchema,
//     Component: Image
//   },
//   Spacer: {
//     schema: SpacerPropsSchema,
//     Component: Spacer
//   },
//   Text: {
//     schema: TextPropsSchema,
//     Component: Text
//   }
// });

// var ReaderBlockSchema = buildBlockConfigurationSchema(READER_DICTIONARY);
// var ReaderDocumentSchema = z4.record(z4.string(), ReaderBlockSchema);
// var BaseReaderBlock = buildBlockComponent(READER_DICTIONARY);

// // SIMPLIFIED ReaderBlock - LET THE BLOCK COMPONENTS HANDLE THEIR OWN STYLING
// function ReaderBlock({ id }) {
//   const document = useReaderDocument();
//   const blockData = document[id];

//   if (!blockData) {
//     console.warn(`Block ${id} not found in document`);
//     return null;
//   }
  
//   if (!READER_DICTIONARY[blockData.type]) {
//     console.error(`Block type ${blockData.type} not registered. Available:`, Object.keys(READER_DICTIONARY));
//     return React4.createElement('div', null, `Unknown block type: ${blockData.type}`);
//   }

//   // For EmailLayout - special handling as root layout
//   if (blockData.type === 'EmailLayout') {
//     return /* @__PURE__ */ React4.createElement(
//       BaseReaderBlock,
//       __spreadValues({}, blockData)
//     );
//   }

//   // For blocks that need wrapper (complex styling/positioning)
//   const blockStyle = blockData.data?.style || {};
//   const needsWrapper = Object.keys(blockStyle).length > 0 && 
//                       !['EmailLayout', 'Header', 'BottomSection'].includes(blockData.type);

//   if (needsWrapper) {
//     return /* @__PURE__ */ React4.createElement(
//       ReaderBlockWrapper,
//       { id: id, style: blockStyle },
//       /* @__PURE__ */ React4.createElement(BaseReaderBlock, __spreadValues({}, blockData))
//     );
//   }

//   // Default case - let the block component handle its own rendering
//   return /* @__PURE__ */ React4.createElement(BaseReaderBlock, __spreadValues({}, blockData));
// }

// function Reader({ document, rootBlockId }) {
//   return /* @__PURE__ */ React4.createElement(ReaderContext.Provider, { value: document }, /* @__PURE__ */ React4.createElement(ReaderBlock, { id: rootBlockId }));
// }

// // src/renderers/renderToStaticMarkup.tsx
// function renderToStaticMarkup(document, { rootBlockId }) {
//   try {
//     // Your existing email HTML conversion
//     return convertToEmailHTML(document);
//   } catch (error) {
//     console.error('Email conversion failed, using React fallback:', error);
//     return "<!DOCTYPE html>" + baseRenderToStaticMarkup(
//       React5.createElement("html", null, 
//         React5.createElement("body", null, 
//           React5.createElement(Reader, { document, rootBlockId })
//         )
//       )
//     );
//   }
// }

// export {
//   Reader,
//   ReaderBlock,
//   useReaderDocument,
//   ReaderBlockSchema,
//   ReaderDocumentSchema,
//   renderToStaticMarkup
// };



import React, { createContext, useContext } from 'react'
import { renderToStaticMarkup as baseRenderToStaticMarkup } from 'react-dom/server'
import { z } from 'zod'

// Import your block components
import { Avatar, AvatarPropsSchema } from '../../block-avatar'
import { Button, ButtonPropsSchema } from '../../block-button'
import { Divider, DividerPropsSchema } from '../../block-divider'
import { Heading, HeadingPropsSchema } from '../../block-heading'
import { Html, HtmlPropsSchema } from '../../block-html'
import { Image, ImagePropsSchema } from '../../block-image'
import { Spacer, SpacerPropsSchema } from '../../block-spacer'
import { Text, TextPropsSchema } from '../../block-text'
import { Header, HeaderPropsSchema } from '../../block-header'
import { BottomSection, BottomSectionPropsSchema } from '../../block-bottom'
import { Container, ContainerPropsSchema } from '../../block-container'
import { ColumnsContainer, ColumnsContainerPropsSchema } from '../../block-columns-container'

import {
  buildBlockComponent,
  buildBlockConfigurationDictionary,
  buildBlockConfigurationSchema
} from '../../document-core/src'

import { CanvasContainerPropsSchema } from '../../../documents/blocks/helpers/block-wrappers/CanvasContainerPropsSchema'
import CanvasContainerReader from '../../../documents/blocks/helpers/block-wrappers/CanvasContainerReader'
import ReaderBlockWrapper from '../../../documents/blocks/helpers/block-wrappers/ReaderBlockWrapper'
import EmailLayoutReader from '../../../documents/blocks/EmailLayout/EmailLayoutReader'
import EmailLayoutPropsSchema from '../../../documents/blocks/EmailLayout/EmailLayoutPropsSchema'
import { convertToEmailHTML } from './convertToEmailTables'

// Create context
const ReaderContext = createContext({})

// Custom hooks
function useReaderDocument() {
  return useContext(ReaderContext)
}

// Container Reader Component
function ContainerReader({ style, props }) {
  const document = useReaderDocument()
  const childrenIds = props?.childrenIds ?? []
  const validChildrenIds = childrenIds.filter((childId) => !!document[childId])

  return React.createElement(
    Container,
    { style, props },
    validChildrenIds.map((childId) =>
      React.createElement(ReaderBlock, { key: childId, id: childId })
    )
  )
}

// Columns Container Reader Component
function ColumnsContainerReader({ style, props }) {
  const document = useReaderDocument()
  const { columns, ...restProps } = props ?? {}

  const cols = columns?.map((col) =>
    col.childrenIds
      .filter((childId) => !!document[childId])
      .map((childId) => React.createElement(ReaderBlock, { key: childId, id: childId }))
  )

  return React.createElement(ColumnsContainer, {
    props: restProps,
    columns: cols,
    style
  })
}

// Reader Dictionary
const READER_DICTIONARY = buildBlockConfigurationDictionary({
  Header: {
    schema: HeaderPropsSchema,
    Component: Header
  },
  BottomSection: {
    schema: BottomSectionPropsSchema,
    Component: BottomSection
  },
  EmailLayout: {
    schema: EmailLayoutPropsSchema,
    Component: EmailLayoutReader
  },
  Container: {
    schema: ContainerPropsSchema,
    Component: ContainerReader
  },
  ColumnsContainer: {
    schema: ColumnsContainerPropsSchema,
    Component: ColumnsContainerReader
  },
  CanvasContainer: {
    schema: CanvasContainerPropsSchema,
    Component: CanvasContainerReader
  },
  Avatar: {
    schema: AvatarPropsSchema,
    Component: Avatar
  },
  Button: {
    schema: ButtonPropsSchema,
    Component: Button
  },
  Divider: {
    schema: DividerPropsSchema,
    Component: Divider
  },
  Heading: {
    schema: HeadingPropsSchema,
    Component: Heading
  },
  Html: {
    schema: HtmlPropsSchema,
    Component: Html
  },
  Image: {
    schema: ImagePropsSchema,
    Component: Image
  },
  Spacer: {
    schema: SpacerPropsSchema,
    Component: Spacer
  },
  Text: {
    schema: TextPropsSchema,
    Component: Text
  }
})

// Schemas
const ReaderBlockSchema = buildBlockConfigurationSchema(READER_DICTIONARY)
const ReaderDocumentSchema = z.record(z.string(), ReaderBlockSchema)
const BaseReaderBlock = buildBlockComponent(READER_DICTIONARY)

// Reader Block Component
function ReaderBlock({ id }) {
  const document = useReaderDocument()
  const blockData = document[id]

  if (!blockData) {
    console.warn(`Block ${id} not found in document`)
    return null
  }

  if (!READER_DICTIONARY[blockData.type]) {
    console.error(`Block type ${blockData.type} not registered. Available:`, Object.keys(READER_DICTIONARY))
    return React.createElement('div', null, `Unknown block type: ${blockData.type}`)
  }

  // For EmailLayout - special handling as root layout
  if (blockData.type === 'EmailLayout') {
    return React.createElement(BaseReaderBlock, blockData)
  }

  // For blocks that need wrapper
  const blockStyle = blockData.data?.style || {}
  const needsWrapper =
    Object.keys(blockStyle).length > 0 &&
    !['EmailLayout', 'Header', 'BottomSection'].includes(blockData.type)

  if (needsWrapper) {
    return React.createElement(
      ReaderBlockWrapper,
      { id, style: blockStyle },
      React.createElement(BaseReaderBlock, blockData)
    )
  }

  // Default case
  return React.createElement(BaseReaderBlock, blockData)
}

// Main Reader Component
function Reader({ document, rootBlockId }) {
  return React.createElement(
    ReaderContext.Provider,
    { value: document },
    React.createElement(ReaderBlock, { id: rootBlockId })
  )
}

// Render to Static Markup
function renderToStaticMarkup(document, { rootBlockId }) {
  try {
    return convertToEmailHTML(document)
  } catch (error) {
    console.error('Email conversion failed, using React fallback:', error)
    return (
      '<!DOCTYPE html>' +
      baseRenderToStaticMarkup(
        React.createElement(
          'html',
          null,
          React.createElement('body', null, React.createElement(Reader, { document, rootBlockId }))
        )
      )
    )
  }
}

// Exports
export {
  Reader,
  ReaderBlock,
  useReaderDocument,
  ReaderBlockSchema,
  ReaderDocumentSchema,
  renderToStaticMarkup
}