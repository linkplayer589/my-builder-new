import React from "react"
import {
  AccountCircleOutlined,
  BallotOutlined,
  Crop32Outlined,
  HMobiledataOutlined,
  HorizontalRuleOutlined,
  HtmlOutlined,
  ImageOutlined,
  LibraryAddOutlined,
  NotesOutlined,
  SmartButtonOutlined,
  ViewColumnOutlined,
  ViewHeadlineOutlined,
} from "@mui/icons-material"

import { TEditorBlock } from "../../../../editor/core"

type TButtonProps = {
  label: string
  icon: JSX.Element
  block: () => TEditorBlock
}
export const BUTTONS: TButtonProps[] = [
  // {
  //   label: "Canvas Container",
  //   icon: <CropFreeOutlined />,
  //   block: () => ({
  //     type: "CanvasContainer",
  //     data: {
  //       childrenIds: [], // Move childrenIds here, not inside props
  //       props: {
  //         // props should only contain position and zIndex
  //         position: { x: 0, y: 0 },
  //         zIndex: 1,
  //       },
  //       style: {
  //         padding: { top: 16, bottom: 16, left: 24, right: 24 },
  //       },
  //     },
  //   }),
  // },
  {
    label: "Heading",
    icon: <HMobiledataOutlined />,
    block: () => ({
      type: "Heading",
      data: {
        props: { text: "Hello friend" },
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
      },
    }),
  },
  {
    label: "Text",
    icon: <NotesOutlined />,
    block: () => ({
      type: "Text",
      data: {
        props: { text: "My new text block" },
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
          fontWeight: "normal",
        },
      },
    }),
  },

  {
    label: "Button",
    icon: <SmartButtonOutlined />,
    block: () => ({
      type: "Button",
      data: {
        props: {
          text: "Button",
          url: "https://www.usewaypoint.com",
        },
        style: { padding: { top: 16, bottom: 16, left: 24, right: 24 } },
      },
    }),
  },
  {
    label: "Image",
    icon: <ImageOutlined />,
    block: () => ({
      type: "Image",
      data: {
        props: {
          url: "https://assets.usewaypoint.com/sample-image.jpg",
          alt: "Sample product",
          contentAlignment: "middle",
          linkHref: null,
        },
        style: { padding: { top: 16, bottom: 16, left: 24, right: 24 } },
      },
    }),
  },
  {
    label: "Avatar",
    icon: <AccountCircleOutlined />,
    block: () => ({
      type: "Avatar",
      data: {
        props: {
          imageUrl: "https://ui-avatars.com/api/?size=128",
          shape: "circle",
        },
        style: { padding: { top: 16, bottom: 16, left: 24, right: 24 } },
      },
    }),
  },
  {
    label: "Divider",
    icon: <HorizontalRuleOutlined />,
    block: () => ({
      type: "Divider",
      data: {
        style: { padding: { top: 16, right: 0, bottom: 16, left: 0 } },
        props: {
          lineColor: "#CCCCCC",
        },
      },
    }),
  },
  {
    label: "Spacer",
    icon: <Crop32Outlined />,
    block: () => ({
      type: "Spacer",
      data: {},
    }),
  },
  {
    label: "Html",
    icon: <HtmlOutlined />,
    block: () => ({
      type: "Html",
      data: {
        props: { contents: "<strong>Hello world</strong>" },
        style: {
          fontSize: 16,
          textAlign: null,
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
      },
    }),
  },
  {
    label: "Columns",
    icon: <ViewColumnOutlined />,
    block: () => ({
      type: "ColumnsContainer",
      data: {
        props: {
          columnsGap: 16,
          columnsCount: 3,
          columns: [
            { childrenIds: [] },
            { childrenIds: [] },
            { childrenIds: [] },
          ],
        },
        style: { padding: { top: 16, bottom: 16, left: 24, right: 24 } },
      },
    }),
  },
  {
    label: "Container",
    icon: <LibraryAddOutlined />,
    block: () => ({
      type: "Container",
      data: {
        style: { padding: { top: 16, bottom: 16, left: 24, right: 24 } },
      },
    }),
  },
  {
    label: "Header Section",
    icon: <ViewHeadlineOutlined />,
    block: () => ({
      type: "Header",
      data: {
        props: {
          headingText: "You’re going to *|ResortName|*!",
          logoUrl:
            "https://mountain-technologies-lifepass.b-cdn.net/Mountain%20Technologies/Email%20Templates/Headers/logo.png",
          backgroundColor: "#f5f5f5",
          headingTextAlign: "center",
          headingVerticalAlignment: "bottom",
          backgroundImage:
            "https://mountain-technologies-lifepass.b-cdn.net/Mountain%20Technologies/Email%20Templates/Headers/header-bg.jpg",
        },
        style: {
          padding: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
    }),
  },
  {
    label: "Bottom Section",
    icon: <BallotOutlined />,
    block: () => ({
      type: "BottomSection",
      data: {
        props: {
          primaryText:
            "LifePass is designed to keep you connected and safe on the slopes. We hope you enjoy your holiday with this added peace of mind  in your pocket!",
          secondaryText: "See you on the mountain!",
          backgroundColor: "#f5f5f5",
          backgroundImage:
            "https://mountain-technologies-lifepass.b-cdn.net/Mountain%20Technologies/Email%20Templates/Headers/bottom-section-bg.jpg",
          logoUrl:
            "https://mountain-technologies-lifepass.b-cdn.net/Mountain%20Technologies/Email%20Templates/Headers/lifepass-icon.png",
          logoWidth: 36,
          logoHeight: 40,
          primaryFontSize: 16,
          primaryTextAlign: "center",
          primaryVerticalAlignment: "bottom",
          primaryFontWeight: "600",
          primaryTextColor: "#333F5F",
          secondaryTextColor: "#333F5F",
          secondaryFontSize: 16,
          secondaryFontWeight: "400",
          secondaryVerticalAlignment: "middle",
          secondaryTextAlign: "center",
          headerHeight: 256,
          textSpacing: 16,
        },
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
      },
    }),
  },

  // { label: 'ProgressBar', icon: <ProgressBarOutlined />, block: () => ({}) },
  // { label: 'LoopContainer', icon: <ViewListOutlined />, block: () => ({}) },
]
