import React, { useState } from "react"
import { Check, LanguageOutlined } from "@mui/icons-material"
import {
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material"

import {
  Language,
  translateDocument,
  useCurrentLanguage,
  useIsTranslating,
} from "../documents/editor/EditorContext"

export function TranslationButton() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const isTranslating = useIsTranslating()
  const currentLanguage = useCurrentLanguage()

  const languages: { code: Language; name: string }[] = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
  ]

  const currentLanguageInfo = languages.find(
    (lang) => lang.code === currentLanguage
  )

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLanguageChange = async (newLanguage: Language) => {
    if (newLanguage === currentLanguage) {
      handleClose()
      return
    }

    try {
      await translateDocument(newLanguage)
    } catch (error) {
      console.error("Language change failed:", error)
    } finally {
      handleClose()
    }
  }

  return (
    <>
      <Tooltip title="Change Language">
        <Button
          variant="outlined"
          startIcon={<LanguageOutlined />}
          endIcon={isTranslating ? <CircularProgress size={16} /> : undefined}
          onClick={handleClick}
          disabled={isTranslating}
          sx={{
            minWidth: "auto",
            px: 2,
          }}
        >
          {currentLanguageInfo?.name}
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 120,
          },
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            selected={currentLanguage === language.code}
            onClick={() => handleLanguageChange(language.code)}
            disabled={isTranslating}
          >
            {language.name}
            {currentLanguage === language.code && (
              <Check
                sx={{
                  ml: 1,
                  fontSize: 16,
                  color: "primary.main",
                }}
              />
            )}
          </MenuItem>
        ))}
      </Menu>

      {/* Loading overlay for the entire editor */}
      {isTranslating && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
          <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-lg">
            <CircularProgress size={24} />
            <span className="text-gray-700">
              Translating to {currentLanguage}...
            </span>
          </div>
        </div>
      )}
    </>
  )
}
