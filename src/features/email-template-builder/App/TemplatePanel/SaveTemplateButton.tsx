// import React, { useState } from "react"
// import { SaveOutlined } from "@mui/icons-material"
// import {
//   Button,
//   Checkbox,
//   CircularProgress,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControlLabel,
//   IconButton,
//   Snackbar,
//   TextField,
//   Tooltip,
// } from "@mui/material"

// import { useDocument } from "../../documents/editor/EditorContext"

// export default function SaveTemplateButton() {
//   const document = useDocument()
//   const [message, setMessage] = useState<string | null>(null)

//   // Modal state
//   const [open, setOpen] = useState(false)
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     subject: "", // Added subject field
//     category: "marketing", // default value for category
//     isActive: true, // default to active
//   })

//   // Loading state for Save button
//   const [loading, setLoading] = useState(false)

//   // Open modal
//   const handleClickOpen = () => {
//     setOpen(true)
//   }

//   // Close modal
//   const handleClose = () => {
//     setOpen(false)
//   }

//   // Handle input changes
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value, type, checked } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }))
//   }

//   // Handle form submission
//   const handleSave = async () => {
//     setLoading(true) // Start loading
//     try {
//       const response = await fetch("/api/email-templates", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: formData.name,
//           description: formData.description,
//           subject: formData.subject, // Added subject field to the body
//           category: formData.category,
//           templateDocument: document,
//           isActive: formData.isActive,
//         }),
//       })

//       if (response.ok) {
//         setMessage("Template saved successfully to database!")
//       } else {
//         setMessage("Failed to save template")
//       }
//       handleClose() // Close the modal after saving
//     } catch (error) {
//       setMessage("Error saving template")
//       console.error("Save error:", error)
//     } finally {
//       setLoading(false) // Stop loading
//     }
//   }

//   // Close the snackbar
//   const onClose = () => {
//     setMessage(null)
//   }

//   return (
//     <>
//       <IconButton onClick={handleClickOpen}>
//         <Tooltip title="Save template to database">
//           <SaveOutlined fontSize="small" />
//         </Tooltip>
//       </IconButton>

//       {/* Modal for template inputs */}
//       <Dialog open={open} onClose={handleClose}>
//         <DialogTitle>Save Template</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="Template Name"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             fullWidth
//             margin="normal"
//             required
//           />
//           <TextField
//             label="Description"
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//             fullWidth
//             margin="normal"
//           />
//           <TextField
//             label="Category"
//             name="category"
//             value={formData.category}
//             onChange={handleChange}
//             fullWidth
//             margin="normal"
//             select
//             SelectProps={{ native: true }}
//           >
//             <option value="welcome">Welcome</option>
//             <option value="notification">Notification</option>
//             <option value="marketing">Marketing</option>
//             <option value="transactional">Transactional</option>
//             <option value="alert">Alert</option>
//           </TextField>

//           {/* Subject Input */}
//           <TextField
//             label="Subject"
//             name="subject"
//             value={formData.subject}
//             onChange={handleChange}
//             fullWidth
//             margin="normal"
//             required
//           />

//           {/* Active Checkbox */}
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={formData.isActive}
//                 onChange={handleChange}
//                 name="isActive"
//                 color="primary"
//               />
//             }
//             label="Active Template"
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose} color="primary">
//             Cancel
//           </Button>
//           <Button
//             onClick={handleSave}
//             color="primary"
//             disabled={loading} // Disable if loading
//           >
//             {loading ? <CircularProgress size={24} /> : "Save"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar for feedback */}
//       <Snackbar
//         anchorOrigin={{ vertical: "top", horizontal: "center" }}
//         open={message !== null}
//         autoHideDuration={3000}
//         onClose={onClose}
//         message={message}
//       />
//     </>
//   )
// }

import React, { useEffect, useState } from "react"
import { SaveOutlined } from "@mui/icons-material"
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
  MenuItem,
  Snackbar,
  TextField,
  Tooltip,
} from "@mui/material"

import { useDocument } from "../../documents/editor/EditorContext"
import { generateHtmlFromDocument } from "../../utils/htmlGenerator"

interface EmailTemplate {
  id: string
  name: string
  description?: string
  category: string
  subject: string
  content: any
  html: any
  isActive: boolean
}

