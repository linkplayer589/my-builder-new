"use client"

import * as React from "react"
import { useResort } from "@/features/resorts"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { _toLocalDateString } from "@/lib/date-functions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Form, FormField } from "@/components/ui/form"
import { ApiKeyErrorBoundary } from "@/components/api-key-error-boundary"

import { DevicesArray } from "./create-new-order-devices-array"
import { EmailInput } from "./create-new-order-email-input"
import { LanguageSelect } from "./create-new-order-language-select"
import { NameInput } from "./create-new-order-name-input"
import { StartDatePicker } from "./create-new-order-start-date-picker"
import { TelephoneInput } from "./create-new-order-telephone-input"
import { checkDeviceStatus } from "../create-new-order-actions/check-device-status/action"
import { validateDeviceStatus } from "../create-new-order-actions/check-device-status/types"
import { getProducts } from "../create-new-order-actions/get-products/action"
import {
  type Catalog,
  type GetProductsAPIReturnType,
} from "../create-new-order-actions/get-products/types"

// Define the schema for the form validation
const FORM_SCHEMA = z.object({
  // Used to set user details
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  telephone: z.string().min(1, {
    message: "Please enter a valid phone number.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  languageCode: z.enum(["en", "it", "fr", "de"]).default("it"),
  // Used to set available products
  resortId: z.number(),
  startDate: z.date(),
  // Used to submit the order
  devices: z.array(
    z.object({
      deviceId: z.string(),
      productId: z.string(),
      consumerCategoryId: z.string(),
      insurance: z.boolean(),
    })
  ),
})
export type FORM_SCHEMA_TYPE = z.infer<typeof FORM_SCHEMA>

type Props = {
  orderData: FORM_SCHEMA_TYPE | undefined
  setCatalog: React.Dispatch<React.SetStateAction<Catalog | undefined>>
  setOrderData: React.Dispatch<
    React.SetStateAction<FORM_SCHEMA_TYPE | undefined>
  >
  nextPage: () => void
}

export default function CreateNewOrderPage1OrderForm({
  orderData,
  setCatalog,
  setOrderData,
  nextPage,
}: Props) {
  const { resortId } = useResort()
  const [showWarningDialog, setShowWarningDialog] = React.useState(false)
  const [warningMessage, setWarningMessage] = React.useState("")
  const [formDataToSubmit, setFormDataToSubmit] =
    React.useState<FORM_SCHEMA_TYPE | null>(null)

  const form = useForm<z.infer<typeof FORM_SCHEMA>>({
    resolver: zodResolver(FORM_SCHEMA),
    mode: "onChange",
    defaultValues: {
      name: orderData?.name || "",
      telephone: orderData?.telephone || "",
      email: orderData?.email || "",
      languageCode: orderData?.languageCode || "it",
      resortId,
      startDate: orderData?.startDate || new Date(),
      devices: orderData?.devices || [],
    },
  })
  const { control, watch, formState } = form

  const [resortCatalogs, setResortCatalogs] =
    React.useState<GetProductsAPIReturnType | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [productsError, setProductsError] = React.useState<{
    error: string
    errorType:
      | "validation"
      | "unknown"
      | "timeout"
      | "aborted"
      | "api_key_invalid"
      | "sales_channel_not_found"
  } | null>(null)

  // Watch form fields
  const [startDate, devices] = watch(["startDate", "devices"])

  // Fetch products when the start date changes
  React.useEffect(() => {
    setResortCatalogs(null)
    setProductsError(null)

    if (!startDate) return

    const fetchProducts = async () => {
      setLoading(true)
      const MAX_RETRIES = 3
      const RETRY_DELAY = 2000
      const formattedDate = _toLocalDateString(startDate)

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const payload = {
            resortId,
            startDate: formattedDate,
          }

          const response = await getProducts(payload)

          if (!response.success) {
            console.warn(`Attempt ${attempt + 1} failed:`, response.error)

            // For configuration errors (API key, sales channel), don't retry
            if (
              response.errorType === "api_key_invalid" ||
              response.errorType === "sales_channel_not_found"
            ) {
              setProductsError({
                error: response.error,
                errorType: response.errorType,
              })
              setLoading(false)
              return
            }

            if (attempt < MAX_RETRIES - 1) {
              await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
              continue
            }

            // Set error for final attempt
            setProductsError({
              error: response.error,
              errorType: response.errorType,
            })
            setLoading(false)
            return
          }

          setCatalog(response.data.catalogs[0])
          setResortCatalogs(response.data)
          setLoading(false)
          return // Exit the function if successful
        } catch (error) {
          console.warn(`Attempt ${attempt + 1} failed:`, error)

          if (attempt < MAX_RETRIES - 1) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
          }
        }
      }

      console.warn("All retry attempts failed.")
      setProductsError({
        error: "All retry attempts failed. Please try again later.",
        errorType: "unknown",
      })
      setLoading(false)
    }

    void fetchProducts()
  }, [startDate, resortId, setCatalog])

  // Handle retry for product loading
  const handleRetryProducts = React.useCallback(async () => {
    if (!startDate) return

    setProductsError(null)
    setResortCatalogs(null)
    setLoading(true)

    const formattedDate = _toLocalDateString(startDate)
    const payload = {
      resortId,
      startDate: formattedDate,
    }

    try {
      const response = await getProducts(payload)

      if (!response.success) {
        setProductsError({
          error: response.error,
          errorType: response.errorType,
        })
        setLoading(false)
        return
      }

      setCatalog(response.data.catalogs[0])
      setResortCatalogs(response.data)
      setLoading(false)
    } catch (error) {
      console.warn("Retry failed:", error)
      setProductsError({
        error: error instanceof Error ? error.message : "Retry failed",
        errorType: "unknown",
      })
      setLoading(false)
    }
  }, [startDate, resortId, setCatalog])

  // Validate if all device entries are complete
  const areDevicesComplete = devices?.every(
    (device) =>
      device.deviceId &&
      device.productId &&
      device.consumerCategoryId !== "" &&
      device.insurance !== undefined
  )

  // Check if there are any devices added
  const areDevicesAdded = devices?.length > 0

  const handleSubmit = async (data: z.infer<typeof FORM_SCHEMA>) => {
    // Check all devices
    const deviceStatuses = await Promise.all(
      data.devices.map(async (device) => {
        const result = await checkDeviceStatus(device.deviceId)
        if (!result.success) return null
        return validateDeviceStatus(result.data)
      })
    )

    // Filter out any failed checks and find devices with errors or warnings
    const devicesWithIssues = deviceStatuses
      .map((status, index) => ({
        status,
        deviceId: data.devices[index]?.deviceId,
      }))
      .filter(
        (
          item
        ): item is {
          status: NonNullable<typeof item.status>
          deviceId: string
        } => item.status !== null && (item.status.hasErrors || item.status.hasWarnings)
      )

    if (devicesWithIssues.length > 0) {
      // Build detailed warning message
      const messages = devicesWithIssues.map((item) => {
        const parts: string[] = [`Device ${item.deviceId}:`]

        if (item.status.summary.errors.length > 0) {
          parts.push(`  ❌ Errors: ${item.status.summary.errors.join(", ")}`)
        }

        if (item.status.summary.warnings.length > 0) {
          parts.push(`  ⚠️ Warnings: ${item.status.summary.warnings.join(", ")}`)
        }

        return parts.join("\n")
      })

      setWarningMessage(messages.join("\n\n"))
      setFormDataToSubmit(data)
      setShowWarningDialog(true)
      return
    }

    await submitForm(data)
  }

  const submitForm = async (data: z.infer<typeof FORM_SCHEMA>) => {
    const payload = {
      resortId,
      startDate: _toLocalDateString(data.startDate),
    }

    const result = await getProducts(payload)

    if (!result.success) {
      console.warn("Error fetching products:", result.error)
      return
    }

    setCatalog(result.data.catalogs[0])

    // Transform the form data into OrderData
    const orderData: FORM_SCHEMA_TYPE = {
      name: data.name,
      telephone: data.telephone,
      email: data.email,
      languageCode: data.languageCode,
      resortId,
      startDate: data.startDate,
      devices: data.devices.map((device) => ({
        deviceId: device.deviceId,
        productId: device.productId,
        consumerCategoryId: device.consumerCategoryId,
        insurance: device.insurance,
      })),
    }

    setOrderData(orderData)
    nextPage()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex w-full flex-col space-y-4 sm:space-y-5 md:space-y-6"
      >
        {/* Customer Information Section */}
        <div className="w-full space-y-2 sm:space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground sm:text-base">Customer Information</h3>
            <p className="text-xs text-muted-foreground sm:text-sm">Enter the customer details</p>
          </div>

            <div className="w-full space-y-3 rounded-lg border border-border bg-card p-3 sm:space-y-4 sm:p-4">
              <LanguageSelect control={control} />

              <NameInput control={control} />

              <FormField
                control={control}
                name="telephone"
                render={({ field }) => <TelephoneInput {...field} />}
              />

              <FormField
                control={control}
                name="email"
                render={({ field }) => <EmailInput {...field} />}
              />
            </div>
        </div>

        {/* Order Details Section */}
        <div className="w-full space-y-2 sm:space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground sm:text-base">Order Details</h3>
            <p className="text-xs text-muted-foreground sm:text-sm">Select the start date for the order</p>
          </div>

          <div className="w-full rounded-lg border border-border bg-card p-3 sm:p-4">
            <StartDatePicker control={control} />
          </div>
        </div>

        {/* Products Section */}
        <div className="w-full space-y-2 sm:space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground sm:text-base">Products & Devices</h3>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {loading ? "Loading available products..." : "Add devices and select products"}
            </p>
          </div>

          <div className="min-h-[150px] w-full rounded-lg border border-border bg-card p-3 sm:min-h-[200px] sm:p-4">
            {productsError ? (
              <ApiKeyErrorBoundary
                error={productsError.error}
                errorType={productsError.errorType}
                onRetry={handleRetryProducts}
                context="product_catalog"
                className="w-full"
              />
            ) : loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <span className="inline-block size-6 animate-spin rounded-full border-4 border-primary border-t-transparent sm:size-8" />
                  <span className="text-xs text-muted-foreground sm:text-sm">Loading products...</span>
                </div>
              </div>
            ) : resortCatalogs && resortCatalogs.catalogs.length > 0 ? (
              <DevicesArray
                control={control}
                devices={devices}
                resortCatalog={resortCatalogs.catalogs[0]!}
              />
            ) : (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                    No products available for the selected resort and date.
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                    Try selecting a different date.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            className="h-10 w-full rounded-lg bg-[#e7328a] text-sm font-semibold text-white shadow-sm hover:bg-[#e7328a]/90 disabled:opacity-50 sm:h-11 sm:text-base"
            type="submit"
            disabled={
              formState.isSubmitting ||
              !formState.isValid ||
              !areDevicesAdded ||
              !areDevicesComplete ||
              loading ||
              !!productsError
            }
          >
            {formState.isSubmitting ? "Processing..." : "Continue to Review"}
          </Button>
        </div>

        <AlertDialog
          open={showWarningDialog}
          onOpenChange={setShowWarningDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Warning: Unsuitable Devices</AlertDialogTitle>
              <AlertDialogDescription className="whitespace-pre-line">
                {warningMessage}
                {"\n\nDo you want to continue anyway?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (formDataToSubmit) {
                    void submitForm(formDataToSubmit)
                  }
                  setShowWarningDialog(false)
                }}
              >
                Continue Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </Form>
  )
}
