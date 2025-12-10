"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker" // Import DateRangePicker

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// Add DropdownMenu for select fields
import { Input } from "@/components/ui/input"

const RentForm = () => {
  const [formData, setFormData] = React.useState({
    language: "Italian",
    clientName: "",
    telephone: "",
    email: "",
    startDate: new Date(), // You can modify this to work with a range if needed
    lifePass: "",
    insurance: "Select your duration",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleDateRangeUpdate = (values: {
    range: { from: Date; to: Date | undefined }
  }) => {
    setFormData((prevData) => ({
      ...prevData,
      startDate: values.range.from, // Using the start date from the range
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form Submitted:", formData)
  }

  const handleChangeLanguage = (language: string) => {
    setFormData((prevData) => ({
      ...prevData,
      language,
    }))
  }

  const handleChangeInsurance = (insurance: string) => {
    setFormData((prevData) => ({
      ...prevData,
      insurance,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <label
          htmlFor="language"
          className="block text-sm font-medium text-gray-700"
        >
          Select Language
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              {formData.language}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleChangeLanguage("Italian")}>
              Italian
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleChangeLanguage("English")}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleChangeLanguage("Spanish")}>
              Spanish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <label
          htmlFor="clientName"
          className="block text-sm font-medium text-gray-700"
        >
          Client Name
        </label>
        <Input
          id="clientName"
          name="clientName"
          type="text"
          placeholder="Client Name"
          value={formData.clientName}
          onChange={handleChange}
        />
      </div>

      <div>
        <label
          htmlFor="telephone"
          className="block text-sm font-medium text-gray-700"
        >
          Telephone
        </label>
        <Input
          id="telephone"
          name="telephone"
          type="tel"
          placeholder="+1234567890"
          value={formData.telephone}
          onChange={handleChange}
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="">
        <label
          htmlFor="startDate"
          className="block text-sm font-medium text-gray-700"
        >
          Select Start Date
        </label>
        <div className="w-full">
          <DateRangePicker
            initialDateFrom={formData.startDate} // Initial start date for the range picker
            onUpdate={handleDateRangeUpdate} // Handle range updates
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="lifePass"
          className="block text-sm font-medium text-gray-700"
        >
          Available Products
        </label>
        <Input
          id="lifePass"
          name="lifePass"
          type="text"
          placeholder="LifePass"
          value={formData.lifePass}
          onChange={handleChange}
        />
      </div>

      <div>
        <label
          htmlFor="insurance"
          className="block text-sm font-medium text-gray-700"
        >
          Insurance
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              {formData.insurance}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleChangeInsurance("1 Month")}>
              1 Month
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleChangeInsurance("3 Months")}
            >
              3 Months
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex justify-between">
        <Button
          type="submit"
          size="lg"
          variant="outline"
          className="w-full rounded-lg border-2 py-4 text-base"
        >
          Submit
        </Button>
      </div>
    </form>
  )
}

export default RentForm