export default function SaveTemplateButton() {
  const document = useDocument()
  const [message, setMessage] = useState<string | null>(null)
  const [existingTemplates, setExistingTemplates] = useState<EmailTemplate[]>(
    []
  )

  // Modal state
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    subject: "",
    category: "marketing",
    isActive: true,
  })

  // Loading state for Save button
  const [loading, setLoading] = useState(false)

  // Fetch existing templates when component mounts
  useEffect(() => {
    fetchExistingTemplates()
  }, [])

  const fetchExistingTemplates = async () => {
    try {
      const response = await fetch("/api/email-templates")
      const data = await response.json()
      setExistingTemplates(data.docs || [])
    } catch (error) {
      console.error("Error fetching templates:", error)
    }
  }

  // Open modal
  const handleClickOpen = () => {
    setOpen(true)
  }

  // Close modal and reset form
  const handleClose = () => {
    setFormData({
      id: "",
      name: "",
      slug: "",
      description: "",
      subject: "",
      category: "marketing",
      isActive: true,
    })
    setOpen(false)
  }

  // Handle template selection from dropdown
  const handleTemplateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedName = e.target.value
    if (selectedName === "") {
      // New template
      setFormData({
        id: "",
        name: "",
        slug: "",
        description: "",
        subject: "",
        category: "marketing",
        isActive: true,
      })
    } else {
      // Existing template - populate form
      const existingTemplate = existingTemplates.find(
        (t) => t.name === selectedName
      )
      if (existingTemplate) {
        setFormData({
          id: existingTemplate.id,
          name: existingTemplate.name,
          slug: existingTemplate.id,
          description: existingTemplate.description || "",
          subject: existingTemplate.subject,
          category: existingTemplate.category,
          isActive: existingTemplate.isActive,
        })
      }
    }
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Check if template name already exists
  const isExistingTemplate = () => {
    return existingTemplates.some(
      (template) =>
        template.name.toLowerCase() === formData.name.toLowerCase() &&
        template.id !== formData.id
    )
  }

  // Handle form submission
  const handleSave = async () => {
    // Check for duplicate name (if creating new template)
    if (!formData.id && isExistingTemplate()) {
      setMessage(
        "A template with this name already exists. Please choose a different name."
      )
      return
    }

    setLoading(true)
    try {
      // Generate HTML from the current document
      const htmlContent = generateHtmlFromDocument(document)

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        subject: formData.subject,
        category: formData.category,
        templateDocument: document,
        html: htmlContent,
        isActive: formData.isActive,
      }

      let response
      if (formData.id) {
        // Update existing template
        response = await fetch(`/api/email-templates/${formData.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
      } else {
        // Create new template
        response = await fetch("/api/email-templates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
      }

      if (response.ok) {
        const action = formData.id ? "updated" : "saved"
        setMessage(`Template ${action} successfully!`)
        // Refresh templates list
        await fetchExistingTemplates()
        handleClose()
      } else {
        setMessage("Failed to save template")
      }
    } catch (error) {
      setMessage("Error saving template")
      console.error("Save error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Close the snackbar
  const onClose = () => {
    setMessage(null)
  }

  const isFormValid =
    formData.name.trim() !== "" && formData.subject.trim() !== ""

  return (
    <>
      <IconButton onClick={handleClickOpen}>
        <Tooltip title="Save or update template">
          <SaveOutlined fontSize="small" />
        </Tooltip>
      </IconButton>

      {/* Modal for template inputs */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {formData.id ? "Update Template" : "Save Template"}
        </DialogTitle>
        <DialogContent>
          {/* Template Selection Dropdown */}
          <TextField
            label="Select Existing Template (Optional)"
            name="templateSelect"
            value={formData.name}
            onChange={handleTemplateSelect}
            fullWidth
            margin="normal"
            select
            SelectProps={{ native: false }}
          >
            <MenuItem value="">
              <em>Create New Template</em>
            </MenuItem>
            {existingTemplates.map((template) => (
              <MenuItem key={template.id} value={template.name}>
                {template.name} ({template.category})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Template Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={isExistingTemplate()}
            helperText={
              isExistingTemplate()
                ? "A template with this name already exists. This will update the existing template."
                : "Name for your template"
            }
          />

          <TextField
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            helperText="Unique identifier for API calls (e.g., kiosk-rental-confirmation)"
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />

          <TextField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
            margin="normal"
            select
          >
            <MenuItem value="welcome">Welcome</MenuItem>
            <MenuItem value="notification">Notification</MenuItem>
            <MenuItem value="marketing">Marketing</MenuItem>
            <MenuItem value="transactional">Transactional</MenuItem>
            <MenuItem value="alert">Alert</MenuItem>
          </TextField>

          {/* Subject Input */}
          <TextField
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          {/* Active Checkbox */}
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
          <Button
            onClick={handleSave}
            color="primary"
            disabled={loading || !isFormValid}
            variant="contained"
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : formData.id ? (
              "Update Template"
            ) : (
              "Save Template"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
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
