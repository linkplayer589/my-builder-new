import React, { useState } from "react"
import { RefreshOutlined, UpdateOutlined } from "@mui/icons-material"
import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Snackbar,
  TextField,
  Tooltip,
} from "@mui/material"

import { useDocument } from "../../documents/editor/EditorContext"
import { generateHtmlFromDocument } from "../../utils/htmlGenerator"

interface UpdateTemplateButtonProps {
  templateId: string
  currentTemplate: any
  onUpdate?: () => void
}

export default function UpdateTemplateButton({
  templateId,
  currentTemplate,
  onUpdate,
}: UpdateTemplateButtonProps) {
  const document = useDocument()
  const [message, setMessage] = useState<string | null>(null)

  // Modal state
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: currentTemplate?.name || "",
    slug: currentTemplate?.slug || "",
    description: currentTemplate?.description || "",
    subject: currentTemplate?.subject || "",
    category: currentTemplate?.category || "marketing",
    isActive: currentTemplate?.isActive ?? true,
  })

  // Loading state for Update button
  const [loading, setLoading] = useState(false)

  // Open modal
  const handleClickOpen = () => {
    setFormData({
      name: currentTemplate?.name || "",
      slug: currentTemplate?.slug || "",
      description: currentTemplate?.description || "",
      subject: currentTemplate?.subject || "",
      category: currentTemplate?.category || "marketing",
      isActive: currentTemplate?.isActive ?? true,
    })
    setOpen(true)
  }

  // Close modal
  const handleClose = () => {
    setOpen(false)
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Handle form submission
  const handleUpdate = async () => {
    setLoading(true)
    try {
      const htmlContent = generateHtmlFromDocument(document)

      const response = await fetch(`/api/email-templates/${templateId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          Slug: formData.slug,
          description: formData.description,
          subject: formData.subject,
          category: formData.category,
          templateDocument: document,
          html: htmlContent,
          isActive: formData.isActive,
        }),
      })

      if (response.ok) {
        setMessage("Template updated successfully!")
        if (onUpdate) onUpdate()
      } else {
        setMessage("Failed to update template")
      }
      handleClose()
    } catch (error) {
      setMessage("Error updating template")
      console.error("Update error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Close the snackbar
  const onClose = () => {
    setMessage(null)
  }

  return (
    <>
      <IconButton onClick={handleClickOpen}>
        <Tooltip title="Update template in database">
          <RefreshOutlined fontSize="small" />
        </Tooltip>
      </IconButton>

      {/* Modal for template inputs */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Template</DialogTitle>
        <DialogContent>
          <TextField
            label="Template Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            helperText="Unique identifier for API calls"
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
            margin="normal"
            select
            SelectProps={{ native: true }}
          >
            <option value="welcome">Welcome</option>
            <option value="notification">Notification</option>
            <option value="marketing">Marketing</option>
            <option value="transactional">Transactional</option>
            <option value="alert">Alert</option>
          </TextField>

          <TextField
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isActive}
                onChange={handleChange}
                name="isActive"
                color="primary"
              />
            }
            label="Active Template"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={message !== null}
        autoHideDuration={3000}
        onClose={onClose}
        message={message}
      />
    </>
  )
}
