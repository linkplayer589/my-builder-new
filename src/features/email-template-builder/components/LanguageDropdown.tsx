"use client"

import React, { useRef, useState } from "react"
import { Check, ChevronDown, Globe } from "lucide-react"

import {
  Language,
  translateDocument,
  useCurrentLanguage,
  useIsTranslating,
} from "../documents/editor/EditorContext"

// import {
//   useCurrentLanguage,
//   useIsTranslating,
//   translateDocument
// } from '@/stores/editor-store';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
]

export function LanguageDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentLanguage = useCurrentLanguage()
  const isTranslating = useIsTranslating()

  const currentLanguageInfo = languages.find(
    (lang) => lang.code === currentLanguage
  )

  const handleLanguageChange = async (newLanguage: Language) => {
    if (newLanguage === currentLanguage) {
      setIsOpen(false)
      return
    }

    try {
      await translateDocument(newLanguage)
    } catch (error) {
      console.error("Language change failed:", error)
      // You might want to show a toast notification here
    } finally {
      setIsOpen(false)
    }
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex w-full justify-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 transition-colors duration-200 hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTranslating}
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <span className="text-lg">{currentLanguageInfo?.flag}</span>
          <span className="hidden sm:inline">{currentLanguageInfo?.name}</span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors duration-150 hover:bg-gray-100 ${
                  currentLanguage === language.code
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                }`}
                onClick={() => handleLanguageChange(language.code)}
              >
                <span className="mr-3 text-lg">{language.flag}</span>
                <span className="flex-1">{language.name}</span>
                {currentLanguage === language.code && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isTranslating && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-white bg-opacity-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
            Translating...
          </div>
        </div>
      )}
    </div>
  )
}
