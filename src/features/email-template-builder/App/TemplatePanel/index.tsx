// import React, { useState } from "react";
// import { MonitorOutlined, PhoneIphoneOutlined } from "@mui/icons-material";
// import {
//   Box,
//   Button,
//   Stack,
//   SxProps,
//   ToggleButton,
//   ToggleButtonGroup,
//   Tooltip,
// } from "@mui/material";
// import { Reader } from "@usewaypoint/email-builder";

// import EditorBlock from "../../documents/editor/EditorBlock";
// import {
//   setSelectedScreenSize,
//   useDocument,
//   useSelectedMainTab,
//   useSelectedScreenSize,
// } from "../../documents/editor/EditorContext";
// import ToggleInspectorPanelButton from "../InspectorDrawer/ToggleInspectorPanelButton";
// import ToggleSamplesPanelButton from "../SamplesDrawer/ToggleSamplesPanelButton";
// import DownloadJson from "./DownloadJson";
// import HtmlPanel from "./HtmlPanel";
// import ImportJson from "./ImportJson";
// import JsonPanel from "./JsonPanel";
// import MainTabsGroup from "./MainTabsGroup";
// import ShareButton from "./ShareButton";
// import SaveTemplateButton from "./SaveTemplateButton";

// export default function TemplatePanel() {
//   const [showTemplates, setShowTemplates] = useState(false);
//   const document = useDocument();
//   const selectedMainTab = useSelectedMainTab();
//   const selectedScreenSize = useSelectedScreenSize();

//   let mainBoxSx: SxProps = {
//     height: "100%",
//   };
//   if (selectedScreenSize === "mobile") {
//     mainBoxSx = {
//       ...mainBoxSx,
//       margin: "32px auto",
//       width: 370,
//       height: 800,
//       boxShadow:
//         "rgba(33, 36, 67, 0.04) 0px 10px 20px, rgba(33, 36, 67, 0.04) 0px 2px 6px, rgba(33, 36, 67, 0.04) 0px 0px 1px",
//     };
//   }

//   const handleScreenSizeChange = (_: unknown, value: unknown) => {
//     switch (value) {
//       case "mobile":
//       case "desktop":
//         setSelectedScreenSize(value);
//         return;
//       default:
//         setSelectedScreenSize("desktop");
//     }
//   };

//   const renderMainPanel = () => {
//     switch (selectedMainTab) {
//       case "editor":
//         return (
//           <Box sx={mainBoxSx}>
//             <EditorBlock id="root" />
//           </Box>
//         );
//       case "preview":
//         return (
//           <Box sx={mainBoxSx}>
//             <Reader document={document} rootBlockId="root" />
//           </Box>
//         );
//       case "html":
//         return <HtmlPanel />;
//       case "json":
//         return <JsonPanel />;
//     }
//   };

//   return (
//     <>
//       <Stack
//         sx={{
//           height: 49,
//           borderBottom: 1,
//           borderColor: "divider",
//           backgroundColor: "white",
//           position: "sticky",
//           top: 0,
//           zIndex: "appBar",
//           px: 1,
//         }}
//         direction="row"
//         justifyContent="space-between"
//         alignItems="center"
//       >
//         {/* <ToggleSamplesPanelButton /> */}

//         <Stack
//           px={2}
//           direction="row"
//           gap={2}
//           width="100%"
//           justifyContent="space-between"
//           alignItems="center"
//         >
//           <Stack direction="row" spacing={2}>
//             <MainTabsGroup />
//           </Stack>
//           <Stack direction="row" spacing={2}>
//             <DownloadJson />
//             <ImportJson />
//             <ToggleButtonGroup
//               value={selectedScreenSize}
//               exclusive
//               size="small"
//               onChange={handleScreenSizeChange}
//             >
//               <ToggleButton value="desktop">
//                 <Tooltip title="Desktop view">
//                   <MonitorOutlined fontSize="small" />
//                 </Tooltip>
//               </ToggleButton>
//               <ToggleButton value="mobile">
//                 <Tooltip title="Mobile view">
//                   <PhoneIphoneOutlined fontSize="small" />
//                 </Tooltip>
//               </ToggleButton>
//             </ToggleButtonGroup>
//             <ShareButton />
//             <SaveTemplateButton />
//           </Stack>
//         </Stack>
//         <ToggleInspectorPanelButton />
//       </Stack>
//       <Box
//         sx={{ height: "calc(100vh - 49px)", overflow: "auto", minWidth: 370 }}
//       >
//         {renderMainPanel()}
//       </Box>
//     </>
//   );
// }

