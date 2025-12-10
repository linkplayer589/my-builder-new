"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DeleteOutlined,
  EditOutlined,
  EmailOutlined,
} from "@mui/icons-material"
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material"

interface EmailTemplate {
  id: string
  name: string
  description?: string
  category: string
  subject: string
  content: any
  isActive: boolean
  variables?: Array<{ key: string; description: string }>
}

export default function TemplatesPage({
  params,
}: {
  params: Promise<{ resortName: string }>
}) {
  const router = useRouter()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [resortName, setResortName] = useState<string>("")
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] =
    useState<EmailTemplate | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    params.then((unwrappedParams) => {
      setResortName(unwrappedParams.resortName)
    })
  }, [params])

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/email-templates")
      const data = await response.json()
      setTemplates(data.docs || [])
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (template: EmailTemplate) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return

    setDeleteLoading(templateToDelete.id)
    try {
      const response = await fetch(
        `/api/email-templates/${templateToDelete.id}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        setTemplates(
          templates.filter((template) => template.id !== templateToDelete.id)
        )
        setMessage("Template deleted successfully!")
        router.refresh()
      } else {
        setMessage("Error deleting template")
      }
    } catch (error) {
      console.error("Error deleting template:", error)
      setMessage("Error deleting template")
    } finally {
      setDeleteLoading(null)
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setTemplateToDelete(null)
  }

  const onCloseMessage = () => {
    setMessage(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">Loading templates...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <Typography variant="h4" component="h1" className="text-gray-900">
              Email Templates
            </Typography>
          </div>

          <Box className="grid gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="shadow-md">
                <CardContent className="p-6">
                  <Box className="mb-4 flex items-start justify-between">
                    <Box>
                      <Typography
                        variant="h6"
                        component="h2"
                        className="text-gray-900"
                      >
                        {template.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="mt-1 text-gray-600"
                      >
                        {template.description}
                      </Typography>
                    </Box>
                    <Box className="flex gap-1">
                      <Tooltip title="Edit template">
                        <IconButton
                          component={Link}
                          href={`/admin/${resortName}/template-builder/edit/${template.id}`}
                          size="small"
                          className="text-yellow-600 hover:bg-yellow-50"
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete template">
                        <IconButton
                          onClick={() => handleDeleteClick(template)}
                          size="small"
                          className="text-red-600 hover:bg-red-50"
                          disabled={deleteLoading === template.id}
                        >
                          {deleteLoading === template.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DeleteOutlined fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box className="mb-3 flex flex-wrap gap-2">
                    <Chip
                      label={template.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      icon={<EmailOutlined />}
                      label={`Subject: ${template.subject}`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                    {template.isActive ? (
                      <Chip
                        label="Active"
                        size="small"
                        color="success"
                        variant="filled"
                      />
                    ) : (
                      <Chip
                        label="Inactive"
                        size="small"
                        color="error"
                        variant="filled"
                      />
                    )}
                  </Box>

                  {template.variables && template.variables.length > 0 && (
                    <Box className="mt-3">
                      <Typography
                        variant="subtitle2"
                        className="mb-2 text-gray-700"
                      >
                        Available Variables:
                      </Typography>
                      <Box className="flex flex-wrap gap-1">
                        {template.variables.map((variable, index) => (
                          <Chip
                            key={index}
                            label={variable.key}
                            size="small"
                            variant="outlined"
                            className="bg-gray-100 text-gray-700"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}

            {templates.length === 0 && (
              <Box className="py-12 text-center">
                <Typography variant="h6" className="mb-4 text-gray-500">
                  No templates found
                </Typography>
                <Button
                  component={Link}
                  href={`/admin/${resortName}/template-builder/create`}
                  variant="contained"
                  color="primary"
                  size="large"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Your First Template
                </Button>
              </Box>
            )}
          </Box>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template "
            {templateToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteLoading !== null}
          >
            {deleteLoading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={message !== null}
        autoHideDuration={3000}
        onClose={onCloseMessage}
        message={message}
      />
    </div>
  )
}
