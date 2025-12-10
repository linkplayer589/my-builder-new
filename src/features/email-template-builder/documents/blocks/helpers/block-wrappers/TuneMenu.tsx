import React, { useState } from "react"
import {
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@mui/icons-material"
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material"
import { SxProps } from "@mui/material/styles"

import { TEditorBlock } from "../../../editor/core"
import {
  resetDocument,
  setDocument,
  setSelectedBlockId,
  useDocument,
} from "../../../editor/EditorContext"
import { ColumnsContainerProps } from "../../ColumnsContainer/ColumnsContainerPropsSchema"

const sx: SxProps = {
  position: "absolute",
  top: 0,
  left: -56,
  borderRadius: 64,
  paddingX: 0.5,
  paddingY: 1,
  zIndex: "fab",
}

type Props = {
  blockId: string
}
export default function TuneMenu({ blockId }: Props) {
  const document = useDocument()
  const [positionDialogOpen, setPositionDialogOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const currentBlock = document[blockId]

  const handlePositionUpdate = () => {
    const updatedBlock = {
      ...currentBlock,
      data: {
        ...(currentBlock as any).data,
        props: {
          ...(currentBlock as any).data.props,
          position: position,
        },
      },
    }

    setDocument({
      [blockId]: updatedBlock as any,
    })
    setPositionDialogOpen(false)
  }

  const handleDeleteClick = () => {
    const filterChildrenIds = (childrenIds: string[] | null | undefined) => {
      if (!childrenIds) {
        return childrenIds
      }
      return childrenIds.filter((f) => f !== blockId)
    }
    const nDocument: typeof document = { ...document }
    for (const [id, b] of Object.entries(nDocument)) {
      const block = b as TEditorBlock
      if (id === blockId) {
        continue
      }
      switch (block.type) {
        case "EmailLayout":
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              childrenIds: filterChildrenIds(block.data.childrenIds),
            },
          }
          break
        case "Container":
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              props: {
                ...(block.data as any).props,
                childrenIds: filterChildrenIds(
                  (block.data.props as any)?.childrenIds
                ),
              },
            },
          }
          break
        // case "ColumnsContainer":
        //   nDocument[id] = {
        //     type: "ColumnsContainer",
        //     data: {
        //       style: block.data.style,
        //       props: {
        //         ...(block.data as any).props,
        //         columns: (block.data.props as any)?.columns?.map((c: any) => ({
        //           childrenIds: filterChildrenIds(c.childrenIds),
        //         })),
        //       },
        //     } as ColumnsContainerProps,
        //   }
        //   break
        default:
          nDocument[id] = block
      }
    }
    delete nDocument[blockId]
    resetDocument(nDocument)
  }

  const handleMoveClick = (direction: "up" | "down") => {
    const moveChildrenIds = (ids: string[] | null | undefined) => {
      if (!ids) {
        return ids
      }
      const index = ids.indexOf(blockId)
      if (index < 0) {
        return ids
      }
      const childrenIds = [...ids]
      if (direction === "up" && index > 0) {
        ;[childrenIds[index] as any, childrenIds[index - 1] as any] = [
          childrenIds[index - 1],
          childrenIds[index],
        ]
      } else if (direction === "down" && index < childrenIds.length - 1) {
        ;[childrenIds[index] as any, childrenIds[index + 1] as any] = [
          childrenIds[index + 1],
          childrenIds[index],
        ]
      }
      return childrenIds
    }
    const nDocument: typeof document = { ...document }
    for (const [id, b] of Object.entries(nDocument)) {
      const block = b as TEditorBlock
      if (id === blockId) {
        continue
      }
      switch (block.type) {
        case "EmailLayout":
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              childrenIds: moveChildrenIds(block.data.childrenIds),
            },
          }
          break
        case "Container":
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              props: {
                ...(block.data as any).props,
                childrenIds: moveChildrenIds(
                  (block.data.props as any)?.childrenIds
                ),
              },
            },
          }
          break
        case "ColumnsContainer":
          nDocument[id] = {
            type: "ColumnsContainer",
            data: {
              style: block.data.style,
              props: {
                ...(block.data as any).props,
                columns: (block.data.props as any)?.columns?.map((c: any) => ({
                  childrenIds: moveChildrenIds(c.childrenIds),
                })),
              },
            } as ColumnsContainerProps,
          }
          break
        default:
          nDocument[id] = block
      }
    }

    resetDocument(nDocument)
    setSelectedBlockId(blockId)
  }

  return (
    <>
      <Paper sx={sx} onClick={(ev: any) => ev.stopPropagation()}>
        <Stack>
          <Tooltip title="Edit Position" placement="left-start">
            <IconButton
              onClick={() => {
                setPosition(
                  (currentBlock?.data as any)?.props?.position || { x: 0, y: 0 }
                )
                setPositionDialogOpen(true)
              }}
              sx={{ color: "text.primary" }}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Move up" placement="left-start">
            <IconButton
              onClick={() => handleMoveClick("up")}
              sx={{ color: "text.primary" }}
            >
              <ArrowUpwardOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Move down" placement="left-start">
            <IconButton
              onClick={() => handleMoveClick("down")}
              sx={{ color: "text.primary" }}
            >
              <ArrowDownwardOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" placement="left-start">
            <IconButton
              onClick={handleDeleteClick}
              sx={{ color: "text.primary" }}
            >
              <DeleteOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      <Dialog
        open={positionDialogOpen}
        onClose={() => setPositionDialogOpen(false)}
      >
        <Box sx={{ p: 2 }}>
          <TextField
            label="X Position"
            type="number"
            value={position.x}
            onChange={(e: any) =>
              setPosition({ ...position, x: parseInt(e.target.value) || 0 })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Y Position"
            type="number"
            value={position.y}
            onChange={(e: any) =>
              setPosition({ ...position, y: parseInt(e.target.value) || 0 })
            }
            fullWidth
            margin="normal"
          />
          <Button onClick={handlePositionUpdate} variant="contained">
            Update Position
          </Button>
        </Box>
      </Dialog>
    </>
  )
}
