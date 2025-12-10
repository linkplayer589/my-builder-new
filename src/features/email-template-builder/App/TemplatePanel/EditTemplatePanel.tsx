import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MonitorOutlined, PhoneIphoneOutlined } from "@mui/icons-material"
import {
  Box,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material"
import { SxProps, useTheme } from "@mui/material/styles"

import { Reader } from "../../@usewaypoint/email-builder/dist/index.mjs"
import { TranslationButton } from "../../components/LanguageDropdownUse"
import EditorBlock from "../../documents/editor/EditorBlock"
import {
  resetDocument,
  setSelectedScreenSize,
  useDocument,
  useInspectorDrawerOpen,
  useSamplesDrawerOpen,
  useSelectedMainTab,
  useSelectedScreenSize,
} from "../../documents/editor/EditorContext"
import InspectorDrawer, { INSPECTOR_DRAWER_WIDTH } from "../InspectorDrawer"
import ToggleInspectorPanelButton from "../InspectorDrawer/ToggleInspectorPanelButton"
import { SAMPLES_DRAWER_WIDTH } from "../SamplesDrawer"
import DownloadJson from "./DownloadJson"
import HtmlPanel from "./HtmlPanel"
import ImportJson from "./ImportJson"
import JsonPanel from "./JsonPanel"
import MainTabsGroup from "./MainTabsGroup"
import ShareButton from "./ShareButton"
import UpdateTemplateButton from "./UpdateTemplateButton"

function useDrawerTransition(
  cssProperty: "margin-left" | "margin-right",
  open: boolean
) {
  const { transitions } = useTheme()
  return transitions.create(cssProperty, {
    easing: !open ? transitions.easing.sharp : transitions.easing.easeOut,
    duration: !open
      ? transitions.duration.leavingScreen
      : transitions.duration.enteringScreen,
  })
}

export default function EditTemplatePanel() {
  const params = useParams()
  const templateId = params.id as string

  const [loading, setLoading] = useState(true)
  const [template, setTemplate] = useState<any>(null)
  const document = useDocument()
  const selectedMainTab = useSelectedMainTab()
  const selectedScreenSize = useSelectedScreenSize()

  const inspectorDrawerOpen = useInspectorDrawerOpen()
  const samplesDrawerOpen = useSamplesDrawerOpen()

  const marginLeftTransition = useDrawerTransition(
    "margin-left",
    samplesDrawerOpen
  )
  const marginRightTransition = useDrawerTransition(
    "margin-right",
    inspectorDrawerOpen
  )

  useEffect(() => {
    if (templateId) {
      loadTemplate()
    }
  }, [templateId])

  const loadTemplate = async () => {
    try {
      const response = await fetch(`/api/email-templates/${templateId}`)
      const data = await response.json()
      if (response.ok) {
        setTemplate(data.doc || data)
        // Load the template document into the editor
        resetDocument(data.doc?.templateDocument || data.templateDocument)
      }
    } catch (error) {
      console.error("Error loading template:", error)
    } finally {
      setLoading(false)
    }
  }

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
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          Loading template...
        </Box>
      )
    }

    switch (selectedMainTab) {
      case "editor":
        return (
          <Box sx={mainBoxSx}>
            <EditorBlock id="root" />
          </Box>
        )
      case "preview":
        return (
          <Box sx={mainBoxSx}>
            <Reader document={document as any} rootBlockId="root" />
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
      <InspectorDrawer />
      {/* <SamplesDrawer /> */}

      <Stack
        sx={{
          marginRight: inspectorDrawerOpen ? `${INSPECTOR_DRAWER_WIDTH}px` : 0,
          marginLeft: samplesDrawerOpen ? `${SAMPLES_DRAWER_WIDTH}px` : 0,
          transition: [marginLeftTransition, marginRightTransition].join(", "),
        }}
      >
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
          <Stack
            px={2}
            direction="row"
            gap={2}
            width="100%"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              {template && (
                <Tooltip title={`Editing: ${template.name}`}>
                  <Button size="small" variant="text">
                    {template.name}
                  </Button>
                </Tooltip>
              )}
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
              <UpdateTemplateButton
                templateId={templateId}
                currentTemplate={template}
                onUpdate={() => console.log("Template updated")}
              />
            </Stack>
          </Stack>
          <ToggleInspectorPanelButton />
        </Stack>
        <Box
          sx={{ height: "calc(100vh - 49px)", overflow: "auto", minWidth: 370 }}
        >
          {renderMainPanel()}
        </Box>
      </Stack>
    </>
  )
}
