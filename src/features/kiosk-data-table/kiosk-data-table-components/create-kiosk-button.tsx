import React from "react"
import { createKioskHandler } from "@/db/server-actions/kiosk-actions/db-create-kiosk"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import useRowExpansionAndMobile from "@/hooks/use-row-expansion"
import { Button } from "@/components/ui/button"

import { CreateKioskDialog } from "./create-kiosk-modal"

const CreateKioskButton: React.FC = () => {
  const { isMobile } = useRowExpansionAndMobile()
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }
  const handleCreateKiosk = async (
    id: string,
    name: string,
    type: string,
    contentIds: string[],
    location: string,
    resortId: number
  ) => {
    // Handle the creation of the kiosk, e.g., send data to API or DB
    const req = {
      id,
      name,
      type,
      kioskContentIds: contentIds.map((id) => Number(id)),
      location: JSON.stringify({ label: location }),
      resortId,
    }
    try {
      await createKioskHandler(req)
      toast.success("Kiosk created successfully!")
      // Optionally, close the modal after successful creation
      handleCloseModal()
    } catch (error) {
      console.log("Failed to create kiosk:", error)
      // Optionally, display an error message
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenModal}
        className={`${isMobile ? "mb-3 w-full" : ""} `}
      >
        <Plus className="size-4" aria-hidden="true" />
        Add a Kiosk
      </Button>
      <CreateKioskDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCreate={handleCreateKiosk}
      />
    </>
  )
}

export default CreateKioskButton