import React, { useState } from "react"
import { MonitorOutlined, PhoneIphoneOutlined } from "@mui/icons-material"
import {
  Box,
  Button,
  Stack,
  SxProps,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material"

import { Reader } from "../../@usewaypoint/email-builder/dist/index.mjs"
import { TranslationButton } from "../../components/LanguageDropdownUse"
// import { Reader } from "@usewaypoint/email-builder"

import EditorBlock from "../../documents/editor/EditorBlock"
import {
  setSelectedScreenSize,
  useDocument,
  useSelectedMainTab,
  useSelectedScreenSize,
} from "../../documents/editor/EditorContext"
import ToggleInspectorPanelButton from "../InspectorDrawer/ToggleInspectorPanelButton"
import ToggleSamplesPanelButton from "../SamplesDrawer/ToggleSamplesPanelButton"
import DownloadJson from "./DownloadJson"
import HtmlPanel from "./HtmlPanel"
import ImportJson from "./ImportJson"
import JsonPanel from "./JsonPanel"
import MainTabsGroup from "./MainTabsGroup"
import SaveTemplateButton from "./SaveTemplateButton"
import ShareButton from "./ShareButton"

// Reuse the same transformation function from HtmlPanel
function transformDocumentForHtml(document: any): any {
  const transformed: any = { ...document }

  Object.entries(document).forEach(([blockId, block]) => {
    if ((block as any)?.type === "CanvasContainer") {
      // Convert CanvasContainer to a regular Container for HTML output
      transformed[blockId] = {
        type: "Container",
        data: {
          ...(block as any).data,
          // Remove position props that HTML renderer doesn't understand
          props: {
            childrenIds: (block as any).data.childrenIds,
          },
        },
      }
    }
  })

  return transformed
}

export default function TemplatePanel() {
  const [showTemplates, setShowTemplates] = useState(false)
  const document = useDocument()
  const selectedMainTab = useSelectedMainTab()
  const selectedScreenSize = useSelectedScreenSize()

  let mainBoxSx: SxProps = {
    height: "100%",
  }
  if (selectedScreenSize === "mobile") {
    mainBoxSx = {
      ...mainBoxSx,
      margin: "32px auto",
      width: 370,
      height: 800,
      boxShadow:
        "rgba(33, 36, 67, 0.04) 0px 10px 20px, rgba(33, 36, 67, 0.04) 0px 2px 6px, rgba(33, 36, 67, 0.04) 0px 0px 1px",
    }
  }

  const handleScreenSizeChange = (_: unknown, value: unknown) => {
    switch (value) {
      case "mobile":
      case "desktop":
        setSelectedScreenSize(value)
        return
      default:
        setSelectedScreenSize("desktop")
    }
  }

  const renderMainPanel = () => {
    switch (selectedMainTab) {
      case "editor":
        return (
          <Box sx={mainBoxSx}>
            <EditorBlock id="root" />
          </Box>
        )
      case "preview":
        // Transform document for Reader to handle CanvasContainer
        const transformedDocument = transformDocumentForHtml(document)
        return (
          <Box sx={mainBoxSx}>
            <Reader document={transformedDocument} rootBlockId="root" />
          </Box>
        )
      case "html":
        return <HtmlPanel />
      case "json":
        return <JsonPanel />
    }
  }

  return (
    <>
      <Stack
        sx={{
          height: 49,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "white",
          position: "sticky",
          top: 0,
          zIndex: "appBar",
          px: 1,
        }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        {/* <ToggleSamplesPanelButton /> */}

        <Stack
          px={2}
          direction="row"
          gap={2}
          width="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={2}>
            <MainTabsGroup />
            <TranslationButton />
          </Stack>
          <Stack direction="row" spacing={2}>
            <DownloadJson />
            <ImportJson />
            <ToggleButtonGroup
              value={selectedScreenSize}
              exclusive
              size="small"
              onChange={handleScreenSizeChange}
            >
              <ToggleButton value="desktop">
                <Tooltip title="Desktop view">
                  <MonitorOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="mobile">
                <Tooltip title="Mobile view">
                  <PhoneIphoneOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            <ShareButton />
            <SaveTemplateButton />
          </Stack>
        </Stack>
        <ToggleInspectorPanelButton />
      </Stack>
      <Box
        sx={{ height: "calc(100vh - 49px)", overflow: "auto", minWidth: 370 }}
      >
        {renderMainPanel()}
      </Box>
    </>
  )
}
